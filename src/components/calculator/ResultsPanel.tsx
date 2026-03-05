"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FireSummaryCard } from "@/components/results/FireSummaryCard";
import { PortfolioGrowthChart } from "@/components/results/PortfolioGrowthChart";
import { MonteCarloChart } from "@/components/results/MonteCarloChart";
import { AllocationPieChart } from "@/components/results/AllocationPieChart";
import { WithdrawalAnalysis } from "@/components/results/WithdrawalAnalysis";
import { InssIntegration } from "@/components/results/InssIntegration";
import { NextActionStrip } from "@/components/results/NextActionStrip";
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
  includeInss: boolean;
  fireNumberWithoutInss: number;
  inssBenefitMonthly: number;
  inssEligibilityAge: number;
  isCalculating: boolean;
  monthlyContribution: number;
  contributionPeriod: "mensal" | "anual";
  netWorth: number;
  inflation: number;
  overrideReturnRate?: number;
  useSimpleReturn: boolean;
  simpleReturnRate: number;
}

export const ResultsPanel = React.memo(function ResultsPanel({
  fireResult,
  projection,
  monteCarloResult,
  allocation,
  withdrawalAnalysis,
  includeInss,
  fireNumberWithoutInss,
  inssBenefitMonthly,
  inssEligibilityAge,
  isCalculating,
  monthlyContribution,
  contributionPeriod,
  netWorth,
  inflation,
  overrideReturnRate,
  useSimpleReturn,
  simpleReturnRate,
}: ResultsPanelProps) {
  return (
    <div className="space-y-4">
      <FireSummaryCard
        result={fireResult}
        successRate={monteCarloResult?.successRate}
      />

      {includeInss && (
        <InssIntegration
          fireNumberWithoutInss={fireNumberWithoutInss}
          fireNumberWithInss={fireResult.fireNumber}
          inssBenefitMonthly={inssBenefitMonthly}
          inssEligibilityAge={inssEligibilityAge}
          retirementAge={fireResult.retirementAge}
        />
      )}

      <NextActionStrip
        currentContribution={monthlyContribution}
        contributionPeriod={contributionPeriod}
        netWorth={netWorth}
        fireNumber={fireResult.fireNumber}
        yearsToFire={fireResult.yearsToFire}
        allocation={allocation}
        inflation={inflation}
        overrideReturnRate={overrideReturnRate}
      />

      <Tabs defaultValue="projecao">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="projecao">Projeção</TabsTrigger>
          <TabsTrigger value="montecarlo">Monte Carlo</TabsTrigger>
          <TabsTrigger value="alocacao">Alocação</TabsTrigger>
          <TabsTrigger value="retirada">Análise de Retirada</TabsTrigger>
        </TabsList>

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
          {useSimpleReturn ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Retorno Simplificado</CardTitle>
                <CardDescription>
                  Você está usando o modo simplificado com uma taxa de retorno única aplicada a todo o patrimônio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px]">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-primary">
                      {(simpleReturnRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-muted-foreground mt-2">retorno anual líquido</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AllocationPieChart allocation={allocation} />
          )}
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
