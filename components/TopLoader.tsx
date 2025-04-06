"use client";

import { useEffect, useState } from "react";
import { useLoading } from "./LoadingProvider";

export default function TopLoader() {
  const { isLoading } = useLoading();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      // Reset progress
      setProgress(0);

      // Start progress animation
      const timer1 = setTimeout(() => setProgress(20), 50);
      const timer2 = setTimeout(() => setProgress(40), 100);
      const timer3 = setTimeout(() => setProgress(60), 200);
      const timer4 = setTimeout(() => setProgress(80), 300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else {
      // Complete the progress bar
      setProgress(100);

      // Hide the loader after animation completes
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300); // Match the transition duration

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible && !isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
