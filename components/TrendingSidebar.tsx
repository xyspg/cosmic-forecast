"use client";

import Link from "next/link";
import type { Market } from "@/lib/types";
import { formatVolume } from "@/lib/fake-data";
import { useMarketTicker } from "@/hooks/useMarketTicker";

function hashToNumber(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

function BreakingItem({ market, rank }: { market: Market; rank: number }) {
  const { yesPrice } = useMarketTicker(market);
  const pct = Math.round(yesPrice * 100);
  const changeDir = yesPrice > market.yesPrice;
  const changePct = hashToNumber(market.id, 36) + 5;

  return (
    <Link
      href={`/market/${market.id}`}
      className="flex items-start gap-3 py-2 transition-colors hover:bg-gray-50 rounded-md px-1 -mx-1"
    >
      <span className="mt-0.5 text-sm font-medium text-gray-400 tabular-nums w-4">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
          {market.question}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold tabular-nums text-gray-900">{pct}%</p>
        <p
          className={`text-xs tabular-nums font-medium ${changeDir ? "text-green" : "text-red"}`}
        >
          {changeDir ? "↗" : "↘"} {changePct}%
        </p>
      </div>
    </Link>
  );
}

function HotTopicItem({ market, rank }: { market: Market; rank: number }) {
  const { volume } = useMarketTicker(market);

  return (
    <Link
      href={`/market/${market.id}`}
      className="flex items-center gap-3 py-2 transition-colors hover:bg-gray-50 rounded-md px-1 -mx-1"
    >
      <span className="text-sm font-medium text-gray-400 tabular-nums w-4">
        {rank}
      </span>
      <span className="flex-1 text-sm font-medium text-gray-900 truncate">
        {market.question.split(" ").slice(0, 4).join(" ")}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-gray-500 tabular-nums">
          {formatVolume(volume)} today
        </span>
        <span className="text-orange-500 text-xs">🔥</span>
        <span className="text-gray-300">›</span>
      </div>
    </Link>
  );
}

export function TrendingSidebar({ markets }: { markets: Market[] }) {
  const breakingMarkets = markets.slice(0, 3);
  const hotMarkets = markets.slice(3, 8);

  return (
    <div className="space-y-6">
      {/* Breaking news */}
      <div>
        <Link
          href="/markets"
          className="flex items-center justify-between mb-3"
        >
          <h3 className="text-base font-bold text-gray-900">Breaking news</h3>
          <span className="text-gray-400">›</span>
        </Link>
        <div className="space-y-0.5">
          {breakingMarkets.map((m, i) => (
            <BreakingItem key={m.id} market={m} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Hot topics */}
      <div>
        <Link
          href="/markets"
          className="flex items-center justify-between mb-3"
        >
          <h3 className="text-base font-bold text-gray-900">Hot topics</h3>
          <span className="text-gray-400">›</span>
        </Link>
        <div className="space-y-0.5">
          {hotMarkets.map((m, i) => (
            <HotTopicItem key={m.id} market={m} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
