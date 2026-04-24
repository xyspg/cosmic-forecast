"use client";

import { useCallback, useState } from "react";

import type { CosmicResolution, ResolveBetResponse } from "@/lib/types";

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

      const resolveRes = await fetch("/api/resolve-bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketSlug, date }),
      });

      if (!resolveRes.ok) throw new Error("Resolution failed");

      const resolveData = (await resolveRes.json()) as ResolveBetResponse;

      const result: CosmicResolution = {
        outcome: resolveData.outcome,
        nasaEventId: resolveData.nasaEventId,
        nasaEventType: resolveData.nasaEventType || "Solar Flare",
        hash: resolveData.hash,
        explanation:
          resolveData.explanation || "The cosmos has spoken. No further explanation is required.",
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
