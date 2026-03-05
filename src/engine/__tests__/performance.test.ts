import { describe, it, expect } from "vitest";
import { runMonteCarloSimulation, runWithdrawalAnalysis } from "../monte-carlo";
import { generateProjection, calculateFireNumber, calculateYearsToFire, calculateWeightedReturn } from "../fire-calculator";
import { DEFAULT_ALLOCATION } from "../constants";

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
};

describe("Performance benchmarks", () => {
  it("calculateFireNumber", () => {
    const start = performance.now();
    for (let i = 0; i < 10_000; i++) {
      calculateFireNumber(60_000, 0.04, 0, 65, 55);
    }
    const elapsed = performance.now() - start;
    console.log(`calculateFireNumber x10000: ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(100);
  });

  it("calculateWeightedReturn", () => {
    const start = performance.now();
    for (let i = 0; i < 10_000; i++) {
      calculateWeightedReturn(DEFAULT_ALLOCATION);
    }
    const elapsed = performance.now() - start;
    console.log(`calculateWeightedReturn x10000: ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(100);
  });

  it("calculateYearsToFire", () => {
    const start = performance.now();
    for (let i = 0; i < 1_000; i++) {
      calculateYearsToFire(100_000, 60_000, 1_500_000, DEFAULT_ALLOCATION);
    }
    const elapsed = performance.now() - start;
    console.log(`calculateYearsToFire x1000: ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(500);
  });

  it("generateProjection", () => {
    const start = performance.now();
    for (let i = 0; i < 1_000; i++) {
      generateProjection(baseParams);
    }
    const elapsed = performance.now() - start;
    console.log(`generateProjection x1000: ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(500);
  });

  it("Monte Carlo 1000 simulations", () => {
    const start = performance.now();
    runMonteCarloSimulation({ ...baseParams, numSimulations: 1000, seed: 42 });
    const elapsed = performance.now() - start;
    console.log(`Monte Carlo 1000 sims: ${elapsed.toFixed(1)}ms`);
  });

  it("Monte Carlo 200 simulations", () => {
    const start = performance.now();
    runMonteCarloSimulation({ ...baseParams, numSimulations: 200, seed: 42 });
    const elapsed = performance.now() - start;
    console.log(`Monte Carlo 200 sims: ${elapsed.toFixed(1)}ms`);
  });

  it("withdrawalAnalysis (5 SWR x 200 sims)", () => {
    const start = performance.now();
    runWithdrawalAnalysis({ ...baseParams, numSimulations: 200, seed: 42 });
    const elapsed = performance.now() - start;
    console.log(`withdrawalAnalysis 5x200: ${elapsed.toFixed(1)}ms`);
  });

  it("choleskyDecompose called per-year breakdown", () => {
    // Profile a single sim to see per-year cost
    const start = performance.now();
    runMonteCarloSimulation({ ...baseParams, numSimulations: 1, seed: 42 });
    const elapsed = performance.now() - start;
    console.log(`Monte Carlo 1 sim: ${elapsed.toFixed(1)}ms`);
  });

  it("Full useCalculator equivalent workload", () => {
    const start = performance.now();

    // This mirrors what useCalculator does on every input change:
    calculateFireNumber(60_000, 0.04, 0, 65, 55);
    calculateYearsToFire(100_000, 60_000, 1_500_000, DEFAULT_ALLOCATION);
    generateProjection(baseParams);
    runMonteCarloSimulation({ ...baseParams, numSimulations: 1000, seed: 42 });
    runWithdrawalAnalysis({ ...baseParams, numSimulations: 200, seed: 42 });

    const elapsed = performance.now() - start;
    console.log(`TOTAL useCalculator workload: ${elapsed.toFixed(1)}ms`);
  });
});
