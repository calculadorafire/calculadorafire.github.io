import type { AssetAllocation, YearProjection } from "./types";
import { ASSET_CLASS_PARAMS, ASSET_CLASSES } from "./constants";
import { getNetReturnRate } from "./tax-engine";

export function calculateFireNumber(
  annualExpenses: number,
  swr: number,
  inssBenefitMonthly: number,
  inssEligibilityAge: number,
  retirementAge: number
): number {
  if (annualExpenses <= 0) return 0;

  const inssAnnual =
    retirementAge >= inssEligibilityAge ? inssBenefitMonthly * 12 : 0;
  const netExpenses = Math.max(0, annualExpenses - inssAnnual);

  return netExpenses / swr;
}

export function calculateWeightedReturn(allocation: AssetAllocation): number {
  const totalAlloc = ASSET_CLASSES.reduce(
    (sum, key) => sum + allocation[key],
    0
  );
  if (totalAlloc === 0) return 0;

  let weightedReturn = 0;

  for (const key of ASSET_CLASSES) {
    const weight = allocation[key] / totalAlloc;
    const params = ASSET_CLASS_PARAMS[key];
    const netReturn = getNetReturnRate(params.meanReturn, params.taxCategory);
    weightedReturn += weight * netReturn;
  }

  return weightedReturn;
}

export function calculateYearsToFire(
  netWorth: number,
  annualContribution: number,
  fireNumber: number,
  allocation: AssetAllocation,
  inflation: number = 0,
  overrideReturnRate?: number
): number {
  if (netWorth >= fireNumber) return 0;
  if (fireNumber <= 0) return 0;

  const nominalReturn = overrideReturnRate ?? calculateWeightedReturn(allocation);
  let balance = netWorth;

  for (let year = 1; year <= 100; year++) {
    balance = balance * (1 + nominalReturn) + annualContribution;
    if (balance >= fireNumber) return year;
  }

  return 100;
}

interface ProjectionParams {
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
  overrideReturnRate?: number;
}

export function generateProjection(params: ProjectionParams): YearProjection[] {
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
    overrideReturnRate,
  } = params;

  const annualReturn = overrideReturnRate ?? calculateWeightedReturn(allocation);
  const totalYears = lifeExpectancy - currentAge;
  const projection: YearProjection[] = [];

  let balance = netWorth;
  let inflationAdjustedExpenses = annualExpenses;
  let inflationAdjustedInss = inssBenefit * 12;

  for (let i = 0; i <= totalYears; i++) {
    const age = currentAge + i;
    const isRetired = age >= retirementAge;
    const inssEligible = age >= inssEligibilityAge && inssBenefit > 0;

    const returns = balance * annualReturn;
    const inssIncome = isRetired && inssEligible ? inflationAdjustedInss : 0;

    let contributions = 0;
    let withdrawals = 0;
    let taxes = 0;

    if (!isRetired) {
      contributions = annualContribution;
    } else {
      withdrawals = Math.max(0, inflationAdjustedExpenses - inssIncome);
    }

    projection.push({
      age,
      year: i,
      balance: Math.max(0, balance),
      contributions,
      withdrawals,
      returns,
      taxes,
      inssIncome,
      phase: isRetired ? "retirement" : "accumulation",
    });

    // Update balance for next year
    if (!isRetired) {
      balance = balance + returns + contributions;
    } else {
      balance = balance + returns - withdrawals;
    }
    balance = Math.max(0, balance);

    // Inflation-adjust expenses and INSS
    inflationAdjustedExpenses *= 1 + inflation;
    inflationAdjustedInss *= 1 + inflation;
  }

  return projection;
}
