import type { AssetAllocation, MonteCarloResult, WithdrawalAnalysisEntry } from "./types";
import { ASSET_CLASS_PARAMS, ASSET_CLASSES, CORRELATION_MATRIX, SWR_ANALYSIS_RATES } from "./constants";
import { getNetReturnRate } from "./tax-engine";

// Seeded PRNG (mulberry32) — stateful version for hot loops
function createRng(seed: number) {
  let state = seed | 0;
  return {
    next(): number {
      state = (state + 0x6d2b79f5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    getState(): number {
      return state;
    },
  };
}

// Exported for backward-compat with tests
export function normalRandom(seed: number): [number, number] {
  const rng = createRng(seed);
  const u1 = rng.next();
  const u2 = rng.next();
  const z = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
  return [z, seed + 2];
}

export function choleskyDecompose(matrix: number[][]): number[][] {
  const n = matrix.length;
  const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }
      if (i === j) {
        L[i][j] = Math.sqrt(Math.max(0, matrix[i][i] - sum));
      } else {
        L[i][j] = L[j][j] !== 0 ? (matrix[i][j] - sum) / L[j][j] : 0;
      }
    }
  }
  return L;
}

// Cache Cholesky decomposition — same correlation matrix always
const cachedL = choleskyDecompose(CORRELATION_MATRIX);

// Precompute asset params arrays for hot loop
const ASSET_MEAN_RETURNS = ASSET_CLASSES.map((k) => ASSET_CLASS_PARAMS[k].meanReturn);
const ASSET_STD_DEVS = ASSET_CLASSES.map((k) => ASSET_CLASS_PARAMS[k].stdDev);
const ASSET_TAX_CATEGORIES = ASSET_CLASSES.map((k) => ASSET_CLASS_PARAMS[k].taxCategory);
const NUM_ASSETS = ASSET_CLASSES.length;
const TWO_PI = 2 * Math.PI;

// Exported for backward-compat with tests
export function generateCorrelatedReturns(
  allocation: AssetAllocation,
  seed: number
): [number[], number] {
  const rng = createRng(seed);
  const z = new Array(NUM_ASSETS);
  for (let i = 0; i < NUM_ASSETS; i++) {
    const u1 = rng.next();
    const u2 = rng.next();
    z[i] = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(TWO_PI * u2);
  }

  const returns = new Array(NUM_ASSETS);
  for (let i = 0; i < NUM_ASSETS; i++) {
    let val = 0;
    const Li = cachedL[i];
    for (let j = 0; j <= i; j++) {
      val += Li[j] * z[j];
    }
    returns[i] = ASSET_MEAN_RETURNS[i] + ASSET_STD_DEVS[i] * val;
  }

  return [returns, seed + NUM_ASSETS * 2];
}

// Inlined correlated return generation using a stateful rng (no seed passing overhead)
function generateCorrelatedReturnsFast(
  rng: { next(): number },
  returnsOut: number[]
): void {
  // Generate Box-Muller normals directly
  for (let i = 0; i < NUM_ASSETS; i++) {
    const u1 = rng.next();
    const u2 = rng.next();
    returnsOut[i] = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(TWO_PI * u2);
  }

  // Apply Cholesky in-place (z → correlated → returns)
  // Process in reverse to allow in-place transformation
  for (let i = NUM_ASSETS - 1; i >= 0; i--) {
    let val = 0;
    const Li = cachedL[i];
    for (let j = 0; j <= i; j++) {
      val += Li[j] * returnsOut[j];
    }
    returnsOut[i] = ASSET_MEAN_RETURNS[i] + ASSET_STD_DEVS[i] * val;
  }
}

function getPercentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lower = idx | 0;
  const upper = lower + (lower < idx ? 1 : 0);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

interface MonteCarloParams {
  currentAge: number;
  retirementAge: number;
  netWorth: number;
  annualContribution: number;
  annualExpenses: number;
  allocation: AssetAllocation;
  inflation: number;
  swr: number;
  inssBenefit: number;
  inssEligibilityAge: number;
  lifeExpectancy: number;
  numSimulations?: number;
  seed?: number;
  /** When true, withdrawal = swr × portfolio at retirement start, adjusted for inflation */
  useSwrBasedWithdrawal?: boolean;
  /** Override: use a single return rate instead of correlated asset returns */
  overrideReturnRate?: number;
  /** Std dev to use with overrideReturnRate (defaults to 0.10) */
  overrideStdDev?: number;
}

