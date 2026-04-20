"use client";

import Link from "next/link";
import { useMemo } from "react";
import marketsData from "@/data/markets.json";
import { useHydrated } from "@/hooks/useHydrated";
import { enrich } from "@/lib/market-metadata";
import { useCosmicStore } from "@/lib/store";
import type { Market } from "@/lib/types";

const rawMarkets = marketsData as Market[];

function formatStamp(ts: number): string {
  const d = new Date(ts);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const mm = months[d.getUTCMonth()];
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${mm} ${dd}, ${yyyy} · ${hh}:${mi}:${ss} UTC`;
}

function eventTag(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("cme") || t.includes("coronal")) return "CME";
  if (t.includes("geomag") || t.includes("gst")) return "GST";
  if (t.includes("flare") || t.startsWith("flr")) return "FLR";
  return "FLR";
}

export function ResolutionPanel() {
  const hydrated = useHydrated();
  const resolutions = useCosmicStore((s) => s.resolutions);

  const items = useMemo(() => {
    if (!hydrated) return [];
    return [...resolutions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map((r) => {
        const idx = rawMarkets.findIndex((m) => m.id === r.marketId);
        if (idx < 0) return null;
        const bureau = enrich(rawMarkets[idx], idx);
        return {
          id: r.marketId,
          question: bureau.question,
          outcome: r.outcome,
          resolvedOn: formatStamp(r.timestamp),
          ref: bureau.ref,
          eventTag: eventTag(r.nasaEventType),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [hydrated, resolutions]);

  if (!hydrated || items.length === 0) return null;

  return (
    <section
      style={{
        border: "1px solid var(--ink)",
        padding: 16,
        background: "var(--paper)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: 8,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div
          className="bureau-serif"
          style={{
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          Resolution archive
        </div>
        <span className="bureau-eyebrow">RECENT · {items.length}</span>
      </div>
      {items.map((r, i) => (
        <Link
          key={r.id}
          href={`/resolution/${r.id}`}
          style={{
            display: "block",
            padding: "12px 0",
            borderBottom:
              i === items.length - 1 ? "none" : "1px dashed var(--rule)",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <div
            className="bureau-mono"
            style={{
              fontSize: 9,
              letterSpacing: "0.1em",
              color: "var(--ink-4)",
              textTransform: "uppercase",
            }}
          >
            {r.resolvedOn}
          </div>
          <div
            className="bureau-serif"
            style={{ fontSize: 14, lineHeight: 1.3, margin: "3px 0" }}
          >
            {r.question}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginTop: 6,
            }}
          >
            <div
              className="bureau-mono"
              style={{
                fontSize: 10,
                color: "var(--ink-3)",
                letterSpacing: "0.05em",
              }}
            >
              Resolved <b style={{ color: "var(--ink)" }}>{r.outcome}</b> ·{" "}
              {r.ref}
            </div>
            <span
              className="bureau-mono"
              style={{ fontSize: 10, color: "var(--amber)" }}
            >
              ◈ {r.eventTag}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
