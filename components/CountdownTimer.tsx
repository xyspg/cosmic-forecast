"use client";

import { useState, useEffect, useCallback } from "react";

export function CountdownTimer({
  duration = 30,
  onComplete,
  paused = false,
}: {
  duration?: number;
  onComplete: () => void;
  paused?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (paused) return;
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, paused, onComplete]);

  const reset = useCallback(() => {
    setTimeLeft(duration);
  }, [duration]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-sm font-bold tabular-nums transition-all ${
        isCritical
          ? "vibrate bg-red/10 text-red"
          : isUrgent
            ? "pulse-glow bg-accent/10 text-accent"
            : "bg-gray-100 text-foreground"
      }`}
    >
      <div
        className={`h-2 w-2 rounded-full ${
          isCritical
            ? "bg-red animate-pulse"
            : isUrgent
              ? "bg-accent animate-pulse"
              : "bg-green"
        }`}
      />
      <span>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
      <span className="text-xs font-normal text-muted">until resolution</span>
    </div>
  );
}
