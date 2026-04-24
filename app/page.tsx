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
    () => (hydrated ? new Set(resolutions.map((r) => r.marketId)) : new Set<string>()),
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
    <div className="bg-paper text-ink">
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="markets" />

      <div className="bureau-page pt-7">
        <Masthead
          activeCount={enriched.filter((m) => !resolvedIds.has(m.id)).length}
          openInterest={fmtUSDShort(totalOpenInterest)}
          nextSettlement="14 HR 38 MIN"
        />
      </div>

      <div className="bureau-page grid grid-cols-[1fr_320px] gap-8 max-[960px]:grid-cols-1 max-[960px]:gap-6">
        <div>
          {lead && <LeadMarket m={lead} slug={lead.id} />}

          <div className="mt-7">
            <CategoryBar active={category} onChange={setCategory} />
          </div>

          <div className="border-ink mt-5 flex items-baseline justify-between border-b-2 pb-2">
            <div className="bureau-serif text-[22px] font-medium tracking-[-0.01em]">
              Active markets
            </div>
            <div className="bureau-mono text-ink-3 text-[10px] tracking-[0.1em] uppercase">
              {tableMarkets.length} of {enriched.length} · updated 14:22:41 UTC
            </div>
          </div>

          <MarketTable markets={tableMarkets} seriesById={seriesById} />
        </div>

        <aside className="flex flex-col gap-6">
          <ResolutionPanel />
          <WirePanel />
          <SolarPanel />
        </aside>
      </div>

      <Disclaimer />
    </div>
  );
}
