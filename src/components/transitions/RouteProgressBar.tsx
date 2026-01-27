"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading
    setIsLoading(true);
    setProgress(30);

    // Simulate progress
    const timer1 = setTimeout(() => setProgress(60), 100);
    const timer2 = setTimeout(() => setProgress(90), 200);

    // Complete loading
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-blue-600 transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
}
