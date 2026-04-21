"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BureauMarket } from "@/lib/market-metadata";
import { fmtNum, fmtUSDShort } from "@/lib/market-metadata";
import { MiniSpark } from "./Sparkline";

const TH_BASE =
  "border-b-2 border-ink p-[10px] font-medium font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3";
const TD_BASE = "p-[10px] align-middle";

export function MarketTable({
  markets,
  seriesById,
}: {
  markets: BureauMarket[];
  seriesById: Record<string, number[]>;
}) {
  const router = useRouter();

  return (
    <div className="bureau-table-scroll">
      <table className="mt-2 w-full min-w-[760px] border-collapse font-sans text-[13px]">
        <thead>
          <tr className="text-left">
            <th className={TH_BASE}>Ref</th>
            <th className={TH_BASE}>Market</th>
            <th className={`${TH_BASE} text-right`}>YES¢</th>
            <th className={`${TH_BASE} text-right`}>NO¢</th>
            <th className={`${TH_BASE} w-[140px] text-right`}>30-day</th>
            <th className={`${TH_BASE} text-right`}>O.I.</th>
            <th className={`${TH_BASE} text-right`}>Bettors</th>
            <th className={`${TH_BASE} text-right`}>Settles</th>
            <th className={`${TH_BASE} text-center`}>Risk</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((m, i) => {
            const series = seriesById[m.id] ?? [];
            const len = series.length;
            const up = len >= 30 ? series[len - 1] > series[len - 30] : true;
            const yesCent = Math.round(m.yesPrice * 100);
            const noCent = Math.round(m.noPrice * 100);
            const zebra = i % 2 === 0 ? "" : "bg-black/[0.015]";
            return (
              <tr
                key={m.id}
                onClick={() => router.push(`/market/${m.id}`)}
                className={`cursor-pointer border-t border-rule hover:bg-paper-2 ${zebra}`}
              >
                <td
                  className={`${TD_BASE} w-[110px] font-mono text-[10px] tracking-[0.05em] text-ink-3`}
                >
                  {m.ref}
                </td>
                <td className={TD_BASE}>
                  <Link
                    href={`/market/${m.id}`}
                    className="text-inherit no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bureau-serif max-w-[520px] text-[15px] leading-[1.25] tracking-[-0.01em]">
                      {m.question}
                    </div>
                  </Link>
                  <div className="bureau-mono mt-[2px] text-[10px] tracking-[0.04em] text-ink-4">
                    α {m.ra} · δ {m.dec} · {m.category.toUpperCase()}
                  </div>
                </td>
                <td className={`${TD_BASE} text-right`}>
                  <span className="bureau-num text-[15px] font-medium">
                    {yesCent}
                  </span>
                </td>
                <td className={`${TD_BASE} text-right`}>
                  <span className="bureau-num text-[15px] text-ink-3">
                    {noCent}
                  </span>
                </td>
                <td className={`${TD_BASE} text-right`}>
                  <div className="inline-block align-middle">
                    <MiniSpark
                      series={series.slice(-30)}
                      width={110}
                      height={28}
                      color={up ? "var(--pl-pos)" : "var(--pl-neg)"}
                    />
                  </div>
                </td>
                <td className={`${TD_BASE} text-right`}>
                  <span className="bureau-num">{fmtUSDShort(m.volume)}</span>
                </td>
                <td className={`${TD_BASE} text-right`}>
                  <span className="bureau-num text-ink-3">
                    {fmtNum(m.totalBettors)}
                  </span>
                </td>
                <td
                  className={`${TD_BASE} text-right font-mono text-[11px] text-ink-3`}
                >
                  {m.endsLabel}
                </td>
                <td className={`${TD_BASE} text-center`}>
                  <span className="border border-rule px-[6px] py-[2px] font-mono text-[10px] tracking-[0.1em] text-ink-3">
                    {m.risk}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
