"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { generatePriceHistory } from "@/lib/generate-price-history";
import { randomAmount } from "@/lib/fake-data";

interface FloatingDollar {
  id: number;
  amount: number;
  x: number;
  y: number;
}

const W = 700;
const H = 280;
const PAD = { top: 15, right: 50, bottom: 25, left: 10 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

function yScale(p: number) {
  return PAD.top + (1 - p) * CH;
}

export function PriceChart({
  slug,
  currentPrice,
}: {
  slug: string;
  currentPrice: number;
}) {
  const data = useMemo(
    () => generatePriceHistory(slug, currentPrice, 200),
    [slug, currentPrice],
  );

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [floatingDollars, setFloatingDollars] = useState<FloatingDollar[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  function xScale(i: number) {
    return PAD.left + (i / (data.length - 1)) * CW;
  }

  // Build paths
  const yesPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.yes)}`)
    .join(" ");
  const noPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d.no)}`)
    .join(" ");
  const yesArea = `${yesPath} L ${xScale(data.length - 1)} ${PAD.top + CH} L ${xScale(0)} ${PAD.top + CH} Z`;

  const activePoint =
    hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  // Mouse handler — directly on the container div
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    const relX = mouseX - PAD.left;
    const idx = Math.round((relX / CW) * (data.length - 1));
    if (idx >= 0 && idx < data.length) {
      setHoverIndex(idx);
    }
  }

  function handleMouseLeave() {
    setHoverIndex(null);
  }

  // Floating dollars
  useEffect(() => {
    let nextId = 0;
    const interval = setInterval(() => {
      setFloatingDollars((prev) => [
        ...prev.slice(-5),
        {
          id: nextId++,
          amount: randomAmount(),
          x: 15 + Math.random() * 65,
          y: 15 + Math.random() * 50,
        },
      ]);
    }, 2000 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, []);

  // Grid + time labels
  const gridLines = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  const timeLabels = useMemo(() => {
    const indices = [
      0,
      Math.floor(data.length * 0.25),
      Math.floor(data.length * 0.5),
      Math.floor(data.length * 0.75),
      data.length - 1,
    ];
    return indices.map((idx) => ({
      x: xScale(idx),
      text: data[idx].date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [data]);

  const hoverDate =
    hoverIndex !== null
      ? data[hoverIndex].date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">Yes</span>
            <span className="text-xl sm:text-2xl font-black tabular-nums text-gray-900">
              {Math.round(activePoint.yes * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-300" />
            <span className="text-sm text-gray-600">No</span>
            <span className="text-xl sm:text-2xl font-black tabular-nums text-gray-900">
              {Math.round(activePoint.no * 100)}%
            </span>
          </div>
        </div>
        <div className="flex gap-1 text-xs">
          {["1H", "1D", "1W", "1M", "ALL"].map((period) => (
            <button
              key={period}
              type="button"
              className={`rounded-md px-2.5 py-1 transition-colors ${
                period === "1M"
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Hover date */}
      <div className="h-5 mb-1">
        {hoverDate && (
          <span className="text-xs text-gray-400">{hoverDate}</span>
        )}
      </div>

      {/* Chart — mouse events on this div */}
      <div
        ref={containerRef}
        className="relative cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto pointer-events-none">
          {/* Dotted grid */}
          {gridLines.map((p) => {
            const y = yScale(p);
            return (
              <g key={p}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={W - PAD.right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={0.5}
                  strokeDasharray="4 4"
                />
                <text
                  x={W - PAD.right + 5}
                  y={y + 4}
                  textAnchor="start"
                  className="text-[10px] fill-gray-400"
                >
                  {Math.round(p * 100)}%
                </text>
              </g>
            );
          })}

          {/* Time axis */}
          {timeLabels.map((label) => (
            <text
              key={label.text}
              x={label.x}
              y={H - 4}
              textAnchor="middle"
              className="text-[10px] fill-gray-400"
            >
              {label.text}
            </text>
          ))}

          {/* Yes area fill */}
          <path d={yesArea} fill="#3b82f6" opacity={0.04} />

          {/* No line */}
          <path
            d={noPath}
            fill="none"
            stroke="#93c5fd"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {/* Yes line */}
          <path
            d={yesPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* Hover crosshair */}
          {hoverIndex !== null && (
            <>
              <line
                x1={xScale(hoverIndex)}
                y1={PAD.top}
                x2={xScale(hoverIndex)}
                y2={PAD.top + CH}
                stroke="#d1d5db"
                strokeWidth={1}
              />
              <circle
                cx={xScale(hoverIndex)}
                cy={yScale(data[hoverIndex].yes)}
                r={5}
                fill="white"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <circle
                cx={xScale(hoverIndex)}
                cy={yScale(data[hoverIndex].no)}
                r={4}
                fill="white"
                stroke="#93c5fd"
                strokeWidth={2}
              />
              {/* Yes tooltip */}
              <rect
                x={xScale(hoverIndex) - 50}
                y={yScale(data[hoverIndex].yes) - 28}
                width={100}
                height={22}
                rx={4}
                fill="#3b82f6"
                opacity={0.9}
              />
              <text
                x={xScale(hoverIndex)}
                y={yScale(data[hoverIndex].yes) - 13}
                textAnchor="middle"
                className="text-[11px] fill-white font-semibold"
              >
                Yes {Math.round(data[hoverIndex].yes * 1000) / 10}%
              </text>
              {/* No tooltip */}
              <rect
                x={xScale(hoverIndex) - 45}
                y={yScale(data[hoverIndex].no) + 6}
                width={90}
                height={22}
                rx={4}
                fill="#60a5fa"
                opacity={0.9}
              />
              <text
                x={xScale(hoverIndex)}
                y={yScale(data[hoverIndex].no) + 21}
                textAnchor="middle"
                className="text-[11px] fill-white font-semibold"
              >
                No {Math.round(data[hoverIndex].no * 1000) / 10}%
              </text>
            </>
          )}

          {/* Current price dots (when not hovering) */}
          {hoverIndex === null && (
            <>
              <circle
                cx={xScale(data.length - 1)}
                cy={yScale(data[data.length - 1].yes)}
                r={4}
                fill="#3b82f6"
              />
              <circle
                cx={xScale(data.length - 1)}
                cy={yScale(data[data.length - 1].yes)}
                r={8}
                fill="#3b82f6"
                opacity={0.15}
              />
              <circle
                cx={xScale(data.length - 1)}
                cy={yScale(data[data.length - 1].no)}
                r={3}
                fill="#93c5fd"
              />
            </>
          )}
        </svg>

        {/* Floating dollar amounts */}
        <AnimatePresence>
          {floatingDollars.map((d) => (
            <motion.span
              key={d.id}
              className="absolute text-xs font-semibold tabular-nums text-green pointer-events-none"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: -35 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3,
                ease: "easeOut",
                opacity: { times: [0, 0.15, 0.7, 1] },
              }}
            >
              + ${d.amount}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Live indicator */}
      <div className="mt-2 flex items-center justify-end text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />
          LIVE
        </span>
      </div>
    </div>
  );
}
