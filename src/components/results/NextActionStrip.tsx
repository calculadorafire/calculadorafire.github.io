"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { formatBRL } from "@/engine/utils";
import { calculateYearsToFire } from "@/engine/fire-calculator";
import type { AssetAllocation } from "@/engine/types";

interface NextActionStripProps {
  currentContribution: number;
  netWorth: number;
  fireNumber: number;
  yearsToFire: number;
  allocation: AssetAllocation;
  inflation: number;
  overrideReturnRate?: number;
}

export function NextActionStrip({
  currentContribution,
  netWorth,
  fireNumber,
  yearsToFire,
  allocation,
  inflation,
  overrideReturnRate,
}: NextActionStripProps) {
  const suggestion = useMemo(() => {
    if (yearsToFire <= 1 || fireNumber <= 0) return null;

    // Try increasing contribution by increments to find one that shaves ~2 years
    const increments = [500, 1000, 1500, 2000, 3000, 5000];
    for (const inc of increments) {
      const newContribution = (currentContribution + inc) * 12;
      const newYears = calculateYearsToFire(
        netWorth,
        newContribution,
        fireNumber,
        allocation,
        inflation,
        overrideReturnRate
      );
      const saved = yearsToFire - newYears;
      if (saved >= 2) {
        return {
          newMonthly: currentContribution + inc,
          yearsSaved: saved,
        };
      }
    }

    // If no increment shaves 2+ years, show the smallest saving
    const inc = increments[0];
    const newContribution = (currentContribution + inc) * 12;
    const newYears = calculateYearsToFire(
      netWorth,
      newContribution,
      fireNumber,
      allocation,
      inflation,
      overrideReturnRate
    );
    const saved = yearsToFire - newYears;
    if (saved > 0) {
      return { newMonthly: currentContribution + inc, yearsSaved: saved };
    }

    return null;
  }, [currentContribution, netWorth, fireNumber, yearsToFire, allocation, inflation, overrideReturnRate]);

  if (!suggestion) return null;

  return (
    <Card className="shadow-sm border-primary/20 bg-primary/5" data-testid="next-action-strip">
      <CardContent className="p-4 flex items-center gap-3">
        <Lightbulb className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm">
          Deseja atingir FIRE mais cedo? Tente aumentar o aporte para{" "}
          <span className="font-semibold text-primary underline underline-offset-2">
            {formatBRL(suggestion.newMonthly)}/mes
          </span>{" "}
          (-{suggestion.yearsSaved} anos)
        </p>
      </CardContent>
    </Card>
  );
}
