"use client";

import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-0 m-auto rounded-lg border bg-card text-card-foreground shadow-lg max-w-lg w-full max-h-[85vh] p-0 backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[70vh] text-sm leading-relaxed">
        {children}
      </div>
    </dialog>
  );
}
