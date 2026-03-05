"use client";

import React from "react";
import { CalculatorForm } from "@/components/calculator/CalculatorForm";
import { ResultsPanel } from "@/components/calculator/ResultsPanel";
import { useCalculator } from "@/hooks/useCalculator";

export default function Home() {
  const {
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
  } = useCalculator();

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Calculadora FIRE Brasil
          </h1>
          <p className="text-muted-foreground mt-2">
            Planeje sua independência financeira com simulações Monte Carlo e
            regras tributárias brasileiras de 2026
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(380px,480px)_1fr] gap-6">
          <div>
            <CalculatorForm
              personalInfo={personalInfo}
              financialInfo={financialInfo}
              allocation={allocation}
              assumptions={assumptions}
              returnMode={returnMode}
              onPersonalInfoChange={setPersonalInfo}
              onFinancialInfoChange={setFinancialInfo}
              onAllocationChange={setAllocation}
              onAssumptionsChange={setAssumptions}
              onReturnModeChange={setReturnMode}
            />
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <ResultsPanel
              fireResult={fireResult}
              projection={projection}
              monteCarloResult={monteCarloResult}
              allocation={allocation}
              withdrawalAnalysis={withdrawalAnalysis}
              fireNumberWithoutInss={fireNumberWithoutInss}
              inssBenefitMonthly={assumptions.inssBenefit}
              inssEligibilityAge={assumptions.inssEligibilityAge}
              isCalculating={isCalculating}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
