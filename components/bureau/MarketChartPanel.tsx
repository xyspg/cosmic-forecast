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
      <div
        className="bureau-chart-header"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 28,
          borderBottom: "1px solid var(--rule)",
          paddingBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="bureau-eyebrow">Implied probability — YES</div>
          <div
            className="bureau-num bureau-serif bureau-chart-header__price"
            style={{
              fontSize: "clamp(28px, 7vw, 44px)",
              lineHeight: 1,
              fontWeight: 500,
            }}
          >
            {yesCent}
            <span style={{ fontSize: 22, color: "var(--ink-3)" }}>¢</span>
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow">NO</div>
          <div
            className="bureau-num bureau-serif"
            style={{
              fontSize: 24,
              color: "var(--ink-3)",
              fontWeight: 500,
            }}
          >
            {noCent}
            <span style={{ fontSize: 14 }}>¢</span>
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow">
            {hoverIndex !== null ? "Δ 24H" : "24H change"}
          </div>
          <div
            className="bureau-num"
            style={{
              fontSize: 18,
              color: deltaCents >= 0 ? "var(--pl-pos)" : "var(--pl-neg)",
            }}
          >
            {deltaCents >= 0 ? "+" : "−"}
            {Math.abs(deltaCents).toFixed(1)}¢
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow">Volume 24h</div>
          <div className="bureau-num" style={{ fontSize: 18 }}>
            {fmtUSDShort(volume * 0.02)}
          </div>
        </div>
        <div
          className="bureau-chart-ranges"
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 2,
            fontFamily: "var(--ff-mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
          }}
        >
          {RANGES.map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                style={{
                  padding: "4px 10px",
                  border: "1px solid var(--rule)",
                  background: active ? "var(--ink)" : "var(--paper)",
                  color: active ? "var(--paper)" : "var(--ink-3)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  letterSpacing: "inherit",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "10px 0" }}>
        <Sparkline
          series={series}
          width={800}
          height={260}
          onHoverChange={setHoverIndex}
          labelForIndex={labelForIndex}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--ff-mono)",
            fontSize: 10,
            color: "var(--ink-4)",
            paddingTop: 4,
          }}
        >
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
