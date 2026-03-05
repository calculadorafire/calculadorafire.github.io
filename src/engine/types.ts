export type Period = "mensal" | "anual";

export type AssetClass =
  | "tesouroSelic"
  | "tesouroIpca"
  | "cdb"
  | "lciLca"
  | "acoes"
  | "fiis";

export interface AssetAllocation {
  tesouroSelic: number;
  tesouroIpca: number;
  cdb: number;
  lciLca: number;
  acoes: number;
  fiis: number;
}

export interface AssetClassParams {
  label: string;
  meanReturn: number;
  stdDev: number;
  taxCategory: TaxCategory;
}

export type TaxCategory = "rendaFixa" | "isento" | "rendaVariavel" | "fii";

export interface PersonalInfo {
  currentAge: number;
  retirementAge: number;
}

export interface FinancialInfo {
  netWorth: number;
  income: number;
  incomePeriod: Period;
  expenses: number;
  expensesPeriod: Period;
  contribution: number;
  contributionPeriod: Period;
}

export interface Assumptions {
  inflation: number;
  safeWithdrawalRate: number;
  includeInss: boolean;
  inssBenefit: number;
  inssEligibilityAge: number;
  lifeExpectancy: number;
}

export interface ReturnMode {
  useSimpleReturn: boolean;
  simpleReturnRate: number; // 0-1 decimal, e.g. 0.10 for 10%
}

export interface CalculatorInputs {
  personalInfo: PersonalInfo;
  financialInfo: FinancialInfo;
  allocation: AssetAllocation;
  assumptions: Assumptions;
  returnMode: ReturnMode;
}

export interface FireResult {
  fireNumber: number;
  yearsToFire: number;
  retirementAge: number;
  monthlyPassiveIncomeGross: number;
  monthlyPassiveIncomeNet: number;
  monthlyPassiveIncomeWithInss: number;
}

export interface YearProjection {
  age: number;
  year: number;
  balance: number;
  contributions: number;
  withdrawals: number;
  returns: number;
  taxes: number;
  inssIncome: number;
  phase: "accumulation" | "retirement";
}

export interface MonteCarloResult {
  simulations: number[][];
  percentiles: {
    p5: number[];
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
    p95: number[];
  };
  successRate: number;
  years: number[];
}

export interface WithdrawalAnalysisEntry {
  swr: number;
  successRate: number;
  medianFinalBalance: number;
}
