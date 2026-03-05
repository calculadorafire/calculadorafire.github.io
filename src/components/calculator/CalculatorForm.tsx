"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { FinancialSituationSection } from "./FinancialSituationSection";
import { AllocationSection } from "./AllocationSection";
import { AssumptionsSection } from "./AssumptionsSection";
import type {
  PersonalInfo,
  FinancialInfo,
  AssetAllocation,
  Assumptions,
  ReturnMode,
} from "@/engine/types";

interface CalculatorFormProps {
  personalInfo: PersonalInfo;
  financialInfo: FinancialInfo;
  allocation: AssetAllocation;
  assumptions: Assumptions;
  returnMode: ReturnMode;
  onPersonalInfoChange: (info: PersonalInfo) => void;
  onFinancialInfoChange: (info: FinancialInfo) => void;
  onAllocationChange: (alloc: AssetAllocation) => void;
  onAssumptionsChange: (assumptions: Assumptions) => void;
  onReturnModeChange: (mode: ReturnMode) => void;
}

export function CalculatorForm({
  personalInfo,
  financialInfo,
  allocation,
  assumptions,
  returnMode,
  onPersonalInfoChange,
  onFinancialInfoChange,
  onAllocationChange,
  onAssumptionsChange,
  onReturnModeChange,
}: CalculatorFormProps) {
  return (
    <Card>
      <CardContent className="p-4 divide-y">
        <div className="pb-3">
          <PersonalInfoSection
            personalInfo={personalInfo}
            onChange={onPersonalInfoChange}
          />
        </div>
        <div className="py-3">
          <FinancialSituationSection
            financialInfo={financialInfo}
            onChange={onFinancialInfoChange}
          />
        </div>
        <div className="py-3">
          <AllocationSection
            allocation={allocation}
            onChange={onAllocationChange}
            returnMode={returnMode}
            onReturnModeChange={onReturnModeChange}
          />
        </div>
        <div className="pt-3">
          <AssumptionsSection
            assumptions={assumptions}
            onChange={onAssumptionsChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
