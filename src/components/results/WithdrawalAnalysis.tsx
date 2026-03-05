"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MoreInfoButton } from "@/components/shared/MoreInfoButton";
import { WithdrawalInfo } from "@/components/results/tabDescriptions";
import { formatBRL } from "@/engine/utils";
import type { WithdrawalAnalysisEntry } from "@/engine/types";

interface WithdrawalAnalysisProps {
  entries: WithdrawalAnalysisEntry[];
}

export function WithdrawalAnalysis({ entries }: WithdrawalAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Análise de Retirada</CardTitle>
          <MoreInfoButton title="Análise de Retirada (SWR)">
            <WithdrawalInfo />
          </MoreInfoButton>
        </div>
        <CardDescription>
          Análise de sustentabilidade do patrimônio com diferentes taxas de retirada anual (SWR).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="withdrawal-table">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Taxa de Retirada</th>
                <th className="text-left py-2 font-medium">Taxa de Sucesso</th>
                <th className="text-left py-2 font-medium">
                  Patrimônio Final (Mediana)
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.swr} className="border-b" data-testid="withdrawal-row">
                  <td className="py-2">{(entry.swr * 100).toFixed(1)}%</td>
                  <td className="py-2">
                    <span
                      className={`font-medium ${
                        entry.successRate >= 0.9
                          ? "text-green-600"
                          : entry.successRate >= 0.7
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {(entry.successRate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2">
                    {formatBRL(entry.medianFinalBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
