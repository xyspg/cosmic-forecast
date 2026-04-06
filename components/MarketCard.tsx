"use client";

import Link from "next/link";
import type { Market } from "@/lib/types";
import { formatVolume, formatNumber } from "@/lib/fake-data";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { useCosmicStore } from "@/lib/store";
import { useHydrated } from "@/hooks/useHydrated";

const CATEGORY_COLORS: Record<string, string> = {
  Politics: "bg-blue-100 text-blue-700",
  Crypto: "bg-orange-100 text-orange-700",
  Sports: "bg-emerald-100 text-emerald-700",
  Tech: "bg-purple-100 text-purple-700",
  Culture: "bg-pink-100 text-pink-700",
  Science: "bg-cyan-100 text-cyan-700",
};

export function MarketCard({ market }: { market: Market }) {
  const { yesPrice, noPrice, volume, totalBettors, flashDirection } =
    useMarketTicker(market);
  const hydrated = useHydrated();
  const resolution = useCosmicStore((s) => s.getResolution(market.id));
  const position = useCosmicStore((s) => s.getPosition(market.id));
  const pnl = useCosmicStore((s) => s.getPnL(market.id));

  // Don't show resolved state until hydrated to avoid mismatch
  const isResolved = hydrated && !!resolution;
  const yesPct = isResolved
    ? resolution.outcome === "YES" ? 100 : 0
    : Math.round(yesPrice * 100);
  const noPct = isResolved
    ? resolution.outcome === "NO" ? 100 : 0
    : Math.round(noPrice * 100);

  return (
    <div
      className={`group rounded-xl border bg-card p-4 transition-all ${
        isResolved
          ? "border-border/50 opacity-70"
          : "border-border hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Top row: category + status */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[market.category] || "bg-gray-100 text-gray-700"}`}
          >
            {market.category}
          </span>
          {isResolved && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-muted">
              Resolved
            </span>
          )}
        </div>
        <span className="text-xs text-muted">
          {formatNumber(totalBettors)} bettors
        </span>
      </div>

      {/* Question */}
      <Link href={`/market/${market.id}`}>
        <h3 className="mb-4 text-sm font-semibold leading-snug text-foreground group-hover:text-foreground/70 transition-colors line-clamp-2">
          {market.question}
        </h3>
      </Link>

      {/* Resolved state */}
      {isResolved ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
            <span className="text-xs font-medium text-muted">Outcome</span>
            <span
              className={`text-sm font-black ${resolution.outcome === "YES" ? "text-green" : "text-red"}`}
            >
              {resolution.outcome}
            </span>
          </div>
          {position && pnl !== null && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">
                Your bet: {position.side}
              </span>
              <span
                className={`font-bold tabular-nums ${pnl >= 0 ? "text-green" : "text-red"}`}
              >
                {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Yes/No buttons */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <Link
              href={`/market/${market.id}?side=yes`}
              className={`flex items-center justify-between rounded-md bg-green-bg px-3 py-2 transition-colors hover:bg-green/10 active:scale-[0.98] ${flashDirection === "up" ? "flash-green" : ""}`}
            >
              <span className="text-xs font-medium text-green">Yes</span>
              <span className="text-sm font-bold tabular-nums text-green">
                {yesPct}¢
              </span>
            </Link>
            <Link
              href={`/market/${market.id}?side=no`}
              className={`flex items-center justify-between rounded-md bg-red-bg px-3 py-2 transition-colors hover:bg-red/10 active:scale-[0.98] ${flashDirection === "down" ? "flash-red" : ""}`}
            >
              <span className="text-xs font-medium text-red">No</span>
              <span className="text-sm font-bold tabular-nums text-red">
                {noPct}¢
              </span>
            </Link>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{formatVolume(volume)} Vol.</span>
            <span className="flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Live
            </span>
          </div>
        </>
      )}
    </div>
  );
}
