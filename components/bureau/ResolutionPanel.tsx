import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import marketsData from "@/data/markets.json";
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
  const resolutions = useCosmicStore((s) => s.resolutions);

  const items = useMemo(() => {
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
  }, [resolutions]);

  if (items.length === 0) return null;

  return (
    <section className="border-ink bg-paper border p-4">
      <div className="border-rule flex items-baseline justify-between border-b pb-2">
        <div className="bureau-serif text-[18px] font-medium tracking-[-0.01em]">
          Resolution archive
        </div>
        <span className="bureau-eyebrow">RECENT · {items.length}</span>
      </div>
      {items.map((r, i) => (
        <Link
          key={r.id}
          to="/resolution/$slug"
          params={{ slug: r.id }}
          className={`block py-3 text-inherit no-underline ${i === items.length - 1 ? "" : "border-rule border-b border-dashed"}`}
        >
          <div className="bureau-mono text-ink-4 text-[9px] tracking-[0.1em] uppercase">
            {r.resolvedOn}
          </div>
          <div className="bureau-serif my-[3px] text-[14px] leading-[1.3]">{r.question}</div>
          <div className="mt-[6px] flex items-baseline justify-between">
            <div className="bureau-mono text-ink-3 text-[10px] tracking-[0.05em]">
              Resolved <b className="text-ink">{r.outcome}</b> · {r.ref}
            </div>
            <span className="bureau-mono text-amber text-[10px]">◈ {r.eventTag}</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
