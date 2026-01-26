"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";
import { GLOBAL_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show dialog on "?" key
      if (event.key === "?" && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          event.preventDefault();
          setIsOpen(true);
        }
      }
      // Close on Escape
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            键盘快捷键
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Navigation */}
          <div>
            <h4 className="text-sm font-medium text-slate-500 mb-2">导航</h4>
            <div className="space-y-2">
              {GLOBAL_SHORTCUTS.filter(s => s.keys[0] === "Alt").map((shortcut, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm text-slate-700">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        <Badge variant="outline" className="font-mono text-xs">
                          {key}
                        </Badge>
                        {i < shortcut.keys.length - 1 && (
                          <span className="text-slate-400 mx-1">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-medium text-slate-500 mb-2">帮助</h4>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-slate-700">显示快捷键帮助</span>
              <Badge variant="outline" className="font-mono text-xs">?</Badge>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-slate-400">
            按 <Badge variant="outline" className="font-mono text-xs mx-1">Esc</Badge> 关闭
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
