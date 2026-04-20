"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { BureauMarket } from "@/lib/market-metadata";
import { fmtNum, fmtUSDShort } from "@/lib/market-metadata";
import { Sparkline } from "./Sparkline";

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        borderBottom: "1px dotted var(--rule)",
        padding: "4px 0",
        fontSize: 12,
      }}
    >
      <span style={{ color: "var(--ink-3)" }}>{k}</span>
      <span className="bureau-mono" style={{ fontSize: 11 }}>
        {v}
      </span>
    </div>
  );
}

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

// Series spans a 30-day window ending at the reference "now".
// Mirrors generatePriceHistory's 30-day timeSpan so hover labels line up with the x-axis.
const REFERENCE_NOW = new Date("2026-04-19T14:22:00Z");
const WINDOW_DAYS = 30;

function shortDateForIndex(index: number, n: number): string {
  if (n <= 1) return "";
  const daysAgo = (1 - index / (n - 1)) * WINDOW_DAYS;
  const d = new Date(REFERENCE_NOW.getTime() - daysAgo * 86_400_000);
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function LeadMarket({
  m,
  series,
  slug,
}: {
  m: BureauMarket;
  series: number[];
  slug: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const n = series.length;
  const hoverYes = hoverIndex !== null ? series[hoverIndex] : null;

  const yesCent =
    hoverYes !== null
      ? Math.round(hoverYes * 100)
      : Math.round(m.yesPrice * 100);
  const noCent = 100 - yesCent;

  const deltaCents = useMemo(() => {
    if (n < 2) return 0;
    // Approximate "24H" as the last 6 of 180 points when series spans ~30 days.
    const lookback = Math.max(1, Math.round((n - 1) / WINDOW_DAYS));
    const current = hoverYes ?? series[n - 1];
    const prior = series[Math.max(0, (hoverIndex ?? n - 1) - lookback)];
    return Math.round((current - prior) * 100 * 10) / 10;
  }, [hoverIndex, hoverYes, n, series]);

  const labelForIndex = useCallback(
    (i: number) => shortDateForIndex(i, n),
    [n],
  );

  const headerLabel =
    hoverIndex !== null ? shortDateForIndex(hoverIndex, n) : null;

  return (
    <article style={{ paddingTop: 18 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span className="bureau-eyebrow" style={{ color: "var(--amber)" }}>
          ◈ FEATURED MARKET
        </span>
        <span className="bureau-eyebrow">{m.category.toUpperCase()}</span>
        <span className="bureau-eyebrow">REF {m.ref}</span>
      </div>

      <Link
        href={`/market/${slug}`}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        <h1
          className="bureau-serif bureau-lead-head"
          style={{
            fontSize: "clamp(24px, 6vw, 40px)",
            letterSpacing: "-0.025em",
            lineHeight: 1.08,
            margin: "0 0 8px",
            fontWeight: 500,
            cursor: "pointer",
            textWrap: "balance",
            maxWidth: "95%",
          }}
        >
          {m.question}
        </h1>
      </Link>

      <div
        className="bureau-mono"
        style={{
          fontSize: 11,
          color: "var(--ink-3)",
          letterSpacing: "0.04em",
          marginBottom: 18,
        }}
      >
        α {m.ra} · δ {m.dec} · RES. WINDOW {m.endsLabel.toUpperCase()} ·{" "}
        {m.daysLeft} D LEFT
      </div>

      <div
        className="bureau-lead-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 28,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
            padding: "14px 0",
          }}
        >
          <div
            className="bureau-lead-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 6,
            }}
          >
            <div
              className="bureau-lead-prices"
              style={{ display: "flex", gap: 18, alignItems: "baseline" }}
            >
              <div>
                <div className="bureau-eyebrow">YES</div>
                <div
                  className="bureau-num bureau-serif"
                  style={{ fontSize: 32, lineHeight: 1, fontWeight: 500 }}
                >
                  {yesCent}
                  <span style={{ fontSize: 18, color: "var(--ink-3)" }}>¢</span>
                </div>
              </div>
              <div>
                <div className="bureau-eyebrow">NO</div>
                <div
                  className="bureau-num bureau-serif"
                  style={{
                    fontSize: 32,
                    lineHeight: 1,
                    fontWeight: 500,
                    color: "var(--ink-3)",
                  }}
                >
                  {noCent}
                  <span style={{ fontSize: 18 }}>¢</span>
                </div>
              </div>
              <div>
                <div className="bureau-eyebrow">
                  {hoverIndex !== null ? "Δ 24H" : "24H Δ"}
                </div>
                <div
                  className="bureau-num"
                  style={{
                    fontSize: 16,
                    color: deltaCents >= 0 ? "var(--pl-pos)" : "var(--pl-neg)",
                  }}
                >
                  {deltaCents >= 0 ? "+" : "−"}
                  {Math.abs(deltaCents).toFixed(1)}¢
                </div>
              </div>
            </div>
            <div
              className="bureau-mono"
              style={{
                fontSize: 10,
                color: "var(--ink-3)",
                letterSpacing: "0.08em",
              }}
            >
              {headerLabel ? (
                <span style={{ color: "var(--ink)" }}>{headerLabel}</span>
              ) : (
                <>
                  1H · 1D · 1W · <b style={{ color: "var(--ink)" }}>1M</b> · ALL
                </>
              )}
            </div>
          </div>
          <Sparkline
            series={series}
            width={620}
            height={180}
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

        <div
          className="bureau-lead-aside"
          style={{
            borderLeft: "1px solid var(--rule)",
            paddingLeft: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div className="bureau-eyebrow">Market specification</div>
          <SpecRow k="Open interest" v={fmtUSDShort(m.volume)} />
          <SpecRow k="Available liquidity" v={fmtUSDShort(m.liquidity)} />
          <SpecRow k="Counterparties" v={fmtNum(m.totalBettors)} />
          <SpecRow k="Risk category" v={m.risk} />
          <SpecRow k="Proposed" v={m.openedLabel} />
          <SpecRow k="Resolution" v={m.endsLabel} />
          <div style={{ flex: 1 }} />
          <Link
            href={`/market/${slug}`}
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              border: 0,
              padding: "12px 14px",
              fontFamily: "var(--ff-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              textDecoration: "none",
            }}
          >
            <span>Open market</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          fontFamily: "var(--ff-serif)",
          fontSize: 14,
          color: "var(--ink-2)",
          fontStyle: "italic",
          maxWidth: 720,
          lineHeight: 1.5,
        }}
      >
        {m.summary}
      </div>
    </article>
  );
}
