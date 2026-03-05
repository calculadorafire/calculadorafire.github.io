"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FireSummaryCard } from "@/components/results/FireSummaryCard";
import { PortfolioGrowthChart } from "@/components/results/PortfolioGrowthChart";
import { MonteCarloChart } from "@/components/results/MonteCarloChart";
import { AllocationPieChart } from "@/components/results/AllocationPieChart";
import { WithdrawalAnalysis } from "@/components/results/WithdrawalAnalysis";
import { InssIntegration } from "@/components/results/InssIntegration";
import type {
  FireResult,
  YearProjection,
  MonteCarloResult,
  AssetAllocation,
  WithdrawalAnalysisEntry,
} from "@/engine/types";

interface ResultsPanelProps {
  fireResult: FireResult;
  projection: YearProjection[];
  monteCarloResult: MonteCarloResult | null;
  allocation: AssetAllocation;
  withdrawalAnalysis: WithdrawalAnalysisEntry[];
  fireNumberWithoutInss: number;
  inssBenefitMonthly: number;
  inssEligibilityAge: number;
  isCalculating: boolean;
}

export const ResultsPanel = React.memo(function ResultsPanel({
  fireResult,
  projection,
  monteCarloResult,
  allocation,
  withdrawalAnalysis,
  fireNumberWithoutInss,
  inssBenefitMonthly,
  inssEligibilityAge,
  isCalculating,
}: ResultsPanelProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="resumo">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="projecao">Projeção</TabsTrigger>
          <TabsTrigger value="montecarlo">Monte Carlo</TabsTrigger>
          <TabsTrigger value="alocacao">Alocação</TabsTrigger>
          <TabsTrigger value="retirada">Análise de Retirada</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          <FireSummaryCard result={fireResult} />
          <InssIntegration
            fireNumberWithoutInss={fireNumberWithoutInss}
            fireNumberWithInss={fireResult.fireNumber}
            inssBenefitMonthly={inssBenefitMonthly}
            inssEligibilityAge={inssEligibilityAge}
            retirementAge={fireResult.retirementAge}
          />
        </TabsContent>

        <TabsContent value="projecao">
          <PortfolioGrowthChart
            projection={projection}
            retirementAge={fireResult.retirementAge}
          />
        </TabsContent>

        <TabsContent value="montecarlo">
          {monteCarloResult ? (
            <div className={isCalculating ? "opacity-50 pointer-events-none" : undefined}>
              <MonteCarloChart result={monteCarloResult} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground animate-pulse">
                Calculando simulações Monte Carlo...
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alocacao">
          <AllocationPieChart allocation={allocation} />
        </TabsContent>

        <TabsContent value="retirada">
          {withdrawalAnalysis.length > 0 ? (
            <div className={isCalculating ? "opacity-50 pointer-events-none" : undefined}>
              <WithdrawalAnalysis entries={withdrawalAnalysis} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-muted-foreground animate-pulse">
                Calculando análise de retirada...
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});
