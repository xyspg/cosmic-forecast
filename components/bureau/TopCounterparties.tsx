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
    <div className="border-rule border">
      <div className="border-rule bg-paper-2 flex justify-between border-b px-[14px] py-[10px]">
        <div className="bureau-mono tracking-eyebrow text-[10px] font-semibold uppercase">
          Top counterparties
        </div>
        <div className="bureau-mono text-ink-3 text-[10px]">
          5 of {total.toLocaleString("en-US")}
        </div>
      </div>
      {ROWS.map((p, i) => (
        <div
          key={p.n}
          className={`flex justify-between px-[14px] py-2 text-[12px] ${i === ROWS.length - 1 ? "" : "border-rule border-b border-dotted"}`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`bureau-dot ${p.side === "YES" ? "bureau-dot--ink" : "bureau-dot--amber"}`}
            />
            <span className="text-ink-2">{p.n}</span>
            <span className="bureau-mono tracking-wire text-ink-3 text-[10px]">{p.side}</span>
          </div>
          <span className="bureau-num text-ink-3">{fmtUSDShort(p.sz)}</span>
        </div>
      ))}
    </div>
  );
}
