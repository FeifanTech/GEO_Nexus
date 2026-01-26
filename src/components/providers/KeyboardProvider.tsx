"use client";

import { ReactNode } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";

export function KeyboardProvider({ children }: { children: ReactNode }) {
  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <>
      {children}
      <KeyboardShortcutsDialog />
    </>
  );
}
