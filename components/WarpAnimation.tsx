"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const MESSAGES = [
  "Consulting the cosmos...",
  "Analyzing solar flare data...",
  "Cross-referencing asteroid trajectories...",
  "Mapping coronal mass ejections...",
  "The universe has spoken.",
];

export function WarpAnimation({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete?: () => void;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [stars] = useState(() =>
    Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 1.5,
    })),
  );

  useEffect(() => {
    if (!active) {
      setMessageIndex(0);
      return;
    }

    const intervals = [1200, 1200, 1200, 1200, 800];
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < MESSAGES.length; i++) {
      timers.push(
        setTimeout(() => {
          setMessageIndex(i);
        }, elapsed),
      );
      elapsed += intervals[i];
    }

    timers.push(
      setTimeout(() => {
        onComplete?.();
      }, elapsed + 200),
    );

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.95)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Starfield */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ perspective: "400px" }}
          >
            {stars.map((star, i) => (
              <div
                key={i}
                className="absolute h-0.5 w-0.5 rounded-full bg-white"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  animation: `warp-star ${star.duration}s linear ${star.delay}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Radial gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 70%)",
            }}
          />

          {/* Center content */}
          <div className="relative z-10 text-center">
            {/* Spinning ring */}
            <motion.div
              className="mx-auto mb-8 h-20 w-20"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="h-full w-full rounded-full border-2 border-white/10"
                style={{
                  borderTopColor: "rgba(255,255,255,0.6)",
                  animation: "spin 1s linear infinite",
                }}
              />
            </motion.div>

            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                className="text-lg font-medium text-white/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>

            <p className="mt-3 text-xs text-white/30 font-mono">
              SHA-256 electromagnetic resonance analysis
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
