import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PersonalInfoSection } from "../calculator/PersonalInfoSection";
import { FinancialSituationSection } from "../calculator/FinancialSituationSection";
import { AllocationSection } from "../calculator/AllocationSection";
import { AssumptionsSection } from "../calculator/AssumptionsSection";
import { DEFAULT_ALLOCATION, DEFAULT_ASSUMPTIONS, DEFAULT_RETURN_MODE } from "@/engine/constants";

describe("PersonalInfoSection", () => {
  it("renders age inputs", () => {
    render(
      <PersonalInfoSection
        personalInfo={{ currentAge: 30, retirementAge: 55 }}
        onChange={() => {}}
      />
    );
    expect(screen.getByLabelText("Idade atual")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Aposentadoria")
    ).toBeInTheDocument();
  });

  it("calls onChange when age changes", () => {
    const onChange = vi.fn();
    render(
      <PersonalInfoSection
        personalInfo={{ currentAge: 30, retirementAge: 55 }}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByLabelText("Idade atual"), {
      target: { value: "35" },
    });
    expect(onChange).toHaveBeenCalledWith({ currentAge: 35, retirementAge: 55 });
  });
});

describe("FinancialSituationSection", () => {
  const defaultInfo = {
    netWorth: 100000,
    income: 10000,
    incomePeriod: "mensal" as const,
    expenses: 5000,
    expensesPeriod: "mensal" as const,
    contribution: 3000,
    contributionPeriod: "mensal" as const,
  };

  it("renders all financial inputs", () => {
    render(
      <FinancialSituationSection
        financialInfo={defaultInfo}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Patrimônio")).toBeInTheDocument();
    expect(screen.getByText("Renda")).toBeInTheDocument();
    expect(screen.getByText("Despesas")).toBeInTheDocument();
    expect(screen.getByText("Aporte")).toBeInTheDocument();
  });

  it("renders monthly/annual toggles", () => {
    render(
      <FinancialSituationSection
        financialInfo={defaultInfo}
        onChange={() => {}}
      />
    );
    const mensalButtons = screen.getAllByText("Mensal");
    expect(mensalButtons.length).toBeGreaterThanOrEqual(3);
  });
});

describe("AllocationSection", () => {
  it("renders sliders for all 6 asset classes", () => {
    render(
      <AllocationSection
        allocation={DEFAULT_ALLOCATION}
        onChange={() => {}}
        returnMode={DEFAULT_RETURN_MODE}
        onReturnModeChange={() => {}}
      />
    );
    expect(screen.getByText("Tesouro Selic")).toBeInTheDocument();
    expect(screen.getByText("Tesouro IPCA+")).toBeInTheDocument();
    expect(screen.getByText("CDB")).toBeInTheDocument();
    expect(screen.getByText("LCI/LCA")).toBeInTheDocument();
    expect(screen.getByText("Ações (IBOVESPA)")).toBeInTheDocument();
    expect(screen.getByText("FIIs")).toBeInTheDocument();
  });

  it("displays warning if total ≠ 100%", () => {
    const badAllocation = {
      tesouroSelic: 50,
      tesouroIpca: 0,
      cdb: 0,
      lciLca: 0,
      acoes: 0,
      fiis: 0,
    };
    render(
      <AllocationSection allocation={badAllocation} onChange={() => {}} returnMode={DEFAULT_RETURN_MODE} onReturnModeChange={() => {}} />
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show warning when total is 100%", () => {
    render(
      <AllocationSection
        allocation={DEFAULT_ALLOCATION}
        onChange={() => {}}
        returnMode={DEFAULT_RETURN_MODE}
        onReturnModeChange={() => {}}
      />
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("AssumptionsSection", () => {
  it("renders INSS and inflation inputs", () => {
    render(
      <AssumptionsSection
        assumptions={DEFAULT_ASSUMPTIONS}
        onChange={() => {}}
      />
    );
    expect(
      screen.getByText("Inflação (IPCA)")
    ).toBeInTheDocument();
    expect(screen.getByText("Taxa retirada")).toBeInTheDocument();
    expect(
      screen.getByText("Benefício INSS")
    ).toBeInTheDocument();
    expect(screen.getByText("Idade INSS")).toBeInTheDocument();
  });
});
