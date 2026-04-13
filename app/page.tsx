"use client";

import { useState, useMemo } from "react";
import marketsData from "@/data/markets.json";
import type { Market } from "@/lib/types";
import { useCosmicStore } from "@/lib/store";
import { useHydrated } from "@/hooks/useHydrated";
import { Navbar, CategoryTabs } from "@/components/Navbar";
import { FeaturedMarket } from "@/components/FeaturedMarket";
import { MarketGrid } from "@/components/MarketGrid";
import { TrendingSidebar } from "@/components/TrendingSidebar";

const markets = marketsData as Market[];

export default function Home() {
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

  const featuredMarket = useMemo(
    () => markets.find((m) => m.featured && !resolvedIds.has(m.id)),
    [resolvedIds],
  );

  const filteredMarkets = useMemo(() => {
    let base = markets.filter((m) => m !== featuredMarket);

    if (category !== "All" && category !== "Trending" && category !== "New") {
      base = base.filter((m) => m.category === category);
    }

    const active = base.filter((m) => !resolvedIds.has(m.id));
    const resolved = base.filter((m) => resolvedIds.has(m.id));
    return [...active, ...resolved];
  }, [category, featuredMarket, resolvedIds]);

  // Markets for sidebar — pick interesting ones
  const sidebarMarkets = useMemo(
    () => markets.filter((m) => !resolvedIds.has(m.id)).slice(0, 8),
    [resolvedIds],
  );

  return (
    <>
      <Navbar />
      <CategoryTabs active={category} onChange={setCategory} />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main content */}
          <div className="space-y-8">
            {/* Featured market hero */}
            {featuredMarket && <FeaturedMarket market={featuredMarket} />}

            {/* All markets grid */}
            <MarketGrid markets={filteredMarkets} title="All markets" />
          </div>

          {/* Right sidebar — Breaking news + Hot topics */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <TrendingSidebar markets={sidebarMarkets} />
            </div>
          </aside>
        </div>

        <footer className="mt-16 border-t border-gray-100 py-6 text-center text-xs text-gray-400">
          Outcomes determined by cosmic forces beyond human comprehension.
        </footer>
      </main>
    </>
  );
}
