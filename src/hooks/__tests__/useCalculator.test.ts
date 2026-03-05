import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCalculator } from "../useCalculator";

describe("useCalculator", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => useCalculator());

    expect(result.current.personalInfo.currentAge).toBe(30);
    expect(result.current.personalInfo.retirementAge).toBe(55);
    expect(result.current.financialInfo.netWorth).toBe(100_000);
    expect(result.current.allocation.tesouroSelic).toBe(20);
  });

  it("fireResult contains valid FIRE number", () => {
    const { result } = renderHook(() => useCalculator());

    expect(result.current.fireResult.fireNumber).toBeGreaterThan(0);
    expect(result.current.fireResult.yearsToFire).toBeGreaterThanOrEqual(0);
  });

  it("updating personal info triggers recalculation", () => {
    const { result } = renderHook(() => useCalculator());

    const initialFire = result.current.fireResult.fireNumber;

    act(() => {
      result.current.setPersonalInfo({
        currentAge: 30,
        retirementAge: 65,
      });
    });

    // FIRE number should be different with different retirement age
    // (INSS eligibility changes)
    expect(result.current.fireResult.retirementAge).toBe(65);
  });

  it("updating financial info with monthly period converts to annual correctly", () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.setFinancialInfo({
        ...result.current.financialInfo,
        expenses: 5000,
        expensesPeriod: "mensal",
      });
    });

    // 5000/month = 60000/year expenses, SWR 4% → FIRE = 1,500,000
    expect(result.current.fireResult.fireNumber).toBe(1_500_000);
  });

  it("projection has correct number of years", () => {
    const { result } = renderHook(() => useCalculator());

    // Default: age 30, life expectancy 90 → 61 years (inclusive)
    expect(result.current.projection).toHaveLength(61);
  });

  it("fireResult contains income values", () => {
    const { result } = renderHook(() => useCalculator());

    expect(result.current.fireResult.monthlyPassiveIncomeGross).toBeGreaterThan(0);
    expect(result.current.fireResult.monthlyPassiveIncomeNet).toBeGreaterThan(0);
    expect(result.current.fireResult.monthlyPassiveIncomeWithInss).toBeGreaterThanOrEqual(0);
  });
});