export function runMonteCarloSimulation(
  params: MonteCarloParams
): MonteCarloResult {
  const {
    currentAge,
    retirementAge,
    netWorth,
    annualContribution,
    annualExpenses,
    allocation,
    inflation,
    swr,
    inssBenefit,
    inssEligibilityAge,
    lifeExpectancy,
    numSimulations = 1000,
    seed = 42,
    useSwrBasedWithdrawal = false,
    overrideReturnRate,
    overrideStdDev = 0.10,
  } = params;

  const useSimple = overrideReturnRate !== undefined;

  const totalYears = lifeExpectancy - currentAge + 1;
  const years = Array.from({ length: totalYears }, (_, i) => currentAge + i);

  // Precompute allocation weights and net return multipliers
  const totalAlloc = ASSET_CLASSES.reduce((sum, key) => sum + allocation[key], 0);
  const weights = new Float64Array(NUM_ASSETS);
  const netReturnMultipliers = new Float64Array(NUM_ASSETS);

  if (!useSimple && totalAlloc > 0) {
    for (let i = 0; i < NUM_ASSETS; i++) {
      weights[i] = allocation[ASSET_CLASSES[i]] / totalAlloc;
    }
  }

  // Precompute tax multipliers per asset
  if (!useSimple) {
    for (let i = 0; i < NUM_ASSETS; i++) {
      const cat = ASSET_TAX_CATEGORIES[i];
      switch (cat) {
        case "rendaFixa": netReturnMultipliers[i] = 1 - 0.175; break;
        case "isento": netReturnMultipliers[i] = 1; break;
        case "rendaVariavel": netReturnMultipliers[i] = 1 - 0.175; break;
        case "fii": netReturnMultipliers[i] = 0.95; break;
        default: netReturnMultipliers[i] = 1;
      }
    }
  }

  // Precompute inflation table
  const inflationMultipliers = new Float64Array(totalYears);
  inflationMultipliers[0] = 1;
  for (let i = 1; i < totalYears; i++) {
    inflationMultipliers[i] = inflationMultipliers[i - 1] * (1 + inflation);
  }

  // Precompute which years are retired / inss-eligible
  const isRetiredArr = new Uint8Array(totalYears);
  const isInssEligibleArr = new Uint8Array(totalYears);
  for (let i = 0; i < totalYears; i++) {
    const age = currentAge + i;
    isRetiredArr[i] = age >= retirementAge ? 1 : 0;
    isInssEligibleArr[i] = (age >= inssEligibilityAge && inssBenefit > 0) ? 1 : 0;
  }

  const inssBenefitAnnual = inssBenefit * 12;

  // Index of the first retirement year (for SWR-based inflation adjustment)
  const retirementYearIdx = retirementAge - currentAge;

  // Run simulations — store as flat array for cache efficiency
  const allBalances = new Float64Array(numSimulations * totalYears);
  const grossReturns = new Array(NUM_ASSETS);

  for (let sim = 0; sim < numSimulations; sim++) {
    const rng = createRng(seed + sim * 1000);
    let balance = netWorth;
    const offset = sim * totalYears;
    let swrBaseWithdrawal = 0; // Set at retirement start for SWR mode

    for (let yearIdx = 0; yearIdx < totalYears; yearIdx++) {
      allBalances[offset + yearIdx] = balance > 0 ? balance : 0;

      let netReturn: number;
      if (useSimple) {
        // Simple mode: single normal distribution
        const u1 = rng.next();
        const u2 = rng.next();
        const z = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(TWO_PI * u2);
        const grossReturn = overrideReturnRate! + overrideStdDev * z;
        netReturn = grossReturn > -0.5 ? grossReturn : -0.5;
      } else {
        // Generate correlated returns
        generateCorrelatedReturnsFast(rng, grossReturns);

        // Compute weighted net return inline
        netReturn = 0;
        for (let i = 0; i < NUM_ASSETS; i++) {
          const gr = grossReturns[i] > -0.5 ? grossReturns[i] : -0.5;
          netReturn += weights[i] * gr * netReturnMultipliers[i];
        }
      }

      const returns = balance * netReturn;

      if (isRetiredArr[yearIdx]) {
        // On the first retirement year in SWR mode, lock the base withdrawal
        if (useSwrBasedWithdrawal && yearIdx === retirementYearIdx) {
          swrBaseWithdrawal = swr * balance;
        }

        const yearsInRetirement = yearIdx - retirementYearIdx;
        const inflationSinceRetirement = Math.pow(1 + inflation, yearsInRetirement);
        const inssAnnual = isInssEligibleArr[yearIdx] ? inssBenefitAnnual * inflationSinceRetirement : 0;

        const baseExpense = useSwrBasedWithdrawal
          ? swrBaseWithdrawal
          : annualExpenses;
        const withdrawal = baseExpense * inflationSinceRetirement - inssAnnual;
        balance = balance + returns - (withdrawal > 0 ? withdrawal : 0);
      } else {
        balance = balance + returns + annualContribution;
      }

      if (balance < 0) balance = 0;
    }
  }

  // Calculate percentiles — sort column values once, extract all percentiles
  const percentiles = {
    p5: new Array(totalYears) as number[],
    p10: new Array(totalYears) as number[],
    p25: new Array(totalYears) as number[],
    p50: new Array(totalYears) as number[],
    p75: new Array(totalYears) as number[],
    p90: new Array(totalYears) as number[],
    p95: new Array(totalYears) as number[],
  };

  const columnValues = new Float64Array(numSimulations);

  for (let yearIdx = 0; yearIdx < totalYears; yearIdx++) {
    // Extract column
    for (let sim = 0; sim < numSimulations; sim++) {
      columnValues[sim] = allBalances[sim * totalYears + yearIdx];
    }
    // Sort (Float64Array.sort uses optimized native sort)
    columnValues.sort();

    // Copy to a regular array for getPercentile
    const sorted = Array.from(columnValues);

    percentiles.p5[yearIdx] = getPercentile(sorted, 5);
    percentiles.p10[yearIdx] = getPercentile(sorted, 10);
    percentiles.p25[yearIdx] = getPercentile(sorted, 25);
    percentiles.p50[yearIdx] = getPercentile(sorted, 50);
    percentiles.p75[yearIdx] = getPercentile(sorted, 75);
    percentiles.p90[yearIdx] = getPercentile(sorted, 90);
    percentiles.p95[yearIdx] = getPercentile(sorted, 95);
  }

  // Calculate success rate
  const lastYearIdx = totalYears - 1;
  let successes = 0;
  for (let sim = 0; sim < numSimulations; sim++) {
    if (allBalances[sim * totalYears + lastYearIdx] > 0) successes++;
  }
  const successRate = successes / numSimulations;

  // Convert flat array to nested for API compat
  const simulations: number[][] = [];
  for (let sim = 0; sim < numSimulations; sim++) {
    const offset = sim * totalYears;
    simulations.push(Array.from(allBalances.subarray(offset, offset + totalYears)));
  }

  return { simulations, percentiles, successRate, years };
}

