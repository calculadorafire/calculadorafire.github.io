import { describe, it, expect } from "vitest";
import {
  calculateFireNumber,
  calculateYearsToFire,
  generateProjection,
  calculateWeightedReturn,
} from "../fire-calculator";
import { DEFAULT_ALLOCATION } from "../constants";

describe("calculateFireNumber", () => {
  it("calculates FIRE number without INSS", () => {
    // 5000/month = 60000/year, SWR 4%: 60000/0.04 = 1_500_000
    expect(calculateFireNumber(60_000, 0.04, 0, 65, 55)).toBe(1_500_000);
  });

  it("reduces FIRE number with INSS when eligible", () => {
    // expenses 60000, INSS 2500/month = 30000/year, net needed: 30000, /0.04 = 750000
    expect(calculateFireNumber(60_000, 0.04, 2_500, 65, 65)).toBe(750_000);
  });

  it("ignores INSS when retirement age < eligibility age", () => {
    expect(calculateFireNumber(60_000, 0.04, 2_500, 65, 50)).toBe(1_500_000);
  });

  it("handles zero expenses", () => {
    expect(calculateFireNumber(0, 0.04, 0, 65, 55)).toBe(0);
  });
});

describe("calculateWeightedReturn", () => {
  it("returns single asset return for 100% allocation", () => {
    const allocation = {
      tesouroSelic: 100,
      tesouroIpca: 0,
      cdb: 0,
      lciLca: 0,
      acoes: 0,
      fiis: 0,
    };
    // Tesouro Selic mean return is 10.75%, after 17.5% tax: 0.1075 * (1-0.175) = 0.0886875
    const result = calculateWeightedReturn(allocation);
    expect(result).toBeCloseTo(0.0886875, 4);
  });

  it("returns weighted average for 50/50 split", () => {
    const allocation = {
      tesouroSelic: 50,
      tesouroIpca: 0,
      cdb: 0,
      lciLca: 50,
      acoes: 0,
      fiis: 0,
    };
    // Selic: 10.75% * 0.825 = 8.87%, LCI/LCA: 9.5% (isento)
    // avg: (8.87% + 9.5%) / 2 = 9.185%
    const result = calculateWeightedReturn(allocation);
    expect(result).toBeCloseTo(0.091844, 3);
  });
});

describe("calculateYearsToFire", () => {
  it("returns 0 if already at FIRE number", () => {
    const years = calculateYearsToFire(
      1_500_000,
      60_000,
      1_500_000,
      DEFAULT_ALLOCATION
    );
    expect(years).toBe(0);
  });

  it("returns positive years for realistic scenario", () => {
    const years = calculateYearsToFire(
      100_000,
      60_000,
      1_500_000,
      DEFAULT_ALLOCATION
    );
    expect(years).toBeGreaterThan(0);
    expect(years).toBeLessThan(50);
  });
});

describe("generateProjection", () => {
  it("returns correct number of years", () => {
    const projection = generateProjection({
      currentAge: 30,
      retirementAge: 55,
      netWorth: 100_000,
      annualContribution: 60_000,
      annualExpenses: 60_000,
      allocation: DEFAULT_ALLOCATION,
      inflation: 0.04,
      swr: 0.04,
      inssBenefit: 0,
      inssEligibilityAge: 65,
      lifeExpectancy: 90,
    });
    expect(projection).toHaveLength(61); // 90 - 30 + 1 (inclusive)
  });

  it("shows accumulation phase before retirement", () => {
    const projection = generateProjection({
      currentAge: 30,
      retirementAge: 55,
      netWorth: 100_000,
      annualContribution: 60_000,
      annualExpenses: 60_000,
      allocation: DEFAULT_ALLOCATION,
      inflation: 0.04,
      swr: 0.04,
      inssBenefit: 0,
      inssEligibilityAge: 65,
      lifeExpectancy: 90,
    });
    expect(projection[0].phase).toBe("accumulation");
    expect(projection[0].age).toBe(30);
  });

  it("shows retirement phase after retirement age", () => {
    const projection = generateProjection({
      currentAge: 30,
      retirementAge: 55,
      netWorth: 100_000,
      annualContribution: 60_000,
      annualExpenses: 60_000,
      allocation: DEFAULT_ALLOCATION,
      inflation: 0.04,
      swr: 0.04,
      inssBenefit: 0,
      inssEligibilityAge: 65,
      lifeExpectancy: 90,
    });
    const retirementYear = projection.find((p) => p.age === 55);
    expect(retirementYear?.phase).toBe("retirement");
  });

  it("includes INSS income after eligibility age", () => {
    const projection = generateProjection({
      currentAge: 30,
      retirementAge: 55,
      netWorth: 100_000,
      annualContribution: 60_000,
      annualExpenses: 60_000,
      allocation: DEFAULT_ALLOCATION,
      inflation: 0.04,
      swr: 0.04,
      inssBenefit: 2_000,
      inssEligibilityAge: 65,
      lifeExpectancy: 90,
    });
    const beforeInss = projection.find((p) => p.age === 64);
    const afterInss = projection.find((p) => p.age === 65);
    expect(beforeInss?.inssIncome).toBe(0);
    expect(afterInss?.inssIncome).toBeGreaterThan(0);
  });
});
