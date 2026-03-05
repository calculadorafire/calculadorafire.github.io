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
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Impacto do INSS no FIRE</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Com INSS
            </p>
            <p className="text-lg font-bold text-primary" data-testid="fire-with-inss">
              {formatBRL(fireNumberWithInss)}
            </p>
            {isEligible && inssBenefitMonthly > 0 && (
              <p className="text-xs text-primary mt-1">
                + {formatBRL(inssBenefitMonthly)}/mes a partir dos {inssEligibilityAge}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Sem INSS
            </p>
            <p className="text-lg font-bold" data-testid="fire-without-inss">
              {formatBRL(fireNumberWithoutInss)}
            </p>
            {reduction > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                + {formatBRL(reduction)} necessarios
              </p>
            )}
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
