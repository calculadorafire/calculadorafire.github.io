"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { clamp } from "@/engine/utils";

interface PercentInputProps {
  value: number; // 0-1 decimal
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  id?: string;
  disabled?: boolean;
}

export function PercentInput({
  value,
  onChange,
  min = 0,
  max = 1,
  id,
  disabled,
}: PercentInputProps) {
  const [displayValue, setDisplayValue] = useState(
    (value * 100).toFixed(1).replace(".", ",")
  );
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setDisplayValue((value * 100).toFixed(1).replace(".", ","));
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseFloat(displayValue.replace(",", "."));
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed / 100, min, max);
      onChange(clamped);
      setDisplayValue((clamped * 100).toFixed(1).replace(".", ","));
    }
  }, [displayValue, onChange, min, max]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(e.target.value);
    },
    []
  );

  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue((value * 100).toFixed(1).replace(".", ","));
    }
  }, [value, isFocused]);

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className="pr-8"
        aria-label="Percentual"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        %
      </span>
    </div>
  );
}
