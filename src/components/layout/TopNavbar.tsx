"use client";

import React from "react";
import { Flame } from "lucide-react";

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-50 h-14 bg-card border-b border-border shadow-sm flex items-center px-6">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold tracking-tight text-foreground">
          Calculadora FIRE Brasil
        </span>
      </div>
    </header>
  );
}
