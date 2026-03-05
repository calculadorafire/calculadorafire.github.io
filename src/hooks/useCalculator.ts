"use client";

import { useState, useMemo, useEffect } from "react";
import type {
  PersonalInfo,
  FinancialInfo,
  AssetAllocation,
  Assumptions,
  ReturnMode,
  FireResult,
  YearProjection,
  MonteCarloResult,
  WithdrawalAnalysisEntry,
} from "@/engine/types";
import { DEFAULT_ALLOCATION, DEFAULT_ASSUMPTIONS, DEFAULT_RETURN_MODE } from "@/engine/constants";
import {
  calculateFireNumber,
  calculateYearsToFire,
  calculateWeightedReturn,
  generateProjection,
} from "@/engine/fire-calculator";
import {
  runMonteCarloSimulation,
  runWithdrawalAnalysis,
} from "@/engine/monte-carlo";
import { toAnnual } from "@/engine/utils";
import { useDebounce } from "./useDebounce";

const STORAGE_KEY = "firecalcbr-inputs";

interface StoredInputs {
  personalInfo: PersonalInfo;
  financialInfo: FinancialInfo;
  allocation: AssetAllocation;
  assumptions: Assumptions;
  returnMode: ReturnMode;
}

function loadStoredInputs(): Partial<StoredInputs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<StoredInputs>;
  } catch {
    return {};
  }
}

const defaultPersonalInfo: PersonalInfo = {
  currentAge: 30,
  retirementAge: 55,
};

const defaultFinancialInfo: FinancialInfo = {
  netWorth: 100_000,
  income: 10_000,
  incomePeriod: "mensal",
  expenses: 5_000,
  expensesPeriod: "mensal",
  contribution: 3_000,
  contributionPeriod: "mensal",
};

