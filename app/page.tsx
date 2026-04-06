"use client";

import { useState, useMemo } from "react";
import marketsData from "@/data/markets.json";
import type { Market } from "@/lib/types";
import { useCosmicStore } from "@/lib/store";
import { useHydrated } from "@/hooks/useHydrated";
import { Navbar } from "@/components/Navbar";
import { FeaturedMarket } from "@/components/FeaturedMarket";
import { MarketGrid } from "@/components/MarketGrid";
import { ActivityFeed } from "@/components/ActivityFeed";

const markets = marketsData as Market[];

export default function Home() {
  const [category, setCategory] = useState("All");
  const hydrated = useHydrated();
  const resolutions = useCosmicStore((s) => s.resolutions);

  const resolvedIds = useMemo(
    () => (hydrated ? new Set(resolutions.map((r) => r.marketId)) : new Set<string>()),
    [resolutions, hydrated],
  );

  // Featured: first non-resolved featured market
  const featuredMarket = useMemo(
    () => markets.find((m) => m.featured && !resolvedIds.has(m.id)),
    [resolvedIds],
  );

  // Grid: active first, resolved at the bottom
  const filteredMarkets = useMemo(() => {
    const base =
      category === "All"
        ? markets.filter((m) => m !== featuredMarket)
        : markets.filter(
            (m) => m.category === category && m !== featuredMarket,
          );

    const active = base.filter((m) => !resolvedIds.has(m.id));
    const resolved = base.filter((m) => resolvedIds.has(m.id));
    return [...active, ...resolved];
  }, [category, featuredMarket, resolvedIds]);

  return (
    <>
      <Navbar activeCategory={category} onCategoryChange={setCategory} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="space-y-8">
            {featuredMarket && <FeaturedMarket market={featuredMarket} />}

            <MarketGrid
              markets={filteredMarkets}
              title={
                category === "All" ? "All Markets" : `${category} Markets`
              }
            />
          </div>

          {/* Activity feed sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <ActivityFeed markets={markets} />
            </div>
          </aside>
        </div>

        <footer className="mt-16 border-t border-border py-6 text-center text-xs text-muted/60">
          Outcomes determined by cosmic forces beyond human comprehension.
        </footer>
      </main>
    </>
  );
}
