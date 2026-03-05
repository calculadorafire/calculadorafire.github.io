"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSET_CLASS_PARAMS, ASSET_CLASSES } from "@/engine/constants";
import type { AssetAllocation } from "@/engine/types";

interface AllocationPieChartProps {
  allocation: AssetAllocation;
}

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#06b6d4", "#10b981", "#f59e0b"];

export const AllocationPieChart = React.memo(function AllocationPieChart({ allocation }: AllocationPieChartProps) {
  const data = useMemo(() => ASSET_CLASSES.filter((key) => allocation[key] > 0).map(
    (key, i) => ({
      name: ASSET_CLASS_PARAMS[key].label,
      value: allocation[key],
      color: COLORS[ASSET_CLASSES.indexOf(key)],
    })
  ), [allocation]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Alocação Atual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]" data-testid="allocation-pie-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});
