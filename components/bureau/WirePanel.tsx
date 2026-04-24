const WIRE_ITEMS = [
  {
    t: "REUTERS · 14:18 UTC",
    h: "FOMC minutes flag divided views on June policy path",
    pct: "+3.2¢",
  },
  {
    t: "AP · 13:47 UTC",
    h: "Trump campaign opens second ground office in Wisconsin",
    pct: "+1.8¢",
  },
  {
    t: "BBG · 13:02 UTC",
    h: "Bitcoin slips below $92K as options desks unwind gamma",
    pct: "−1.4¢",
  },
  {
    t: "FT · 12:40 UTC",
    h: "OpenAI reportedly in S-1 drafting with Morgan Stanley",
    pct: "+5.1¢",
  },
];

export function WirePanel() {
  return (
    <section className="border-ink border p-4">
      <div className="border-rule flex items-baseline justify-between border-b pb-2">
        <div className="bureau-serif text-[18px] font-medium">Wire</div>
        <span className="bureau-eyebrow">◉ LIVE</span>
      </div>
      {WIRE_ITEMS.map((it, i) => (
        <div
          key={it.t}
          className={`py-[10px] ${i === WIRE_ITEMS.length - 1 ? "" : "border-rule border-b border-dotted"}`}
        >
          <div className="bureau-mono text-ink-4 mb-[2px] text-[9px] tracking-[0.1em] uppercase">
            {it.t}
          </div>
          <div className="bureau-serif text-[13px] leading-[1.3]">{it.h}</div>
          <div
            className={`bureau-mono mt-[3px] text-[10px] ${it.pct.startsWith("+") ? "text-pl-pos" : "text-pl-neg"}`}
          >
            market impact {it.pct}
          </div>
        </div>
      ))}
    </section>
  );
}
