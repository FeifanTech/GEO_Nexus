"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

// Global keyboard shortcuts
export function useKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: Shortcut[] = useMemo(() => [
    // Navigation shortcuts (Alt + number)
    { key: "1", alt: true, action: () => router.push("/"), description: "工作台" },
    { key: "2", alt: true, action: () => router.push("/product-manager"), description: "产品管理" },
    { key: "3", alt: true, action: () => router.push("/competitors"), description: "竞品管理" },
    { key: "4", alt: true, action: () => router.push("/geo-diagnosis"), description: "GEO 诊断" },
    { key: "5", alt: true, action: () => router.push("/ai-monitor"), description: "AI 监测" },
    { key: "6", alt: true, action: () => router.push("/content-factory"), description: "内容工厂" },
    { key: "7", alt: true, action: () => router.push("/workflow"), description: "作业流" },
    { key: "8", alt: true, action: () => router.push("/settings"), description: "系统设置" },
  ], [router]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// Hook for custom page-specific shortcuts
export function usePageShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcuts display component data
export const GLOBAL_SHORTCUTS = [
  { keys: ["Alt", "1"], description: "前往工作台" },
  { keys: ["Alt", "2"], description: "前往产品管理" },
  { keys: ["Alt", "3"], description: "前往竞品管理" },
  { keys: ["Alt", "4"], description: "前往 GEO 诊断" },
  { keys: ["Alt", "5"], description: "前往 AI 监测" },
  { keys: ["Alt", "6"], description: "前往内容工厂" },
  { keys: ["Alt", "7"], description: "前往作业流" },
  { keys: ["Alt", "8"], description: "前往系统设置" },
  { keys: ["?"], description: "显示快捷键帮助" },
];
