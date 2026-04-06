"use client";

import { useState, useCallback } from "react";
import type { CosmicResolution } from "@/lib/types";

type ResolutionState =
  | { status: "idle" }
  | { status: "resolving" }
  | { status: "resolved"; result: CosmicResolution }
  | { status: "error"; error: string };

export function useCosmicResolution() {
  const [state, setState] = useState<ResolutionState>({ status: "idle" });

  const resolve = useCallback(async (marketSlug: string) => {
    setState({ status: "resolving" });

    try {
      const date = new Date().toISOString().split("T")[0];

      // Fire both API calls in parallel
      const [resolveRes, cosmicRes] = await Promise.all([
        fetch("/api/resolve-bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ marketSlug, date }),
        }),
        fetch("/api/cosmic-data"),
      ]);

      if (!resolveRes.ok) throw new Error("Resolution failed");

      const resolveData = await resolveRes.json();
      const cosmicData = cosmicRes.ok ? await cosmicRes.json() : null;

      // Now get the explanation
      const explanationRes = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketSlug,
          outcome: resolveData.outcome,
          nasaEvent: resolveData.nasaEvent || cosmicData?.events?.[0],
          marketQuestion: resolveData.marketQuestion,
        }),
      });

      let explanation = "The cosmos has spoken. No further explanation is required.";
      if (explanationRes.ok) {
        const explData = await explanationRes.json();
        explanation = explData.explanation || explanation;
      }

      const result: CosmicResolution = {
        outcome: resolveData.outcome,
        nasaEventId: resolveData.nasaEventId,
        nasaEventType: resolveData.nasaEventType || "Solar Flare",
        hash: resolveData.hash,
        explanation,
        confidence: Math.round((85 + Math.random() * 14.9) * 10) / 10,
      };

      setState({ status: "resolved", result });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setState({ status: "error", error: msg });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, resolve, reset };
}
