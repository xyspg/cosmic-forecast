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
      <div className="py-12 text-center text-muted">
        <p>No markets found in this category.</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
}
