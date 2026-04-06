"use client";

import type { Market } from "@/lib/types";
import { MarketCard } from "./MarketCard";

export function MarketGrid({
  markets,
  title,
}: {
  markets: Market[];
  title?: string;
}) {
  if (markets.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400">
        <p>No markets found in this category.</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
}
