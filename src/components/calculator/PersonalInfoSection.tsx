"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
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
      <div className="flex items-center gap-2 mb-3">
        <User className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Dados Pessoais</h3>
      </div>
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
              const parsed = parseInt(e.target.value);
              if (!isNaN(parsed)) {
                onChange({
                  ...personalInfo,
                  retirementAge: parsed,
                });
              }
            }}
            onBlur={() => {
              const minAge = personalInfo.currentAge + 1;
              if (personalInfo.retirementAge < minAge) {
                onChange({
                  ...personalInfo,
                  retirementAge: minAge,
                });
              }
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
