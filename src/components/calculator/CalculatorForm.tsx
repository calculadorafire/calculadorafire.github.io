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
    <Card className="shadow-sm border-border rounded-xl">
      <CardContent className="p-5 space-y-5">
        <PersonalInfoSection
          personalInfo={personalInfo}
          onChange={onPersonalInfoChange}
        />
        <div className="border-t border-border/50" />
        <FinancialSituationSection
          financialInfo={financialInfo}
          onChange={onFinancialInfoChange}
        />
        <div className="border-t border-border/50" />
        <AllocationSection
          allocation={allocation}
          onChange={onAllocationChange}
          returnMode={returnMode}
          onReturnModeChange={onReturnModeChange}
        />
        <div className="border-t border-border/50" />
        <AssumptionsSection
          assumptions={assumptions}
          onChange={onAssumptionsChange}
        />
      </CardContent>
    </Card>
  );
}
