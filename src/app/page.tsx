"use client";

import React from "react";
import { TopNavbar } from "@/components/layout/TopNavbar";
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

  const overrideRate = returnMode.useSimpleReturn ? returnMode.simpleReturnRate : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,360px)_1fr] gap-6">
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

            <div className="lg:sticky lg:top-20 lg:self-start">
              <ResultsPanel
                fireResult={fireResult}
                projection={projection}
                monteCarloResult={monteCarloResult}
                allocation={allocation}
                withdrawalAnalysis={withdrawalAnalysis}
                fireNumberWithoutInss={fireNumberWithoutInss}
                includeInss={assumptions.includeInss}
                inssBenefitMonthly={assumptions.includeInss ? assumptions.inssBenefit : 0}
                inssEligibilityAge={assumptions.inssEligibilityAge}
                isCalculating={isCalculating}
                monthlyContribution={financialInfo.contribution}
                contributionPeriod={financialInfo.contributionPeriod}
                netWorth={financialInfo.netWorth}
                inflation={assumptions.inflation}
                overrideReturnRate={overrideRate}
                useSimpleReturn={returnMode.useSimpleReturn}
                simpleReturnRate={returnMode.simpleReturnRate}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
