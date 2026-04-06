"use client";

import Link from "next/link";
import type { Market } from "@/lib/types";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { formatVolume, formatNumber } from "@/lib/fake-data";

export function FeaturedMarket({ market }: { market: Market }) {
  const ticker = useMarketTicker(market);

  const yesPct = Math.round(ticker.yesPrice * 100);
  const noPct = Math.round(ticker.noPrice * 100);

  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs font-medium text-foreground">
          Featured
        </span>
        <span className="text-xs text-muted">{market.category}</span>
      </div>

      <Link href={`/market/${market.id}`}>
        <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-2 hover:text-foreground/70 transition-colors">
          {market.question}
        </h2>
      </Link>

      <div className="flex items-center gap-4 text-xs text-muted mb-6">
        <span>{formatVolume(ticker.volume)} Vol.</span>
        <span>{formatNumber(ticker.totalBettors)} bettors</span>
      </div>

      {/* Yes / No — click navigates to detail with side pre-selected */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/market/${market.id}?side=yes`}
          className="flex flex-col items-center rounded-xl bg-green-bg p-4 transition-colors hover:bg-green/10 active:scale-[0.98]"
        >
          <span className="text-sm font-medium text-green mb-1">Yes</span>
          <span
            className={`text-3xl font-black tabular-nums text-green ${ticker.flashDirection === "up" ? "flash-green" : ""}`}
          >
            {yesPct}¢
          </span>
        </Link>
        <Link
          href={`/market/${market.id}?side=no`}
          className="flex flex-col items-center rounded-xl bg-red-bg p-4 transition-colors hover:bg-red/10 active:scale-[0.98]"
        >
          <span className="text-sm font-medium text-red mb-1">No</span>
          <span
            className={`text-3xl font-black tabular-nums text-red ${ticker.flashDirection === "down" ? "flash-red" : ""}`}
          >
            {noPct}¢
          </span>
        </Link>
      </div>
    </div>
  );
}
