"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import type { Market } from "@/lib/types";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import {
  getCategoryIcon,
  randomUsername,
  randomComment,
  randomAvatarColor,
} from "@/lib/fake-data";
import { generatePriceHistory } from "@/lib/generate-price-history";
import { RollingVolume } from "./RollingNumber";

interface FakeComment {
  id: number;
  username: string;
  comment: string;
  color: string;
}

// Chart constants
const CW_TOTAL = 500;
const CH_TOTAL = 140;
const PAD = { top: 10, right: 40, bottom: 20, left: 5 };
const CW = CW_TOTAL - PAD.left - PAD.right;
const CH = CH_TOTAL - PAD.top - PAD.bottom;

function yS(p: number) {
  return PAD.top + (1 - p) * CH;
}

export function FeaturedMarket({ market }: { market: Market }) {
  const ticker = useMarketTicker(market);
  const [comments, setComments] = useState<FakeComment[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const yesPct = Math.round(ticker.yesPrice * 100);
  const noPct = Math.round(ticker.noPrice * 100);

  // Smooth constant scroll for comments — use setInterval, not rAF
  useEffect(() => {
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop += 0.5;
      }
    }, 50);
    return () => clearInterval(id);
  }, []);

  // Generate comments
  useEffect(() => {
    const initial: FakeComment[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      username: randomUsername(),
      comment: randomComment(),
      color: randomAvatarColor(),
    }));
    setComments(initial);
    let nextId = 12;

    const interval = setInterval(() => {
      setComments((prev) => [
        ...prev,
        {
          id: nextId++,
          username: randomUsername(),
          comment: randomComment(),
          color: randomAvatarColor(),
        },
      ]);
    }, 3500 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [market.id]);

  // Chart data
  const history = generatePriceHistory(market.id, ticker.yesPrice, 120);

  function xS(i: number) {
    return PAD.left + (i / (history.length - 1)) * CW;
  }

  const yesPathD = history
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xS(i)} ${yS(d.yes)}`)
    .join(" ");
  const noPathD = history
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xS(i)} ${yS(d.no)}`)
    .join(" ");
  const yesAreaD = `${yesPathD} L ${xS(history.length - 1)} ${PAD.top + CH} L ${xS(0)} ${PAD.top + CH} Z`;

  // Active point for header display
  const activePoint = hoverIndex !== null ? history[hoverIndex] : history[history.length - 1];
  const activeYesPct = Math.round(activePoint.yes * 100);
  const activeNoPct = Math.round(activePoint.no * 100);

  // Hover date
  const hoverDate = hoverIndex !== null
    ? history[hoverIndex].date.toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
      })
    : null;

  // Chart mouse handlers
  function handleChartMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = chartRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * CW_TOTAL;
    const relX = mouseX - PAD.left;
    const idx = Math.round((relX / CW) * (history.length - 1));
    if (idx >= 0 && idx < history.length) {
      setHoverIndex(idx);
    }
  }

  function handleChartMouseLeave() {
    setHoverIndex(null);
  }

  // Time labels
  const timeIndices = [0, Math.floor(history.length * 0.5), history.length - 1];
  const timeLabels = timeIndices.map((idx) => ({
    x: xS(idx),
    text: history[idx].date.toLocaleString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Top section */}
      <div className="relative px-5 pt-5 pb-3">
        {/* Market header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>{market.category}</span>
            </div>
            <Link href={`/market/${market.id}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg">
                  {getCategoryIcon(market.category)}
                </div>
                <h2 className="text-lg font-medium leading-snug text-gray-900 hover:text-gray-600 transition-colors">
                  {market.question}
                </h2>
              </div>
            </Link>
          </div>

          {/* Legend */}
          <div className="shrink-0 text-right ml-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500">Yes {activeYesPct}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-300" />
                <span className="text-xs text-gray-500">No {activeNoPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome row — same size, no hierarchy */}
        <div className="flex items-center gap-8 mb-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-500">Yes</span>
            <span className="text-2xl font-bold tabular-nums text-gray-900">
              {activeYesPct}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-500">No</span>
            <span className="text-2xl font-bold tabular-nums text-gray-900">
              {activeNoPct}%
            </span>
          </div>
        </div>

        {/* Hover date */}
        <div className="h-4 mb-1">
          {hoverDate && <span className="text-xs text-gray-400">{hoverDate}</span>}
        </div>

        {/* Chart with hover — mouse events on this div */}
        <div
          ref={chartRef}
          className="relative cursor-crosshair"
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleChartMouseLeave}
        >
          <svg viewBox={`0 0 ${CW_TOTAL} ${CH_TOTAL}`} className="w-full h-auto pointer-events-none">
            {/* Dotted grid */}
            {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((p) => {
              const y = yS(p);
              return (
                <g key={p}>
                  <line x1={PAD.left} y1={y} x2={CW_TOTAL - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4 4" />
                  <text x={CW_TOTAL - PAD.right + 4} y={y + 3} textAnchor="start" className="text-[9px] fill-gray-400">
                    {Math.round(p * 100)}%
                  </text>
                </g>
              );
            })}

            {/* Time labels */}
            {timeLabels.map((l) => (
              <text key={l.text} x={l.x} y={CH_TOTAL - 3} textAnchor="middle" className="text-[9px] fill-gray-400">
                {l.text}
              </text>
            ))}

            {/* Area + lines */}
            <path d={yesAreaD} fill="#3b82f6" opacity={0.04} />
            <path d={noPathD} fill="none" stroke="#93c5fd" strokeWidth={1.5} strokeLinejoin="round" />
            <path d={yesPathD} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />

            {/* Hover crosshair */}
            {hoverIndex !== null && (
              <>
                <line
                  x1={xS(hoverIndex)} y1={PAD.top}
                  x2={xS(hoverIndex)} y2={PAD.top + CH}
                  stroke="#d1d5db" strokeWidth={1}
                />
                <circle cx={xS(hoverIndex)} cy={yS(history[hoverIndex].yes)} r={4} fill="white" stroke="#3b82f6" strokeWidth={2} />
                <circle cx={xS(hoverIndex)} cy={yS(history[hoverIndex].no)} r={3} fill="white" stroke="#93c5fd" strokeWidth={2} />
                {/* Yes tooltip — always above the dot */}
                <rect x={xS(hoverIndex) - 40} y={yS(history[hoverIndex].yes) - 24} width={80} height={18} rx={3} fill="#3b82f6" opacity={0.9} />
                <text x={xS(hoverIndex)} y={yS(history[hoverIndex].yes) - 12} textAnchor="middle" className="text-[9px] fill-white font-semibold">
                  Yes {Math.round(history[hoverIndex].yes * 1000) / 10}%
                </text>
                {/* No tooltip — always below the dot */}
                <rect x={xS(hoverIndex) - 35} y={yS(history[hoverIndex].no) + 8} width={70} height={18} rx={3} fill="#60a5fa" opacity={0.9} />
                <text x={xS(hoverIndex)} y={yS(history[hoverIndex].no) + 20} textAnchor="middle" className="text-[9px] fill-white font-semibold">
                  No {Math.round(history[hoverIndex].no * 1000) / 10}%
                </text>
              </>
            )}

            {/* Current dots (when not hovering) */}
            {hoverIndex === null && (
              <>
                <circle cx={xS(history.length - 1)} cy={yS(history[history.length - 1].yes)} r={4} fill="#3b82f6" />
                <circle cx={xS(history.length - 1)} cy={yS(history[history.length - 1].yes)} r={8} fill="#3b82f6" opacity={0.15} />
                <circle cx={xS(history.length - 1)} cy={yS(history[history.length - 1].no)} r={3} fill="#93c5fd" />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Bottom: comments scrolling + vol/date footer */}
      <div className="border-t border-gray-100">
        {/* Comments — smooth scroll */}
        <div ref={scrollRef} className="max-h-[120px] overflow-y-auto px-5 py-2 scrollbar-none">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{
                  opacity: { duration: 0.4 },
                  height: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
                }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 py-1">
                  <div
                    className="mt-0.5 h-5 w-5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-800">
                      {c.username}
                    </span>
                    <p className="text-xs text-gray-500 leading-snug line-clamp-2">
                      {c.comment}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer: vol left, end date right — like Polymarket */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            <RollingVolume volume={ticker.volume} /> Vol
          </span>
          <span className="text-xs text-gray-400">
            Ends {new Date(market.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}
