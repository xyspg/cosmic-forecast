"use client";

import { useState, useMemo } from "react";
import marketsData from "@/data/markets.json";
import type { Market } from "@/lib/types";
import { Navbar, CategoryTabs } from "@/components/Navbar";
import { MarketGrid } from "@/components/MarketGrid";

const markets = marketsData as Market[];

export default function MarketsPage() {
  const [category, setCategory] = useState("All");

  const filtered = useMemo(
    () =>
      category === "All" || category === "Trending" || category === "New"
        ? markets
        : markets.filter((m) => m.category === category),
    [category],
  );

  return (
    <>
      <Navbar />
      <CategoryTabs active={category} onChange={setCategory} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <MarketGrid markets={filtered} title="All markets" />
      </main>
    </>
  );
}
