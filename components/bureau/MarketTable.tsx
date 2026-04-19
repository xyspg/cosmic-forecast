"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BureauMarket } from "@/lib/market-metadata";
import { fmtNum, fmtUSDShort } from "@/lib/market-metadata";
import { MiniSpark } from "./Sparkline";

const th: React.CSSProperties = {
  padding: "10px 10px",
  borderBottom: "2px solid var(--ink)",
  fontWeight: 500,
};

const td: React.CSSProperties = {
  padding: "12px 10px",
  verticalAlign: "middle",
};

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
      <table
        style={{
          width: "100%",
          minWidth: 760,
          borderCollapse: "collapse",
          marginTop: 8,
          fontFamily: "var(--ff-sans)",
          fontSize: 13,
        }}
      >
        <thead>
          <tr
            style={{
              fontFamily: "var(--ff-mono)",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
              textAlign: "left",
            }}
          >
            <th style={th}>Ref</th>
            <th style={th}>Market</th>
            <th style={{ ...th, textAlign: "right" }}>YES¢</th>
            <th style={{ ...th, textAlign: "right" }}>NO¢</th>
            <th style={{ ...th, textAlign: "right", width: 140 }}>30-day</th>
            <th style={{ ...th, textAlign: "right" }}>O.I.</th>
            <th style={{ ...th, textAlign: "right" }}>Bettors</th>
            <th style={{ ...th, textAlign: "right" }}>Settles</th>
            <th style={{ ...th, textAlign: "center" }}>Risk</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((m, i) => {
            const series = seriesById[m.id] ?? [];
            const len = series.length;
            const up = len >= 30 ? series[len - 1] > series[len - 30] : true;
            const yesCent = Math.round(m.yesPrice * 100);
            const noCent = Math.round(m.noPrice * 100);
            return (
              <tr
                key={m.id}
                onClick={() => router.push(`/market/${m.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--paper-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)";
                }}
                style={{
                  borderTop: "1px solid var(--rule)",
                  cursor: "pointer",
                  background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)",
                }}
              >
                <td
                  style={{
                    ...td,
                    fontFamily: "var(--ff-mono)",
                    fontSize: 10,
                    color: "var(--ink-3)",
                    letterSpacing: "0.05em",
                    width: 110,
                  }}
                >
                  {m.ref}
                </td>
                <td style={td}>
                  <Link
                    href={`/market/${m.id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="bureau-serif"
                      style={{
                        fontSize: 15,
                        letterSpacing: "-0.01em",
                        lineHeight: 1.25,
                        maxWidth: 520,
                      }}
                    >
                      {m.question}
                    </div>
                  </Link>
                  <div
                    className="bureau-mono"
                    style={{
                      fontSize: 10,
                      color: "var(--ink-4)",
                      marginTop: 2,
                      letterSpacing: "0.04em",
                    }}
                  >
                    α {m.ra} · δ {m.dec} · {m.category.toUpperCase()}
                  </div>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <span
                    className="bureau-num"
                    style={{ fontSize: 15, fontWeight: 500 }}
                  >
                    {yesCent}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <span
                    className="bureau-num"
                    style={{ fontSize: 15, color: "var(--ink-3)" }}
                  >
                    {noCent}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <div
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  >
                    <MiniSpark
                      series={series.slice(-30)}
                      width={110}
                      height={28}
                      color={up ? "var(--pl-pos)" : "var(--pl-neg)"}
                    />
                  </div>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <span className="bureau-num">{fmtUSDShort(m.volume)}</span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <span
                    className="bureau-num"
                    style={{ color: "var(--ink-3)" }}
                  >
                    {fmtNum(m.totalBettors)}
                  </span>
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontFamily: "var(--ff-mono)",
                    fontSize: 11,
                    color: "var(--ink-3)",
                  }}
                >
                  {m.endsLabel}
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--ff-mono)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      border: "1px solid var(--rule)",
                      padding: "2px 6px",
                      color: "var(--ink-3)",
                    }}
                  >
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
