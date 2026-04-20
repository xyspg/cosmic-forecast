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
    <section style={{ border: "1px solid var(--ink)", padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: 8,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div className="bureau-serif" style={{ fontSize: 18, fontWeight: 500 }}>
          Wire
        </div>
        <span className="bureau-eyebrow">◉ LIVE</span>
      </div>
      {WIRE_ITEMS.map((it, i) => (
        <div
          key={it.t}
          style={{
            padding: "10px 0",
            borderBottom:
              i === WIRE_ITEMS.length - 1 ? "none" : "1px dotted var(--rule)",
          }}
        >
          <div
            className="bureau-mono"
            style={{
              fontSize: 9,
              letterSpacing: "0.1em",
              color: "var(--ink-4)",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            {it.t}
          </div>
          <div
            className="bureau-serif"
            style={{ fontSize: 13, lineHeight: 1.3 }}
          >
            {it.h}
          </div>
          <div
            className="bureau-mono"
            style={{
              fontSize: 10,
              color: it.pct.startsWith("+") ? "var(--pl-pos)" : "var(--pl-neg)",
              marginTop: 3,
            }}
          >
            market impact {it.pct}
          </div>
        </div>
      ))}
    </section>
  );
}
