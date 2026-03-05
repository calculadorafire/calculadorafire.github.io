"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { PercentInput } from "@/components/shared/PercentInput";
import { ASSET_CLASSES, ASSET_CLASS_PARAMS, FIELD_DESCRIPTIONS } from "@/engine/constants";
import type { AssetAllocation, AssetClass, ReturnMode } from "@/engine/types";

interface AllocationSectionProps {
  allocation: AssetAllocation;
  onChange: (allocation: AssetAllocation) => void;
  returnMode: ReturnMode;
  onReturnModeChange: (mode: ReturnMode) => void;
}

const FIELD_KEY_MAP: Record<AssetClass, string> = {
  tesouroSelic: "tesouroSelic",
  tesouroIpca: "tesouroIpca",
  cdb: "cdb",
  lciLca: "lciLca",
  acoes: "acoes",
  fiis: "fiis",
};

export function AllocationSection({
  allocation,
  onChange,
  returnMode,
  onReturnModeChange,
}: AllocationSectionProps) {
  const total = ASSET_CLASSES.reduce(
    (sum, key) => sum + allocation[key],
    0
  );

  const handleSliderChange = (key: AssetClass, newValue: number) => {
    const updated = { ...allocation, [key]: newValue };
    onChange(updated);
  };

  const isSimple = returnMode.useSimpleReturn;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">
          Alocação de Ativos
          {!isSimple && (
            <span
              className={`ml-2 text-sm font-normal ${
                Math.abs(total - 100) < 0.1
                  ? "text-muted-foreground"
                  : "text-destructive"
              }`}
            >
              ({total.toFixed(0)}%)
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={() =>
            onReturnModeChange({
              ...returnMode,
              useSimpleReturn: !isSimple,
            })
          }
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          {isSimple ? "Modo detalhado" : "Modo simplificado"}
        </button>
      </div>

      {isSimple ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="simpleReturn">Retorno anual</Label>
            <InfoTooltip content="Taxa de retorno anual única aplicada a todo o patrimônio. Já líquida de impostos." />
          </div>
          <PercentInput
            id="simpleReturn"
            value={returnMode.simpleReturnRate}
            onChange={(v) =>
              onReturnModeChange({ ...returnMode, simpleReturnRate: v })
            }
            min={0}
            max={0.5}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {Math.abs(total - 100) >= 0.1 && (
            <p className="text-sm text-destructive" role="alert">
              A soma da alocação deve ser 100%. Atual: {total.toFixed(0)}%
            </p>
          )}
          {ASSET_CLASSES.map((key) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>{ASSET_CLASS_PARAMS[key].label}</Label>
                  <InfoTooltip
                    content={FIELD_DESCRIPTIONS[FIELD_KEY_MAP[key]]}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {(ASSET_CLASS_PARAMS[key].meanReturn * 100).toFixed(1)}% a.a.
                  </span>
                  <span className="text-sm font-medium w-12 text-right">
                    {allocation[key]}%
                  </span>
                </div>
              </div>
              <Slider
                value={[allocation[key]]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => handleSliderChange(key, v)}
                aria-label={ASSET_CLASS_PARAMS[key].label}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
