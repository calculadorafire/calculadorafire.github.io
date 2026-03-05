"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { formatBRL } from "@/engine/utils";
import { calculateYearsToFire } from "@/engine/fire-calculator";
import type { AssetAllocation } from "@/engine/types";

interface NextActionStripProps {
  currentContribution: number;
  contributionPeriod: "mensal" | "anual";
  netWorth: number;
  fireNumber: number;
  yearsToFire: number;
  allocation: AssetAllocation;
  inflation: number;
  overrideReturnRate?: number;
}

export function NextActionStrip({
  currentContribution,
  contributionPeriod,
  netWorth,
  fireNumber,
  yearsToFire,
  allocation,
  inflation,
  overrideReturnRate,
}: NextActionStripProps) {
  const isMonthly = contributionPeriod === "mensal";
  const periodLabel = isMonthly ? "mes" : "ano";

  const suggestion = useMemo(() => {
    if (yearsToFire <= 1 || fireNumber <= 0) return null;

    // Try increasing contribution by increments to find one that shaves ~2 years
    const increments = isMonthly
      ? [500, 1000, 1500, 2000, 3000, 5000]
      : [6000, 12000, 18000, 24000, 36000, 60000];
    for (const inc of increments) {
      const newValue = currentContribution + inc;
      const newAnnual = isMonthly ? newValue * 12 : newValue;
      const newYears = calculateYearsToFire(
        netWorth,
        newAnnual,
        fireNumber,
        allocation,
        inflation,
        overrideReturnRate
      );
      const saved = yearsToFire - newYears;
      if (saved >= 2) {
        return {
          newContribution: newValue,
          yearsSaved: saved,
        };
      }
    }

    // If no increment shaves 2+ years, show the smallest saving
    const inc = increments[0];
    const newValue = currentContribution + inc;
    const newAnnual = isMonthly ? newValue * 12 : newValue;
    const newYears = calculateYearsToFire(
      netWorth,
      newAnnual,
      fireNumber,
      allocation,
      inflation,
      overrideReturnRate
    );
    const saved = yearsToFire - newYears;
    if (saved > 0) {
      return { newContribution: newValue, yearsSaved: saved };
    }

    return null;
  }, [currentContribution, isMonthly, netWorth, fireNumber, yearsToFire, allocation, inflation, overrideReturnRate]);

  if (!suggestion) return null;

  return (
    <Card className="shadow-sm border-primary/20 bg-primary/5" data-testid="next-action-strip">
      <CardContent className="p-4 flex items-center gap-3">
        <Lightbulb className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm">
          Deseja atingir FIRE mais cedo? Tente aumentar o aporte para{" "}
          <span className="font-semibold text-primary underline underline-offset-2">
            {formatBRL(suggestion.newContribution)}/{periodLabel}
          </span>{" "}
          (-{suggestion.yearsSaved} anos)
        </p>
      </CardContent>
    </Card>
  );
}
