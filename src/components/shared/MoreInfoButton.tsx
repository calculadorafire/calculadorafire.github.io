"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface MoreInfoButtonProps {
  title: string;
  children: React.ReactNode;
}

export function MoreInfoButton({ title, children }: MoreInfoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1 text-muted-foreground"
      >
        <Info className="h-4 w-4" />
        Mais informações
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        {children}
      </Dialog>
    </>
  );
}
