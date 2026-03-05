"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { PersonalInfo } from "@/engine/types";

interface PersonalInfoSectionProps {
  personalInfo: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
}

export function PersonalInfoSection({
  personalInfo,
  onChange,
}: PersonalInfoSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Dados Pessoais</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="currentAge">Idade atual</Label>
          <Input
            id="currentAge"
            type="number"
            min={18}
            max={100}
            value={personalInfo.currentAge}
            onChange={(e) =>
              onChange({
                ...personalInfo,
                currentAge: parseInt(e.target.value) || 18,
              })
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="retirementAge">Aposentadoria</Label>
          <Input
            id="retirementAge"
            type="number"
            min={personalInfo.currentAge + 1}
            max={100}
            value={personalInfo.retirementAge}
            onChange={(e) => {
              const val = parseInt(e.target.value) || personalInfo.currentAge + 1;
              onChange({
                ...personalInfo,
                retirementAge: Math.max(val, personalInfo.currentAge + 1),
              });
            }}
          />
          {personalInfo.retirementAge <= personalInfo.currentAge && (
            <p className="text-sm text-destructive">
              A idade de aposentadoria deve ser maior que a idade atual.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