export function useCalculator() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(defaultPersonalInfo);
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo>(defaultFinancialInfo);
  const [allocation, setAllocation] = useState<AssetAllocation>(DEFAULT_ALLOCATION);
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [returnMode, setReturnMode] = useState<ReturnMode>(DEFAULT_RETURN_MODE);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadStoredInputs();
    if (stored.personalInfo) setPersonalInfo(stored.personalInfo);
    if (stored.financialInfo) setFinancialInfo(stored.financialInfo);
    if (stored.allocation) setAllocation(stored.allocation);
    if (stored.assumptions) setAssumptions(stored.assumptions);
    if (stored.returnMode) setReturnMode(stored.returnMode);
    setHydrated(true);
  }, []);

  // Persist to localStorage on changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const data: StoredInputs = { personalInfo, financialInfo, allocation, assumptions, returnMode };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage full or unavailable — ignore
    }
  }, [hydrated, personalInfo, financialInfo, allocation, assumptions, returnMode]);

  const overrideRate = returnMode.useSimpleReturn ? returnMode.simpleReturnRate : undefined;
  const effectiveInssBenefit = assumptions.includeInss ? assumptions.inssBenefit : 0;

  const [monteCarloResult, setMonteCarloResult] =
    useState<MonteCarloResult | null>(null);
  const [withdrawalAnalysis, setWithdrawalAnalysis] = useState<
    WithdrawalAnalysisEntry[]
  >([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Convert to annual values
  const annualExpenses = toAnnual(
    financialInfo.expenses,
    financialInfo.expensesPeriod
  );
  const annualContribution = toAnnual(
    financialInfo.contribution,
    financialInfo.contributionPeriod
  );

  // Deterministic calculations (instant)
  const fireNumberWithoutInss = useMemo(
    () =>
      calculateFireNumber(
        annualExpenses,
        assumptions.safeWithdrawalRate,
        0,
        assumptions.inssEligibilityAge,
        personalInfo.retirementAge
      ),
    [
      annualExpenses,
      assumptions.safeWithdrawalRate,
      assumptions.inssEligibilityAge,
      personalInfo.retirementAge,
    ]
  );

  const fireResult: FireResult = useMemo(() => {
    const fireNumber = calculateFireNumber(
      annualExpenses,
      assumptions.safeWithdrawalRate,
      effectiveInssBenefit,
      assumptions.inssEligibilityAge,
      personalInfo.retirementAge
    );

    const yearsToFire = calculateYearsToFire(
      financialInfo.netWorth,
      annualContribution,
      fireNumber,
      allocation,
      assumptions.inflation,
      overrideRate
    );

    const weightedReturn = overrideRate ?? calculateWeightedReturn(allocation);
    const monthlyPassiveIncomeNet = annualExpenses / 12;
    const monthlyPassiveIncomeGross =
      monthlyPassiveIncomeNet / (1 - 0.175); // Approximate avg tax
    const inssMonthly =
      personalInfo.retirementAge >= assumptions.inssEligibilityAge
        ? effectiveInssBenefit
        : 0;
    const monthlyPassiveIncomeWithInss =
      monthlyPassiveIncomeNet + inssMonthly;

    return {
      fireNumber,
      yearsToFire,
      retirementAge: personalInfo.retirementAge,
      monthlyPassiveIncomeGross,
      monthlyPassiveIncomeNet,
      monthlyPassiveIncomeWithInss,
    };
  }, [
    personalInfo,
    financialInfo.netWorth,
    annualExpenses,
    annualContribution,
    allocation,
    assumptions,
    overrideRate,
  ]);

  const projection: YearProjection[] = useMemo(
    () =>
      generateProjection({
        currentAge: personalInfo.currentAge,
        retirementAge: personalInfo.retirementAge,
        netWorth: financialInfo.netWorth,
        annualContribution,
        annualExpenses,
        allocation,
        inflation: assumptions.inflation,
        swr: assumptions.safeWithdrawalRate,
        inssBenefit: effectiveInssBenefit,
        inssEligibilityAge: assumptions.inssEligibilityAge,
        lifeExpectancy: assumptions.lifeExpectancy,
        overrideReturnRate: overrideRate,
      }),
    [
      personalInfo,
      financialInfo.netWorth,
      annualContribution,
      annualExpenses,
      allocation,
      assumptions,
      overrideRate,
    ]
  );

  // Debounce inputs for Monte Carlo (expensive computation)
  const debouncedInputs = useDebounce(
    {
      personalInfo,
      financialInfo: {
        netWorth: financialInfo.netWorth,
        annualContribution,
        annualExpenses,
      },
      allocation,
      assumptions,
      overrideRate,
      effectiveInssBenefit,
    },
    500
  );

  // Run Monte Carlo on debounced inputs
  useEffect(() => {
    setIsCalculating(true);

    // Use setTimeout to avoid blocking the UI
    const timer = setTimeout(() => {
      const mcResult = runMonteCarloSimulation({
        currentAge: debouncedInputs.personalInfo.currentAge,
        retirementAge: debouncedInputs.personalInfo.retirementAge,
        netWorth: debouncedInputs.financialInfo.netWorth,
        annualContribution: debouncedInputs.financialInfo.annualContribution,
        annualExpenses: debouncedInputs.financialInfo.annualExpenses,
        allocation: debouncedInputs.allocation,
        inflation: debouncedInputs.assumptions.inflation,
        swr: debouncedInputs.assumptions.safeWithdrawalRate,
        inssBenefit: debouncedInputs.effectiveInssBenefit,
        inssEligibilityAge: debouncedInputs.assumptions.inssEligibilityAge,
        lifeExpectancy: debouncedInputs.assumptions.lifeExpectancy,
        numSimulations: 1000,
        seed: 42,
        overrideReturnRate: debouncedInputs.overrideRate,
      });

      const waResult = runWithdrawalAnalysis({
        currentAge: debouncedInputs.personalInfo.currentAge,
        retirementAge: debouncedInputs.personalInfo.retirementAge,
        netWorth: debouncedInputs.financialInfo.netWorth,
        annualContribution: debouncedInputs.financialInfo.annualContribution,
        annualExpenses: debouncedInputs.financialInfo.annualExpenses,
        allocation: debouncedInputs.allocation,
        inflation: debouncedInputs.assumptions.inflation,
        inssBenefit: debouncedInputs.effectiveInssBenefit,
        inssEligibilityAge: debouncedInputs.assumptions.inssEligibilityAge,
        lifeExpectancy: debouncedInputs.assumptions.lifeExpectancy,
        numSimulations: 200,
        seed: 42,
        overrideReturnRate: debouncedInputs.overrideRate,
      });

      setMonteCarloResult(mcResult);
      setWithdrawalAnalysis(waResult);
      setIsCalculating(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [debouncedInputs]);

  return {
    personalInfo,
    financialInfo,
    allocation,
    assumptions,
    returnMode,
    setPersonalInfo,
    setFinancialInfo,
    setAllocation,
    setAssumptions,
    setReturnMode,
    fireResult,
    fireNumberWithoutInss,
    projection,
    monteCarloResult,
    withdrawalAnalysis,
    isCalculating,
  };
}
