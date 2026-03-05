"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { PercentInput } from "@/components/shared/PercentInput";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { Shield } from "lucide-react";
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
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Premissas</h3>
      </div>
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

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Label htmlFor="lifeExpectancy">Expectativa de vida</Label>
            <InfoTooltip content={FIELD_DESCRIPTIONS.expectativaVida} />
          </div>
          <Input
            id="lifeExpectancy"
            type="number"
            min={50}
            max={120}
            value={assumptions.lifeExpectancy}
            onChange={(e) =>
              onChange({
                ...assumptions,
                lifeExpectancy: parseInt(e.target.value) || 90,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            role="switch"
            aria-checked={assumptions.includeInss}
            aria-label="Incluir INSS"
            onClick={() =>
              onChange({ ...assumptions, includeInss: !assumptions.includeInss })
            }
            className="flex items-center gap-2 cursor-pointer"
          >
            <span
              className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-colors ${
                assumptions.includeInss
                  ? "bg-primary border-primary"
                  : "bg-input border-input"
              }`}
            >
              <span
                className={`block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                  assumptions.includeInss ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </span>
            <span className="text-sm font-medium">Incluir INSS</span>
          </button>

          {assumptions.includeInss && (
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
          )}
        </div>
      </div>
    </div>
  );
}
