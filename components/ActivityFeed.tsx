"use client";

import { useState, useEffect } from "react";
import { randomWallet, randomAmount, randomSide } from "@/lib/fake-data";
import type { Market } from "@/lib/types";

interface Trade {
  id: number;
  wallet: string;
  side: "YES" | "NO";
  amount: number;
  market: string;
  timestamp: number;
}

export function ActivityFeed({ markets }: { markets: Market[] }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const nextId = { current: 0 };

  useEffect(() => {
    // Generate initial trades
    const initial: Trade[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      wallet: randomWallet(),
      side: randomSide(),
      amount: randomAmount(),
      market:
        markets[Math.floor(Math.random() * markets.length)]?.question || "",
      timestamp: Date.now() - i * 3000,
    }));
    nextId.current = 8;
    setTrades(initial);

    // Add new trades every 2-4 seconds
    const interval = setInterval(
      () => {
        const newTrade: Trade = {
          id: nextId.current++,
          wallet: randomWallet(),
          side: randomSide(),
          amount: randomAmount(),
          market:
            markets[Math.floor(Math.random() * markets.length)]?.question || "",
          timestamp: Date.now(),
        };
        setTrades((prev) => [newTrade, ...prev.slice(0, 14)]);
      },
      2000 + Math.random() * 2000,
    );

    return () => clearInterval(interval);
  }, [markets]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Recent Activity</h3>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-start gap-3 border-b border-border/50 px-4 py-2.5 text-xs transition-colors last:border-0"
          >
            <div
              className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${trade.side === "YES" ? "bg-green" : "bg-red"}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-muted">
                <span className="font-mono font-medium text-foreground">
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
              <p className="mt-0.5 truncate text-muted/70">
                {trade.market}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
