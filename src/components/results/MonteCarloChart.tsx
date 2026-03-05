"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MoreInfoButton } from "@/components/shared/MoreInfoButton";
import { MonteCarloInfo } from "@/components/results/tabDescriptions";
import { formatBRL } from "@/engine/utils";
import type { MonteCarloResult } from "@/engine/types";

interface MonteCarloChartProps {
  result: MonteCarloResult;
}

export const MonteCarloChart = React.memo(function MonteCarloChart({ result }: MonteCarloChartProps) {
  const data = useMemo(() => result.years.map((age, i) => ({
    age,
    p5: result.percentiles.p5[i],
    p10: result.percentiles.p10[i],
    p25: result.percentiles.p25[i],
    p50: result.percentiles.p50[i],
    p75: result.percentiles.p75[i],
    p90: result.percentiles.p90[i],
    p95: result.percentiles.p95[i],
  })), [result]);

  const successPct = (result.successRate * 100).toFixed(0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Simulação Monte Carlo
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({result.simulations.length} simulações)
            </span>
          </CardTitle>
          <MoreInfoButton title="Simulação Monte Carlo">
            <MonteCarloInfo />
          </MoreInfoButton>
        </div>
        <CardDescription>
          Simulação de {result.simulations.length} cenários aleatórios para o seu patrimônio. As faixas mostram os percentis P5 a P95.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <span className="text-sm">Taxa de sucesso: </span>
          <span
            className={`text-lg font-bold ${
              result.successRate >= 0.8
                ? "text-green-600"
                : result.successRate >= 0.5
                ? "text-yellow-600"
                : "text-red-600"
            }`}
            data-testid="success-rate"
          >
            {successPct}%
          </span>
        </div>
        <div className="h-[350px]" data-testid="monte-carlo-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="age"
                label={{ value: "Idade", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={(v) =>
                  `R$ ${(v / 1_000_000).toFixed(1)}M`
                }
              />
              <Tooltip
                formatter={(value) => formatBRL(value as number)}
                labelFormatter={(label) => `Idade: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="p95"
                stroke="none"
                fill="#6366f1"
                fillOpacity={0.1}
                name="P95"
              />
              <Area
                type="monotone"
                dataKey="p75"
                stroke="none"
                fill="#6366f1"
                fillOpacity={0.15}
                name="P75"
              />
              <Area
                type="monotone"
                dataKey="p50"
                stroke="#6366f1"
                strokeWidth={2}
                fill="#6366f1"
                fillOpacity={0.2}
                name="Mediana"
              />
              <Area
                type="monotone"
                dataKey="p25"
                stroke="none"
                fill="#6366f1"
                fillOpacity={0.15}
                name="P25"
              />
              <Area
                type="monotone"
                dataKey="p5"
                stroke="none"
                fill="#6366f1"
                fillOpacity={0.1}
                name="P5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});
