"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { BureauMarket } from "@/lib/market-metadata";
import { fmtNum, fmtUSDShort } from "@/lib/market-metadata";
import { Sparkline } from "./Sparkline";

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-dotted border-rule py-1 text-[12px]">
      <span className="text-ink-3">{k}</span>
      <span className="bureau-mono text-[11px]">{v}</span>
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
    <article className="pt-[18px]">
      <div className="mb-[10px] flex items-center gap-[10px]">
        <span className="bureau-eyebrow text-amber">◈ FEATURED MARKET</span>
        <span className="bureau-eyebrow">{m.category.toUpperCase()}</span>
        <span className="bureau-eyebrow">REF {m.ref}</span>
      </div>

      <Link href={`/market/${slug}`} className="text-inherit no-underline">
        <h1 className="bureau-serif mx-0 mb-2 mt-0 max-w-[95%] cursor-pointer text-balance text-[clamp(24px,6vw,40px)] font-medium leading-[1.08] tracking-[-0.025em] max-sm:max-w-full max-sm:break-words max-sm:text-[26px]">
          {m.question}
        </h1>
      </Link>

      <div className="bureau-mono mb-[18px] text-[11px] tracking-[0.04em] text-ink-3">
        α {m.ra} · δ {m.dec} · RES. WINDOW {m.endsLabel.toUpperCase()} ·{" "}
        {m.daysLeft} D LEFT
      </div>

      <div className="grid grid-cols-[1fr_280px] items-stretch gap-7 max-[960px]:grid-cols-1 max-[960px]:gap-[18px]">
        <div className="border-y border-rule py-[14px]">
          <div className="mb-[6px] flex items-baseline justify-between max-sm:flex-col max-sm:items-start max-sm:gap-[10px]">
            <div className="flex items-baseline gap-[18px] max-sm:flex-wrap max-sm:gap-[14px]">
              <div>
                <div className="bureau-eyebrow">YES</div>
                <div className="bureau-num bureau-serif text-[32px] font-medium leading-none">
                  {yesCent}
                  <span className="text-[18px] text-ink-3">¢</span>
                </div>
              </div>
              <div>
                <div className="bureau-eyebrow">NO</div>
                <div className="bureau-num bureau-serif text-[32px] font-medium leading-none text-ink-3">
                  {noCent}
                  <span className="text-[18px]">¢</span>
                </div>
              </div>
              <div>
                <div className="bureau-eyebrow">
                  {hoverIndex !== null ? "Δ 24H" : "24H Δ"}
                </div>
                <div
                  className={`bureau-num text-[16px] ${deltaCents >= 0 ? "text-pl-pos" : "text-pl-neg"}`}
                >
                  {deltaCents >= 0 ? "+" : "−"}
                  {Math.abs(deltaCents).toFixed(1)}¢
                </div>
              </div>
            </div>
            <div className="bureau-mono text-[10px] tracking-wire text-ink-3">
              {headerLabel ? (
                <span className="text-ink">{headerLabel}</span>
              ) : (
                <>
                  1H · 1D · 1W · <b className="text-ink">1M</b> · ALL
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
          <div className="flex justify-between pt-1 font-mono text-[10px] text-ink-4">
            <span>MAR 20</span>
            <span>MAR 28</span>
            <span>APR 04</span>
            <span>APR 12</span>
            <span>APR 19</span>
          </div>
        </div>

        <div className="flex flex-col gap-[10px] border-l border-rule pl-5 max-[960px]:border-l-0 max-[960px]:border-t max-[960px]:border-rule max-[960px]:pl-0 max-[960px]:pt-4">
          <div className="bureau-eyebrow">Market specification</div>
          <SpecRow k="Open interest" v={fmtUSDShort(m.volume)} />
          <SpecRow k="Available liquidity" v={fmtUSDShort(m.liquidity)} />
          <SpecRow k="Counterparties" v={fmtNum(m.totalBettors)} />
          <SpecRow k="Risk category" v={m.risk} />
          <SpecRow k="Proposed" v={m.openedLabel} />
          <SpecRow k="Resolution" v={m.endsLabel} />
          <div className="flex-1" />
          <Link
            href={`/market/${slug}`}
            className="flex cursor-pointer justify-between border-0 bg-ink px-[14px] py-3 text-left font-mono text-[11px] uppercase tracking-eyebrow text-paper no-underline"
          >
            <span>Open market</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      <div className="mt-[10px] max-w-[720px] font-serif text-[14px] italic leading-[1.5] text-ink-2">
        {m.summary}
      </div>
    </article>
  );
}
