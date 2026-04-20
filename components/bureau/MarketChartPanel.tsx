"use client";

import { useCallback, useMemo, useState } from "react";
import { fmtUSDShort } from "@/lib/market-metadata";
import { Sparkline } from "./Sparkline";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const REFERENCE_NOW = new Date("2026-04-19T14:22:00Z");
const WINDOW_DAYS = 30;

function shortDateForIndex(index: number, n: number): string {
  if (n <= 1) return "";
  const daysAgo = (1 - index / (n - 1)) * WINDOW_DAYS;
  const d = new Date(REFERENCE_NOW.getTime() - daysAgo * 86_400_000);
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}`;
}

const RANGES = ["1H", "1D", "1W", "1M", "ALL"] as const;

export function MarketChartPanel({
  series,
  yesPrice,
  volume,
}: {
  series: number[];
  yesPrice: number;
  volume: number;
}) {
  const [range, setRange] = useState<(typeof RANGES)[number]>("1M");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const n = series.length;
  const hoverYes = hoverIndex !== null ? series[hoverIndex] : null;

  const yesCent =
    hoverYes !== null ? Math.round(hoverYes * 100) : Math.round(yesPrice * 100);
  const noCent = 100 - yesCent;

  const deltaCents = useMemo(() => {
    if (n < 2) return 0;
    const lookback = Math.max(1, Math.round((n - 1) / WINDOW_DAYS));
    const current = hoverYes ?? series[n - 1];
    const prior = series[Math.max(0, (hoverIndex ?? n - 1) - lookback)];
    return Math.round((current - prior) * 100 * 10) / 10;
  }, [hoverIndex, hoverYes, n, series]);

  const labelForIndex = useCallback(
    (i: number) => shortDateForIndex(i, n),
    [n],
  );

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-7 border-b border-rule pb-[10px] max-sm:gap-3">
        <div>
          <div className="bureau-eyebrow">Implied probability — YES</div>
          <div className="bureau-num bureau-serif text-[clamp(28px,7vw,44px)] font-medium leading-none max-sm:text-[30px]">
            {yesCent}
            <span className="text-[22px] text-ink-3">¢</span>
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow">NO</div>
          <div className="bureau-num bureau-serif text-[24px] font-medium text-ink-3">
            {noCent}
            <span className="text-[14px]">¢</span>
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow">
            {hoverIndex !== null ? "Δ 24H" : "24H change"}
          </div>
          <div
            className={`bureau-num text-[18px] ${deltaCents >= 0 ? "text-pl-pos" : "text-pl-neg"}`}
          >
            {deltaCents >= 0 ? "+" : "−"}
            {Math.abs(deltaCents).toFixed(1)}¢
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow">Volume 24h</div>
          <div className="bureau-num text-[18px]">
            {fmtUSDShort(volume * 0.02)}
          </div>
        </div>
        <div className="ml-auto flex gap-[2px] font-mono text-[10px] tracking-[0.1em] max-sm:ml-0 max-sm:w-full">
          {RANGES.map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`cursor-pointer border border-rule px-[10px] py-1 font-[inherit] text-[inherit] tracking-[inherit] ${
                  active
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink-3"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="py-[10px]">
        <Sparkline
          series={series}
          width={800}
          height={260}
          onHoverChange={setHoverIndex}
          labelForIndex={labelForIndex}
        />
        <div className="flex justify-between pt-1 font-mono text-[10px] text-ink-4">
          <span>MAR 20</span>
          <span>MAR 28</span>
          <span>APR 04</span>
          <span>APR 12</span>
          <span>APR 19</span>
        </div>
      </div>
    </div>
  );
}
