import { describe, it, expect } from "vitest";
import {
  calculateRendaFixaTax,
  calculateCapitalGainsTax,
  calculateDividendTax,
  calculateFiiDistributionTax,
  calculatePortfolioTax,
} from "../tax-engine";

describe("calculateRendaFixaTax", () => {
  it("calculates 17.5% on gains", () => {
    expect(calculateRendaFixaTax(100_000)).toBe(17_500);
  });

  it("returns 0 for zero gains", () => {
    expect(calculateRendaFixaTax(0)).toBe(0);
  });

  it("returns 0 for negative gains", () => {
    expect(calculateRendaFixaTax(-10_000)).toBe(0);
  });
});

describe("calculateCapitalGainsTax", () => {
  it("returns 0 below R$ 60k/quarter exemption", () => {
    expect(calculateCapitalGainsTax(50_000, 50_000)).toBe(0);
  });

  it("calculates 17.5% above exemption", () => {
    expect(calculateCapitalGainsTax(100_000, 100_000)).toBe(17_500);
  });

  it("returns 0 for negative gains", () => {
    expect(calculateCapitalGainsTax(100_000, -10_000)).toBe(0);
  });
});

describe("calculateDividendTax", () => {
  it("returns 0 below R$ 50k/month threshold", () => {
    expect(calculateDividendTax(40_000)).toBe(0);
  });

  it("calculates 10% above threshold", () => {
    expect(calculateDividendTax(80_000)).toBe(8_000);
  });

  it("returns 0 for zero dividends", () => {
    expect(calculateDividendTax(0)).toBe(0);
  });
});

describe("calculateFiiDistributionTax", () => {
  it("returns 0 (exempt distributions)", () => {
    expect(calculateFiiDistributionTax(10_000)).toBe(0);
  });
});

describe("calculatePortfolioTax", () => {
  it("calculates weighted tax for mixed allocation", () => {
    const allocation = {
      tesouroSelic: 50,
      tesouroIpca: 0,
      cdb: 0,
      lciLca: 50,
      acoes: 0,
      fiis: 0,
    };
    const totalGains = 100_000;
    const tax = calculatePortfolioTax(allocation, totalGains);
    // 50% renda fixa taxed at 17.5% + 50% isento = 50000 * 0.175 = 8750
    expect(tax).toBeCloseTo(8_750);
  });

  it("returns 0 for zero allocation", () => {
    const allocation = {
      tesouroSelic: 0,
      tesouroIpca: 0,
      cdb: 0,
      lciLca: 0,
      acoes: 0,
      fiis: 0,
    };
    expect(calculatePortfolioTax(allocation, 100_000)).toBe(0);
  });

  it("returns 0 for zero gains", () => {
    const allocation = {
      tesouroSelic: 100,
      tesouroIpca: 0,
      cdb: 0,
      lciLca: 0,
      acoes: 0,
      fiis: 0,
    };
    expect(calculatePortfolioTax(allocation, 0)).toBe(0);
  });
});
