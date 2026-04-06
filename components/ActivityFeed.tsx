"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { randomWallet, randomAmount, randomSide } from "@/lib/fake-data";
import type { Market } from "@/lib/types";

interface Trade {
  id: number;
  wallet: string;
  side: "YES" | "NO";
  amount: number;
  marketId: string;
  marketQuestion: string;
}

function pickMarket(markets: Market[]): Market {
  return markets[Math.floor(Math.random() * markets.length)];
}

export function ActivityFeed({ markets }: { markets: Market[] }) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const initial: Trade[] = Array.from({ length: 8 }, (_, i) => {
      const m = pickMarket(markets);
      return {
        id: i,
        wallet: randomWallet(),
        side: randomSide(),
        amount: randomAmount(),
        marketId: m?.id || "",
        marketQuestion: m?.question || "",
      };
    });
    setTrades(initial);
    let nextId = 8;

    const interval = setInterval(
      () => {
        const m = pickMarket(markets);
        setTrades((prev) => [
          {
            id: nextId++,
            wallet: randomWallet(),
            side: randomSide(),
            amount: randomAmount(),
            marketId: m?.id || "",
            marketQuestion: m?.question || "",
          },
          ...prev.slice(0, 12),
        ]);
      },
      2500 + Math.random() * 2000,
    );

    return () => clearInterval(interval);
  }, [markets]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
      </div>
      <div className="max-h-[500px] overflow-y-auto scrollbar-none">
        <AnimatePresence initial={false}>
          {trades.map((trade) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{
                opacity: { duration: 0.3 },
                height: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
              }}
              className="overflow-hidden"
            >
              <Link
                href={`/market/${trade.marketId}`}
                className="flex items-start gap-3 border-b border-gray-50 px-4 py-2.5 text-xs transition-colors last:border-0 hover:bg-gray-50"
              >
                <div
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${trade.side === "YES" ? "bg-green" : "bg-red"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500">
                    <span className="font-mono font-medium text-gray-900">
                      {trade.wallet}
                    </span>{" "}
                    bought{" "}
                    <span
                      className={`font-semibold ${trade.side === "YES" ? "text-green" : "text-red"}`}
                    >
                      {trade.side}
                    </span>{" "}
                    for ${trade.amount}
                  </p>
                  <p className="mt-0.5 truncate text-gray-400">
                    {trade.marketQuestion}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
