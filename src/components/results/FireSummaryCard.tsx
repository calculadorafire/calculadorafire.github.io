"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/engine/utils";
import type { FireResult } from "@/engine/types";

interface FireSummaryCardProps {
  result: FireResult;
}

export function FireSummaryCard({ result }: FireSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumo FIRE</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Número FIRE</p>
            <p className="text-2xl font-bold text-primary" data-testid="fire-number">
              {formatBRL(result.fireNumber)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Anos até o FIRE</p>
            <p className="text-2xl font-bold" data-testid="years-to-fire">
              {result.yearsToFire} anos
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Renda passiva mensal (bruta)
            </p>
            <p className="text-lg font-semibold" data-testid="income-gross">
              {formatBRL(result.monthlyPassiveIncomeGross)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Renda passiva mensal (líquida)
            </p>
            <p className="text-lg font-semibold" data-testid="income-net">
              {formatBRL(result.monthlyPassiveIncomeNet)}
            </p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-sm text-muted-foreground">
              Renda mensal com INSS
            </p>
            <p className="text-lg font-semibold text-primary" data-testid="income-with-inss">
              {formatBRL(result.monthlyPassiveIncomeWithInss)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
