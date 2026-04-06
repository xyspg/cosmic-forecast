"use client";

import { useState, useMemo } from "react";
import marketsData from "@/data/markets.json";
import type { Market } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { MarketGrid } from "@/components/MarketGrid";

const markets = marketsData as Market[];

export default function MarketsPage() {
  const [category, setCategory] = useState("All");

  const filtered = useMemo(
    () =>
      category === "All"
        ? markets
        : markets.filter((m) => m.category === category),
    [category],
  );

  return (
    <>
      <Navbar activeCategory={category} onCategoryChange={setCategory} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">
          {category === "All" ? "All Markets" : `${category} Markets`}
        </h1>
        <MarketGrid markets={filtered} />
      </main>
    </>
  );
}
