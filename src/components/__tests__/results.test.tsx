import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FireSummaryCard } from "../results/FireSummaryCard";
import { WithdrawalAnalysis } from "../results/WithdrawalAnalysis";
import { InssIntegration } from "../results/InssIntegration";
import type { FireResult, WithdrawalAnalysisEntry } from "@/engine/types";

const mockFireResult: FireResult = {
  fireNumber: 1_500_000,
  yearsToFire: 15,
  retirementAge: 45,
  monthlyPassiveIncomeGross: 5_000,
  monthlyPassiveIncomeNet: 4_125,
  monthlyPassiveIncomeWithInss: 6_625,
};

describe("FireSummaryCard", () => {
  it("displays formatted FIRE number", () => {
    render(<FireSummaryCard result={mockFireResult} />);
    expect(screen.getByTestId("fire-number")).toHaveTextContent(
      "1.500.000"
    );
  });

  it("displays years to FIRE", () => {
    render(<FireSummaryCard result={mockFireResult} />);
    expect(screen.getByTestId("years-to-fire")).toHaveTextContent("15 anos");
  });

  it("shows net income", () => {
    render(<FireSummaryCard result={mockFireResult} />);
    expect(screen.getByTestId("income-net")).toBeInTheDocument();
  });

  it("shows income with INSS", () => {
    render(<FireSummaryCard result={mockFireResult} />);
    expect(screen.getByTestId("income-with-inss")).toBeInTheDocument();
  });
});

describe("WithdrawalAnalysis", () => {
  const mockEntries: WithdrawalAnalysisEntry[] = [
    { swr: 0.03, successRate: 0.98, medianFinalBalance: 2_000_000 },
    { swr: 0.035, successRate: 0.95, medianFinalBalance: 1_500_000 },
    { swr: 0.04, successRate: 0.90, medianFinalBalance: 1_000_000 },
    { swr: 0.045, successRate: 0.80, medianFinalBalance: 500_000 },
    { swr: 0.05, successRate: 0.70, medianFinalBalance: 200_000 },
  ];

  it("displays table rows for each SWR", () => {
    render(<WithdrawalAnalysis entries={mockEntries} />);
    const rows = screen.getAllByTestId("withdrawal-row");
    expect(rows).toHaveLength(5);
  });

  it("shows success rate for each SWR", () => {
    render(<WithdrawalAnalysis entries={mockEntries} />);
    expect(screen.getByText("3.0%")).toBeInTheDocument();
    expect(screen.getByText("5.0%")).toBeInTheDocument();
    expect(screen.getByText("98%")).toBeInTheDocument();
  });
});

describe("InssIntegration", () => {
  it("shows how INSS reduces required portfolio", () => {
    render(
      <InssIntegration
        fireNumberWithoutInss={1_500_000}
        fireNumberWithInss={750_000}
        inssBenefitMonthly={2_500}
        inssEligibilityAge={65}
        retirementAge={65}
      />
    );
    expect(screen.getByTestId("fire-without-inss")).toBeInTheDocument();
    expect(screen.getByTestId("fire-with-inss")).toBeInTheDocument();
  });

  it("shows ineligibility message when retirement < eligibility", () => {
    render(
      <InssIntegration
        fireNumberWithoutInss={1_500_000}
        fireNumberWithInss={1_500_000}
        inssBenefitMonthly={2_500}
        inssEligibilityAge={65}
        retirementAge={50}
      />
    );
    expect(screen.getByText(/só será contabilizado/)).toBeInTheDocument();
  });
});
