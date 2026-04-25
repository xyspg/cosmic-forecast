import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo } from "react";

import { Disclaimer } from "@/components/bureau/Disclaimer";
import { FlareTicker } from "@/components/bureau/FlareTicker";
import { GovHeaderStrip } from "@/components/bureau/GovHeaderStrip";
import { Nav } from "@/components/bureau/Nav";
import { CosmicReport } from "@/components/CosmicReport";
import marketsData from "@/data/markets.json";
import { enrich } from "@/lib/market-metadata";
import { useCosmicStore } from "@/lib/store";
import type { Market } from "@/lib/types";

const rawMarkets = marketsData as Market[];

export const Route = createFileRoute("/resolution/$slug")({
  loader: ({ params }) => {
    const idx = rawMarkets.findIndex((m) => m.id === params.slug);
    if (idx < 0) throw notFound();
    return { market: rawMarkets[idx], index: idx };
  },
  component: ResolutionPage,
});

function ResolutionPage() {
  const { slug } = Route.useParams();
  const { market, index } = Route.useLoaderData();

  const bureau = useMemo(() => enrich(market, index), [market, index]);

  const resolution = useCosmicStore((s) => s.getResolution(slug));
  const position = useCosmicStore((s) => s.getPosition(slug));

  return (
    <div className="bg-paper text-ink min-h-screen">
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="markets" />

      <div className="bureau-page bureau-page--tight">
        {!resolution ? (
          <div className="border-rule bg-paper-2 border px-10 py-20 text-center max-sm:px-5 max-sm:py-12">
            <div className="bureau-mono text-ink-3 mb-[10px] text-[10px] tracking-[0.24em] uppercase">
              — NO RECORD ON FILE —
            </div>
            <div className="bureau-serif mb-3 text-[26px] leading-[1.3] font-medium tracking-[-0.015em] text-balance">
              {market.question}
            </div>
            <div className="bureau-serif text-ink-3 mx-auto mb-[22px] max-w-[560px] text-[15px] leading-[1.5] italic">
              This market has not yet been resolved by the Settlement Bureau. The observational
              window remains open.
            </div>
            <Link
              to="/market/$slug"
              params={{ slug }}
              className="bg-ink tracking-stamp text-paper inline-block px-[22px] py-3 font-mono text-[11px] font-semibold uppercase no-underline"
            >
              Return to market ⟶
            </Link>
          </div>
        ) : (
          <>
            <CosmicReport
              resolution={resolution}
              marketQuestion={market.question}
              market={bureau}
              position={position}
            />
            <div className="border-rule mt-7 flex flex-wrap items-center justify-between gap-[14px] border-t pt-4 max-sm:flex-col max-sm:items-start">
              <div className="bureau-mono tracking-eyebrow text-ink-3 text-[10px] uppercase">
                Archived under RES-
                {new Date(resolution.timestamp).toISOString().slice(0, 10)}-{bureau.ref.slice(-4)} ·
                permanent record
              </div>
              <div className="flex flex-wrap gap-[10px]">
                <Link
                  to="/market/$slug"
                  params={{ slug }}
                  className="border-ink bg-paper tracking-stamp text-ink border px-5 py-3 font-mono text-[11px] font-semibold uppercase no-underline"
                >
                  Market page
                </Link>
                <Link
                  to="/"
                  className="bg-ink tracking-stamp text-paper px-5 py-3 font-mono text-[11px] font-semibold uppercase no-underline"
                >
                  Return to market index ⟶
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <Disclaimer />
    </div>
  );
}
