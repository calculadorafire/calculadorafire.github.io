"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { FIELD_DESCRIPTIONS } from "@/engine/constants";
import type { FinancialInfo, Period } from "@/engine/types";

interface FinancialSituationSectionProps {
  financialInfo: FinancialInfo;
  onChange: (info: FinancialInfo) => void;
}

function PeriodToggle({
  value,
  onChange,
}: {
  value: Period;
  onChange: (v: Period) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as Period);
      }}
      className="h-8"
    >
      <ToggleGroupItem value="mensal" className="text-xs h-7 px-2">
        Mensal
      </ToggleGroupItem>
      <ToggleGroupItem value="anual" className="text-xs h-7 px-2">
        Anual
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function FinancialSituationSection({
  financialInfo,
  onChange,
}: FinancialSituationSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Situação Financeira</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Label htmlFor="netWorth">Patrimônio</Label>
            <InfoTooltip content={FIELD_DESCRIPTIONS.patrimonioLiquido} />
          </div>
          <CurrencyInput
            id="netWorth"
            value={financialInfo.netWorth}
            onChange={(v) => onChange({ ...financialInfo, netWorth: v })}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="contribution">Aporte</Label>
              <InfoTooltip content={FIELD_DESCRIPTIONS.aporte} />
            </div>
            <PeriodToggle
              value={financialInfo.contributionPeriod}
              onChange={(v) =>
                onChange({ ...financialInfo, contributionPeriod: v })
              }
            />
          </div>
          <CurrencyInput
            id="contribution"
            value={financialInfo.contribution}
            onChange={(v) => onChange({ ...financialInfo, contribution: v })}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="income">Renda</Label>
              <InfoTooltip content={FIELD_DESCRIPTIONS.renda} />
            </div>
            <PeriodToggle
              value={financialInfo.incomePeriod}
              onChange={(v) => onChange({ ...financialInfo, incomePeriod: v })}
            />
          </div>
          <CurrencyInput
            id="income"
            value={financialInfo.income}
            onChange={(v) => onChange({ ...financialInfo, income: v })}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="expenses">Despesas</Label>
              <InfoTooltip content={FIELD_DESCRIPTIONS.despesas} />
            </div>
            <PeriodToggle
              value={financialInfo.expensesPeriod}
              onChange={(v) => onChange({ ...financialInfo, expensesPeriod: v })}
            />
          </div>
          <CurrencyInput
            id="expenses"
            value={financialInfo.expenses}
            onChange={(v) => onChange({ ...financialInfo, expenses: v })}
          />
        </div>
      </div>
    </div>
  );
}
