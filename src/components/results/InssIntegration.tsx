"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/engine/utils";

interface InssIntegrationProps {
  fireNumberWithoutInss: number;
  fireNumberWithInss: number;
  inssBenefitMonthly: number;
  inssEligibilityAge: number;
  retirementAge: number;
}

export function InssIntegration({
  fireNumberWithoutInss,
  fireNumberWithInss,
  inssBenefitMonthly,
  inssEligibilityAge,
  retirementAge,
}: InssIntegrationProps) {
  const reduction = fireNumberWithoutInss - fireNumberWithInss;
  const isEligible = retirementAge >= inssEligibilityAge;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Impacto do INSS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              FIRE sem INSS
            </p>
            <p className="text-lg font-semibold" data-testid="fire-without-inss">
              {formatBRL(fireNumberWithoutInss)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              FIRE com INSS
            </p>
            <p className="text-lg font-semibold text-primary" data-testid="fire-with-inss">
              {formatBRL(fireNumberWithInss)}
            </p>
          </div>
        </div>
        {inssBenefitMonthly > 0 && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">
              {isEligible ? (
                <>
                  O benefício INSS de{" "}
                  <strong>{formatBRL(inssBenefitMonthly)}/mês</strong> reduz o
                  patrimônio necessário em{" "}
                  <strong>{formatBRL(reduction)}</strong>.
                </>
              ) : (
                <>
                  O INSS só será contabilizado a partir dos{" "}
                  <strong>{inssEligibilityAge} anos</strong>. Sua
                  aposentadoria planejada aos {retirementAge} anos não
                  considera o benefício.
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
