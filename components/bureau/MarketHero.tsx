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
      <div className="border-rule flex flex-wrap items-baseline justify-between gap-2 border-b pb-3 max-sm:flex-col max-sm:items-start max-sm:gap-[6px]">
        <div className="bureau-mono tracking-eyebrow text-ink-3 text-[10px] uppercase">
          <Link href="/" className="text-inherit no-underline">
            ◀ Markets
          </Link>
          <span className="text-ink-4 mx-2">/</span>
          <span>{m.category}</span>
          <span className="text-ink-4 mx-2">/</span>
          <span>{m.ref}</span>
        </div>
        <div className="bureau-mono text-ink-4 text-[10px] tracking-[0.1em] uppercase">
          Last trade 14:22:09 UTC · Bid/ask spread 0.8¢ · Mid {yesCent}¢ / {noCent}¢
        </div>
      </div>

      <div className="border-rule border-b pt-6 pb-2">
        <div className="mb-[10px] flex flex-wrap gap-[10px] max-sm:gap-[6px]">
          <span className="bureau-stamp shrink-0">
            <span className="bureau-dot bureau-dot--amber" />
            PUBLIC REFERENCE MARKET · {m.ref}
          </span>
          <span className="bureau-stamp shrink-0">
            <span className="bureau-dot bureau-dot--ink" />
            RISK {m.risk}
          </span>
          <span className="bureau-stamp shrink-0">
            <span className="bureau-dot bureau-dot--amber" />
            ORACLE · DONKI v2.1
          </span>
          <span className="bureau-stamp shrink-0 md:ml-auto">
            <span className="bureau-dot bureau-dot--pos" />
            ACCEPTING ORDERS
          </span>
        </div>

        <h1 className="bureau-serif my-2 max-w-full text-[clamp(28px,6.5vw,52px)] leading-[1.04] font-medium tracking-[-0.028em] text-balance max-sm:text-[clamp(24px,7vw,30px)] max-sm:break-words">
          {m.question}
        </h1>

        <div className="bureau-serif text-ink-2 mt-3 max-w-[780px] text-[18px] leading-[1.4] italic max-sm:max-w-full max-sm:text-[15px]">
          {m.summary}
        </div>

        <div className="bureau-mono text-ink-3 mt-[14px] flex flex-wrap gap-[22px] text-[11px] tracking-[0.06em] max-sm:gap-[10px] max-sm:text-[10px]">
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
