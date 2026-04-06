"use client";

import { motion } from "motion/react";
import type { Resolution } from "@/lib/store";

export function CosmicReport({
  resolution,
  marketQuestion,
}: {
  resolution: Resolution;
  marketQuestion: string;
}) {
  const isYes = resolution.outcome === "YES";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div
        className={`px-6 py-4 ${isYes ? "bg-green/5" : "bg-red/5"}`}
      >
        <h3 className="text-base font-bold mb-1">Cosmic Analysis Report</h3>
        <p className="text-sm text-muted">{marketQuestion}</p>
      </div>

      {/* Verdict */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted">Cosmic Verdict</span>
          <span
            className={`text-2xl font-black ${isYes ? "text-green" : "text-red"}`}
          >
            {resolution.outcome}
          </span>
        </div>
      </div>

      {/* NASA Event */}
      <div className="px-6 py-3 border-b border-border bg-gray-50">
        <p className="text-xs text-muted mb-1">Determining Event</p>
        <p className="text-sm font-mono font-medium">
          {resolution.nasaEventType}: {resolution.nasaEventId}
        </p>
      </div>

      {/* Explanation */}
      <div className="px-6 py-4 border-b border-border">
        <p className="text-sm leading-relaxed text-foreground/80">
          {resolution.explanation}
        </p>
      </div>

      {/* Footer stats */}
      <div className="px-6 py-3 flex items-center justify-between text-xs text-muted">
        <span>
          Cosmic Certainty:{" "}
          <span className="font-bold text-foreground tabular-nums">
            {resolution.confidence}%
          </span>
        </span>
        <span className="font-mono">
          Hash: {resolution.hash.slice(0, 12)}...
        </span>
      </div>

      {/* Methodology */}
      <div className="px-6 py-2 bg-gray-50 text-xs text-muted/70 text-center">
        Methodology: SHA-256 electromagnetic resonance analysis
      </div>
    </motion.div>
  );
}
