"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/engine/utils";
import type { YearProjection } from "@/engine/types";

interface PortfolioGrowthChartProps {
  projection: YearProjection[];
  retirementAge: number;
}

export function PortfolioGrowthChart({
  projection,
  retirementAge,
}: PortfolioGrowthChartProps) {
  const data = projection.map((p) => ({
    age: p.age,
    balance: p.balance,
    phase: p.phase,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Projeção do Patrimônio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
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
                formatter={(value) => [formatBRL(value as number), "Patrimônio"]}
                labelFormatter={(label) => `Idade: ${label}`}
              />
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#6366f1"
                fill="url(#colorBalance)"
                name="Patrimônio"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Aposentadoria aos {retirementAge} anos
        </p>
      </CardContent>
    </Card>
  );
}
