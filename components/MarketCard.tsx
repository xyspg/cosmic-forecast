"use client";

import Link from "next/link";
import type { Market } from "@/lib/types";
import { formatVolume, getCategoryIcon } from "@/lib/fake-data";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { useCosmicStore } from "@/lib/store";
import { useHydrated } from "@/hooks/useHydrated";

export function MarketCard({ market }: { market: Market }) {
  const { yesPrice, noPrice, volume } = useMarketTicker(market);
  const hydrated = useHydrated();
  const resolution = useCosmicStore((s) => s.getResolution(market.id));
  const position = useCosmicStore((s) => s.getPosition(market.id));
  const pnl = useCosmicStore((s) => s.getPnL(market.id));

  const isResolved = hydrated && !!resolution;
  const yesPct = isResolved
    ? resolution.outcome === "YES" ? 100 : 0
    : Math.round(yesPrice * 100);
  const noPct = isResolved
    ? resolution.outcome === "NO" ? 100 : 0
    : Math.round(noPrice * 100);

  const icon = getCategoryIcon(market.category);

  return (
    <div
      className={`group rounded-xl border bg-white p-4 transition-all ${
        isResolved
          ? "border-gray-100 opacity-60"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Icon + Title */}
      <Link
        href={`/market/${market.id}`}
        className="flex items-start gap-3 mb-3"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
          {icon}
        </div>
        <h3 className="text-[13px] font-medium leading-snug text-gray-900 group-hover:underline transition-colors line-clamp-2">
          {market.question}
        </h3>
      </Link>

      {/* Resolved state */}
      {isResolved ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Outcome</span>
            <span
              className={`font-bold ${resolution.outcome === "YES" ? "text-green" : "text-red"}`}
            >
              {resolution.outcome}
            </span>
          </div>
          {hydrated && position && pnl !== null && (
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Your bet: {position.side}</span>
              <span
                className={`font-semibold ${pnl >= 0 ? "text-green" : "text-red"}`}
              >
                {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Two outcome rows — Polymarket style */}
          <div className="space-y-1.5 mb-3">
            {/* Yes row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/market/${market.id}?side=yes`}
                  className="text-sm text-gray-800 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600 transition-colors"
                >
                  Yes
                </Link>
                <span className="text-sm font-bold tabular-nums text-gray-900">
                  {yesPct}%
                </span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Link
                  href={`/market/${market.id}?side=yes`}
                  className="rounded-md bg-green-bg px-2.5 py-0.5 text-xs font-semibold text-green transition-colors hover:bg-green/15 active:scale-95"
                >
                  Yes
                </Link>
                <Link
                  href={`/market/${market.id}?side=no`}
                  className="rounded-md bg-red-bg px-2.5 py-0.5 text-xs font-semibold text-red transition-colors hover:bg-red/15 active:scale-95"
                >
                  No
                </Link>
              </div>
            </div>
            {/* No row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/market/${market.id}?side=no`}
                  className="text-sm text-gray-800 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600 transition-colors"
                >
                  No
                </Link>
                <span className="text-sm font-bold tabular-nums text-gray-900">
                  {noPct}%
                </span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Link
                  href={`/market/${market.id}?side=yes`}
                  className="rounded-md bg-green-bg px-2.5 py-0.5 text-xs font-semibold text-green transition-colors hover:bg-green/15 active:scale-95"
                >
                  Yes
                </Link>
                <Link
                  href={`/market/${market.id}?side=no`}
                  className="rounded-md bg-red-bg px-2.5 py-0.5 text-xs font-semibold text-red transition-colors hover:bg-red/15 active:scale-95"
                >
                  No
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom: volume */}
          <div className="text-xs text-gray-400">
            {formatVolume(volume)} Vol.
          </div>
        </>
      )}
    </div>
  );
}
