"use client";

import { useMemo } from "react";

function generateOrders(
  centerPrice: number,
  side: "bid" | "ask",
  count: number,
  seed: string,
): { price: number; size: number; total: number }[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const orders: { price: number; size: number; total: number }[] = [];
  let cumulative = 0;

  for (let i = 0; i < count; i++) {
    hash = (hash * 16807) % 2147483647;
    const offset = (i + 1) * 0.01;
    const price = side === "bid" ? centerPrice - offset : centerPrice + offset;
    const clampedPrice = Math.max(0.01, Math.min(0.99, price));
    const size = Math.floor((Math.abs(hash) % 5000) + 100);
    cumulative += size;

    orders.push({
      price: Math.round(clampedPrice * 100) / 100,
      size,
      total: cumulative,
    });
  }

  return orders;
}

export function OrderBook({
  yesPrice,
  slug,
}: {
  yesPrice: number;
  slug: string;
}) {
  const bids = useMemo(
    () => generateOrders(yesPrice, "bid", 8, slug + "bid"),
    [yesPrice, slug],
  );
  const asks = useMemo(
    () => generateOrders(yesPrice, "ask", 8, slug + "ask"),
    [yesPrice, slug],
  );

  const maxTotal = Math.max(
    bids[bids.length - 1]?.total || 1,
    asks[asks.length - 1]?.total || 1,
  );

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Order Book</h3>
      </div>

      {/* Header */}
      <div className="grid grid-cols-3 px-4 py-2 text-xs font-medium text-muted">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (reversed so highest is on top) */}
      <div className="border-b border-border">
        {[...asks].reverse().map((order, i) => (
          <div
            key={`ask-${i}`}
            className="relative grid grid-cols-3 px-4 py-1 text-xs"
          >
            <div
              className="absolute inset-y-0 right-0 bg-red/5"
              style={{ width: `${(order.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-red tabular-nums font-medium">
              {Math.round(order.price * 100)}¢
            </span>
            <span className="relative text-right tabular-nums">
              {order.size.toLocaleString()}
            </span>
            <span className="relative text-right tabular-nums text-muted">
              {order.total.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="border-b border-border px-4 py-2 text-center">
        <span className="text-xs font-bold tabular-nums">
          {Math.round(yesPrice * 100)}¢
        </span>
        <span className="ml-2 text-xs text-muted">Spread: 1¢</span>
      </div>

      {/* Bids */}
      <div>
        {bids.map((order, i) => (
          <div
            key={`bid-${i}`}
            className="relative grid grid-cols-3 px-4 py-1 text-xs"
          >
            <div
              className="absolute inset-y-0 right-0 bg-green/5"
              style={{ width: `${(order.total / maxTotal) * 100}%` }}
            />
            <span className="relative text-green tabular-nums font-medium">
              {Math.round(order.price * 100)}¢
            </span>
            <span className="relative text-right tabular-nums">
              {order.size.toLocaleString()}
            </span>
            <span className="relative text-right tabular-nums text-muted">
              {order.total.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
