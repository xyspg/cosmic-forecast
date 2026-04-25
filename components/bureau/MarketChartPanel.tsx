import { useCallback, useMemo, useState } from "react";

import {
  axisTicks,
  CHART_RANGES,
  type ChartRange,
  rangeConfig,
  labelForIndex as rangeLabelForIndex,
} from "@/lib/chart-range";
import { generatePriceHistory } from "@/lib/generate-price-history";
import { fmtUSDShort } from "@/lib/market-metadata";

import { Sparkline } from "./Sparkline";

export function MarketChartPanel({
  marketId,
  yesPrice,
  volume,
}: {
  marketId: string;
  yesPrice: number;
  volume: number;
}) {
  const [range, setRange] = useState<ChartRange>("1M");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const series = useMemo(() => {
    const { spanMs, points } = rangeConfig(range);
    return generatePriceHistory(marketId, yesPrice, points, spanMs).map((p) => p.yes);
  }, [marketId, yesPrice, range]);

  const n = series.length;
  const hoverYes = hoverIndex !== null ? series[hoverIndex] : null;

  const yesCent = hoverYes !== null ? Math.round(hoverYes * 100) : Math.round(yesPrice * 100);
  const noCent = 100 - yesCent;

  const deltaCents = useMemo(() => {
    if (n < 2) return 0;
    const current = hoverYes ?? series[n - 1];
    const base = series[0];
    return Math.round((current - base) * 100 * 10) / 10;
  }, [hoverYes, n, series]);

  const labelForIndex = useCallback((i: number) => rangeLabelForIndex(range, i, n), [range, n]);

  const ticks = useMemo(() => axisTicks(range), [range]);

  return (
    <div>
      <div className="border-rule flex flex-wrap items-baseline gap-7 border-b pb-[10px] max-sm:gap-3">
        <div>
          <div className="bureau-eyebrow">Implied probability — YES</div>
          <div className="bureau-num bureau-serif text-[clamp(28px,7vw,44px)] leading-none font-medium max-sm:text-[30px]">
            {yesCent}
            <span className="text-ink-3 text-[22px]">¢</span>
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow">NO</div>
          <div className="bureau-num bureau-serif text-ink-3 text-[24px] font-medium">
            {noCent}
            <span className="text-[14px]">¢</span>
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow">
            {hoverIndex !== null ? `Δ ${range}` : `${range} change`}
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
          <div className="bureau-num text-[18px]">{fmtUSDShort(volume * 0.02)}</div>
        </div>
        <div className="ml-auto flex gap-[2px] font-mono text-[10px] tracking-[0.1em] max-sm:ml-0 max-sm:w-full">
          {CHART_RANGES.map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`border-rule cursor-pointer border px-[10px] py-1 font-[inherit] tracking-[inherit] text-[inherit] ${
                  active ? "bg-ink text-paper" : "bg-paper text-ink-3"
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
        <div className="text-ink-4 flex justify-between pt-1 font-mono text-[10px]">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
