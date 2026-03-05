"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { formatBRL, parseBRL } from "@/engine/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  disabled?: boolean;
}

export function CurrencyInput({ value, onChange, id, disabled }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(formatBRL(value));
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setDisplayValue(value === 0 ? "" : value.toString().replace(".", ","));
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseBRL(displayValue);
    onChange(parsed);
    setDisplayValue(formatBRL(parsed));
  }, [displayValue, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplayValue(raw);
      const parsed = parseBRL(raw);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    },
    [onChange]
  );

  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatBRL(value));
    }
  }, [value, isFocused]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        R$
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={isFocused ? displayValue : displayValue.replace("R$\u00a0", "")}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className="pl-10"
        aria-label="Valor em reais"
      />
    </div>
  );
}
