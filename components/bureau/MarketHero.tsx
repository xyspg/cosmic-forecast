import Link from "next/link";
import type { BureauMarket } from "@/lib/market-metadata";

export function MarketHero({
  m,
  yesCent,
  noCent,
}: {
  m: BureauMarket;
  yesCent: number;
  noCent: number;
}) {
  return (
    <>
      <div
        className="bureau-hero-meta-top"
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          paddingBottom: 12,
          borderBottom: "1px solid var(--rule)",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div
          className="bureau-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            ◀ Markets
          </Link>
          <span style={{ margin: "0 8px", color: "var(--ink-4)" }}>/</span>
          <span>{m.category}</span>
          <span style={{ margin: "0 8px", color: "var(--ink-4)" }}>/</span>
          <span>{m.ref}</span>
        </div>
        <div
          className="bureau-mono"
          style={{
            fontSize: 10,
            color: "var(--ink-4)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Last trade 14:22:09 UTC · Bid/ask spread 0.8¢ · Mid {yesCent}¢ /{" "}
          {noCent}¢
        </div>
      </div>

      <div
        style={{ padding: "24px 0 8px", borderBottom: "1px solid var(--rule)" }}
      >
        <div
          className="bureau-hero-stamps"
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <span className="bureau-stamp">
            <span className="bureau-dot bureau-dot--amber" />
            PUBLIC REFERENCE MARKET · {m.ref}
          </span>
          <span className="bureau-stamp">
            <span className="bureau-dot bureau-dot--ink" />
            RISK {m.risk}
          </span>
          <span className="bureau-stamp">
            <span className="bureau-dot bureau-dot--amber" />
            ORACLE · DONKI v2.1
          </span>
          <span className="bureau-stamp md:ml-auto">
            <span className="bureau-dot bureau-dot--pos" />
            ACCEPTING ORDERS
          </span>
        </div>

        <h1
          className="bureau-serif bureau-hero-headline"
          style={{
            fontSize: "clamp(28px, 6.5vw, 52px)",
            letterSpacing: "-0.028em",
            lineHeight: 1.04,
            margin: "8px 0",
            fontWeight: 500,
            textWrap: "balance",
            maxWidth: "100%",
          }}
        >
          {m.question}
        </h1>

        <div
          className="bureau-serif bureau-hero-summary"
          style={{
            fontSize: 18,
            fontStyle: "italic",
            color: "var(--ink-2)",
            marginTop: 12,
            maxWidth: 780,
            lineHeight: 1.4,
          }}
        >
          {m.summary}
        </div>

        <div
          className="bureau-mono bureau-hero-meta"
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.06em",
            marginTop: 14,
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
          }}
        >
          <span>α {m.ra}</span>
          <span>δ {m.dec}</span>
          <span>· OPENED {m.openedLabel.toUpperCase()}</span>
          <span>· SETTLES {m.endsLabel.toUpperCase()}</span>
          <span>· {m.daysLeft} D LEFT</span>
        </div>
      </div>
    </>
  );
}
