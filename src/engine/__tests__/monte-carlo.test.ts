import { describe, it, expect } from "vitest";
import {
  runMonteCarloSimulation,
  normalRandom,
  choleskyDecompose,
  generateCorrelatedReturns,
  runWithdrawalAnalysis,
} from "../monte-carlo";
import { DEFAULT_ALLOCATION, CORRELATION_MATRIX } from "../constants";

describe("normalRandom", () => {
  it("produces mean ≈ 0 and stddev ≈ 1 over many samples", () => {
    const samples: number[] = [];
    let seed = 42;
    for (let i = 0; i < 10000; i++) {
      const [value, newSeed] = normalRandom(seed);
      samples.push(value);
      seed = newSeed;
    }
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance =
      samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
    const stddev = Math.sqrt(variance);

    expect(mean).toBeCloseTo(0, 1);
    expect(stddev).toBeCloseTo(1, 1);
  });
});

describe("choleskyDecompose", () => {
  it("returns identity for identity matrix", () => {
    const identity = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const L = choleskyDecompose(identity);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(L[i][j]).toBeCloseTo(i === j ? 1 : 0, 10);
      }
    }
  });

  it("decomposes correlation matrix without error", () => {
    const L = choleskyDecompose(CORRELATION_MATRIX);
    expect(L).toHaveLength(6);
    expect(L[0]).toHaveLength(6);
  });
});

describe("generateCorrelatedReturns", () => {
  it("produces values within plausible range", () => {
    const [returns, _newSeed] = generateCorrelatedReturns(DEFAULT_ALLOCATION, 42);
    for (const r of returns) {
      expect(r).not.toBeNaN();
      expect(r).toBeGreaterThan(-1);
      expect(r).toBeLessThan(2);
    }
  });
});

describe("runMonteCarloSimulation", () => {
  const baseParams = {
    currentAge: 30,
    retirementAge: 55,
    netWorth: 500_000,
    annualContribution: 60_000,
    annualExpenses: 60_000,
    allocation: DEFAULT_ALLOCATION,
    inflation: 0.04,
    swr: 0.04,
    inssBenefit: 0,
    inssEligibilityAge: 65,
    lifeExpectancy: 90,
    numSimulations: 100,
  };

  it("is deterministic (same seed → same results)", () => {
    const result1 = runMonteCarloSimulation({ ...baseParams, seed: 42 });
    const result2 = runMonteCarloSimulation({ ...baseParams, seed: 42 });
    expect(result1.percentiles.p50).toEqual(result2.percentiles.p50);
    expect(result1.successRate).toBe(result2.successRate);
  });

  it("returns correct number of simulations", () => {
    const result = runMonteCarloSimulation({ ...baseParams, seed: 42 });
    expect(result.simulations).toHaveLength(100);
  });

  it("has correct number of years per simulation", () => {
    const result = runMonteCarloSimulation({ ...baseParams, seed: 42 });
    const expectedYears = 90 - 30 + 1;
    expect(result.simulations[0]).toHaveLength(expectedYears);
    expect(result.years).toHaveLength(expectedYears);
  });

  it("has ordered percentiles at every year", () => {
    const result = runMonteCarloSimulation({ ...baseParams, seed: 42 });
    for (let i = 0; i < result.years.length; i++) {
      expect(result.percentiles.p5[i]).toBeLessThanOrEqual(
        result.percentiles.p25[i]
      );
      expect(result.percentiles.p25[i]).toBeLessThanOrEqual(
        result.percentiles.p50[i]
      );
      expect(result.percentiles.p50[i]).toBeLessThanOrEqual(
        result.percentiles.p75[i]
      );
      expect(result.percentiles.p75[i]).toBeLessThanOrEqual(
        result.percentiles.p95[i]
      );
    }
  });

  it("success rate is between 0 and 1", () => {
    const result = runMonteCarloSimulation({ ...baseParams, seed: 42 });
    expect(result.successRate).toBeGreaterThanOrEqual(0);
    expect(result.successRate).toBeLessThanOrEqual(1);
  });

  it("high portfolio + low expenses → near 1.0 success", () => {
    const result = runMonteCarloSimulation({
      ...baseParams,
      netWorth: 10_000_000,
      annualExpenses: 12_000,
      seed: 42,
    });
    expect(result.successRate).toBeGreaterThanOrEqual(0.9);
  });

  it("zero portfolio + high expenses → near 0.0 success", () => {
    const result = runMonteCarloSimulation({
      ...baseParams,
      netWorth: 0,
      annualContribution: 0,
      annualExpenses: 120_000,
      retirementAge: 31,
      seed: 42,
    });
    expect(result.successRate).toBeLessThanOrEqual(0.1);
  });
});

describe("runWithdrawalAnalysis", () => {
  it("returns entries for each SWR level", () => {
    const result = runWithdrawalAnalysis({
      currentAge: 30,
      retirementAge: 55,
      netWorth: 1_000_000,
      annualContribution: 60_000,
      annualExpenses: 60_000,
      allocation: DEFAULT_ALLOCATION,
      inflation: 0.04,
      inssBenefit: 0,
      inssEligibilityAge: 65,
      lifeExpectancy: 90,
      seed: 42,
      numSimulations: 50,
    });
    expect(result).toHaveLength(5);
    expect(result.map((r) => r.swr)).toEqual([0.03, 0.035, 0.04, 0.045, 0.05]);
  });

  it("lower SWR has higher or equal success rate", () => {
    const result = runWithdrawalAnalysis({
      currentAge: 30,
      retirementAge: 55,
      netWorth: 1_000_000,
      annualContribution: 60_000,
      annualExpenses: 60_000,
      allocation: DEFAULT_ALLOCATION,
      inflation: 0.04,
      inssBenefit: 0,
      inssEligibilityAge: 65,
      lifeExpectancy: 90,
      seed: 42,
      numSimulations: 50,
    });
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].successRate).toBeGreaterThanOrEqual(
        result[i].successRate
      );
    }
  });
});
