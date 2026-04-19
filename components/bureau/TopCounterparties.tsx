import { fmtUSDShort } from "@/lib/market-metadata";

const ROWS: { n: string; side: "YES" | "NO"; sz: number }[] = [
  { n: "DegenTrader", side: "YES", sz: 124_300 },
  { n: "MarketMaker42", side: "NO", sz: 88_410 },
  { n: "MooreM", side: "YES", sz: 71_220 },
  { n: "ghachu", side: "NO", sz: 42_110 },
  { n: "yolo_finance", side: "YES", sz: 19_440 },
];

export function TopCounterparties({ total = 41208 }: { total?: number }) {
  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "space-between",
          background: "var(--paper-2)",
        }}
      >
        <div
          className="bureau-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Top counterparties
        </div>
        <div
          className="bureau-mono"
          style={{ fontSize: 10, color: "var(--ink-3)" }}
        >
          5 of {total.toLocaleString("en-US")}
        </div>
      </div>
      {ROWS.map((p, i) => (
        <div
          key={p.n}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 14px",
            borderBottom:
              i === ROWS.length - 1 ? "none" : "1px dotted var(--rule)",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              className={`bureau-dot ${p.side === "YES" ? "bureau-dot--ink" : "bureau-dot--amber"}`}
            />
            <span style={{ color: "var(--ink-2)" }}>{p.n}</span>
            <span
              className="bureau-mono"
              style={{
                fontSize: 10,
                color: "var(--ink-3)",
                letterSpacing: "0.08em",
              }}
            >
              {p.side}
            </span>
          </div>
          <span className="bureau-num" style={{ color: "var(--ink-3)" }}>
            {fmtUSDShort(p.sz)}
          </span>
        </div>
      ))}
    </div>
  );
}