interface WithdrawalAnalysisParams {
  currentAge: number;
  retirementAge: number;
  netWorth: number;
  annualContribution: number;
  annualExpenses: number;
  allocation: AssetAllocation;
  inflation: number;
  inssBenefit: number;
  inssEligibilityAge: number;
  lifeExpectancy: number;
  numSimulations?: number;
  seed?: number;
  overrideReturnRate?: number;
  overrideStdDev?: number;
}

export function runWithdrawalAnalysis(
  params: WithdrawalAnalysisParams
): WithdrawalAnalysisEntry[] {
  const results: WithdrawalAnalysisEntry[] = [];

  for (const swr of SWR_ANALYSIS_RATES) {
    const mcResult = runMonteCarloSimulation({
      ...params,
      swr,
      useSwrBasedWithdrawal: true,
      numSimulations: params.numSimulations || 200,
      seed: params.seed || 42,
    });

    const lastIdx = mcResult.simulations[0].length - 1;
    const finalBalances = mcResult.simulations.map((sim) => sim[lastIdx]);
    const sorted = [...finalBalances].sort((a, b) => a - b);
    const medianFinalBalance = sorted[Math.floor(sorted.length / 2)];

    results.push({
      swr,
      successRate: mcResult.successRate,
      medianFinalBalance,
    });
  }

  return results;
}
