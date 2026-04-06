"use client";

import { useMemo } from "react";
import {
  generatePriceHistory,
  type PricePoint,
} from "@/lib/generate-price-history";

export function PriceChart({
  slug,
  currentPrice,
  appendedPoints,
}: {
  slug: string;
  currentPrice: number;
  appendedPoints?: PricePoint[];
}) {
  const data = useMemo(() => {
    const history = generatePriceHistory(slug, currentPrice, 80);
    if (appendedPoints) {
      return [...history, ...appendedPoints];
    }
    return history;
  }, [slug, currentPrice, appendedPoints]);

  // SVG chart dimensions
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minPrice = Math.min(...data.map((d) => d.price)) - 0.02;
  const maxPrice = Math.max(...data.map((d) => d.price)) + 0.02;

  const xScale = (i: number) =>
    padding.left + (i / (data.length - 1)) * chartW;
  const yScale = (p: number) =>
    padding.top + (1 - (p - minPrice) / (maxPrice - minPrice)) * chartH;

  // Build SVG path
  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.price)}`)
    .join(" ");

  // Area fill
  const areaD = `${pathD} L ${xScale(data.length - 1)} ${yScale(minPrice)} L ${xScale(0)} ${yScale(minPrice)} Z`;

  // Current price color
  const isUp = data.length > 1 && data[data.length - 1].price >= data[0].price;
  const color = isUp ? "#22c55e" : "#ef4444";

  // Y-axis labels
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const price = minPrice + ((maxPrice - minPrice) * i) / (yTicks - 1);
    return { price, y: yScale(price) };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Price History</h3>
        <div className="flex gap-2 text-xs">
          {["1H", "1D", "1W", "1M", "ALL"].map((period) => (
            <button
              key={period}
              type="button"
              className={`rounded px-2 py-1 transition-colors ${
                period === "1M"
                  ? "bg-foreground text-background"
                  : "text-muted hover:bg-gray-100"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {yLabels.map(({ price, y }) => (
          <g key={price}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={0.5}
            />
            <text
              x={padding.left - 5}
              y={y + 4}
              textAnchor="end"
              className="text-[10px] fill-[#9ca3af]"
            >
              {Math.round(price * 100)}¢
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill={color} opacity={0.08} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Current price dot */}
        <circle
          cx={xScale(data.length - 1)}
          cy={yScale(data[data.length - 1].price)}
          r={4}
          fill={color}
        />
        <circle
          cx={xScale(data.length - 1)}
          cy={yScale(data[data.length - 1].price)}
          r={8}
          fill={color}
          opacity={0.2}
        />
      </svg>
    </div>
  );
}
