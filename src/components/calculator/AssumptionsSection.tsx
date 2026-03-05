"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { PercentInput } from "@/components/shared/PercentInput";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { FIELD_DESCRIPTIONS } from "@/engine/constants";
import type { Assumptions } from "@/engine/types";

interface AssumptionsSectionProps {
  assumptions: Assumptions;
  onChange: (assumptions: Assumptions) => void;
}

export function AssumptionsSection({
  assumptions,
  onChange,
}: AssumptionsSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Premissas</h3>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="inflation">Inflação (IPCA)</Label>
              <InfoTooltip content={FIELD_DESCRIPTIONS.inflacao} />
            </div>
            <PercentInput
              id="inflation"
              value={assumptions.inflation}
              onChange={(v) => onChange({ ...assumptions, inflation: v })}
              max={0.3}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="swr">Taxa retirada</Label>
              <InfoTooltip content={FIELD_DESCRIPTIONS.taxaRetirada} />
            </div>
            <PercentInput
              id="swr"
              value={assumptions.safeWithdrawalRate}
              onChange={(v) =>
                onChange({ ...assumptions, safeWithdrawalRate: v })
              }
              max={0.1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="inssBenefit">Benefício INSS</Label>
              <InfoTooltip content={FIELD_DESCRIPTIONS.beneficioInss} />
            </div>
            <CurrencyInput
              id="inssBenefit"
              value={assumptions.inssBenefit}
              onChange={(v) => onChange({ ...assumptions, inssBenefit: v })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="inssAge">Idade INSS</Label>
            <Input
              id="inssAge"
              type="number"
              min={55}
              max={75}
              value={assumptions.inssEligibilityAge}
              onChange={(e) =>
                onChange({
                  ...assumptions,
                  inssEligibilityAge: parseInt(e.target.value) || 65,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
