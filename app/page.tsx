"use client";

import { useMemo, useState } from "react";
import { CategoryBar } from "@/components/bureau/CategoryBar";
import { Disclaimer } from "@/components/bureau/Disclaimer";
import { FlareTicker } from "@/components/bureau/FlareTicker";
import { GovHeaderStrip } from "@/components/bureau/GovHeaderStrip";
import { LeadMarket } from "@/components/bureau/LeadMarket";
import { MarketTable } from "@/components/bureau/MarketTable";
import { Masthead } from "@/components/bureau/Masthead";
import { Nav } from "@/components/bureau/Nav";
import { ResolutionPanel } from "@/components/bureau/ResolutionPanel";
import { SolarPanel } from "@/components/bureau/SolarPanel";
import { WirePanel } from "@/components/bureau/WirePanel";
import marketsData from "@/data/markets.json";
import { useHydrated } from "@/hooks/useHydrated";
import { generatePriceHistory } from "@/lib/generate-price-history";
import { enrich, fmtUSDShort } from "@/lib/market-metadata";
import { useCosmicStore } from "@/lib/store";
import type { Market } from "@/lib/types";
import HomeLoading from "./loading";

const rawMarkets = marketsData as Market[];

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const hydrated = useHydrated();
  const resolutions = useCosmicStore((s) => s.resolutions);

  const resolvedIds = useMemo(
    () =>
      hydrated
        ? new Set(resolutions.map((r) => r.marketId))
        : new Set<string>(),
    [resolutions, hydrated],
  );

  const enriched = useMemo(() => rawMarkets.map((m, i) => enrich(m, i)), []);

  const lead = useMemo(() => {
    const featured = enriched.find((m) => m.featured && !resolvedIds.has(m.id));
    if (featured) return featured;
    const unresolved = enriched
      .filter((m) => !resolvedIds.has(m.id))
      .sort((a, b) => b.volume - a.volume);
    if (unresolved.length > 0) return unresolved[0];
    return enriched[0];
  }, [enriched, resolvedIds]);

  const tableMarkets = useMemo(() => {
    let base = enriched.filter((m) => m.id !== lead?.id);
    if (category === "Resolved") {
      return base.filter((m) => resolvedIds.has(m.id));
    }
    if (category !== "All") {
      base = base.filter((m) => m.category === category);
    }
    const active = base.filter((m) => !resolvedIds.has(m.id));
    const resolved = base.filter((m) => resolvedIds.has(m.id));
    return [...active, ...resolved];
  }, [category, enriched, lead?.id, resolvedIds]);

  const seriesById = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const m of enriched) {
      map[m.id] = generatePriceHistory(m.id, m.yesPrice, 180).map((p) => p.yes);
    }
    return map;
  }, [enriched]);

  const totalOpenInterest = useMemo(
    () => enriched.reduce((acc, m) => acc + m.volume, 0),
    [enriched],
  );

  if (!hydrated) return <HomeLoading />;

  return (
    <div style={{ background: "var(--paper)", color: "var(--ink)" }}>
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="markets" />

      <div className="bureau-page" style={{ padding: "28px 32px 0" }}>
        <Masthead
          activeCount={enriched.filter((m) => !resolvedIds.has(m.id)).length}
          openInterest={fmtUSDShort(totalOpenInterest)}
          nextSettlement="14 HR 38 MIN"
        />
      </div>

      <div
        className="bureau-page bureau-main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 32,
        }}
      >
        <div>
          {lead && (
            <LeadMarket
              m={lead}
              series={seriesById[lead.id] ?? []}
              slug={lead.id}
            />
          )}

          <div style={{ marginTop: 28 }}>
            <CategoryBar active={category} onChange={setCategory} />
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingBottom: 8,
              borderBottom: "2px solid var(--ink)",
            }}
          >
            <div
              className="bureau-serif"
              style={{
                fontSize: 22,
                letterSpacing: "-0.01em",
                fontWeight: 500,
              }}
            >
              Active markets
            </div>
            <div
              className="bureau-mono"
              style={{
                fontSize: 10,
                color: "var(--ink-3)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {tableMarkets.length} of {enriched.length} · updated 14:22:41 UTC
            </div>
          </div>

          <MarketTable markets={tableMarkets} seriesById={seriesById} />
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <ResolutionPanel />
          <WirePanel />
          <SolarPanel />
        </aside>
      </div>

      <Disclaimer />
    </div>
  );
}
