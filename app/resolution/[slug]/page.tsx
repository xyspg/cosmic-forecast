"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";
import { Disclaimer } from "@/components/bureau/Disclaimer";
import { FlareTicker } from "@/components/bureau/FlareTicker";
import { GovHeaderStrip } from "@/components/bureau/GovHeaderStrip";
import { Nav } from "@/components/bureau/Nav";
import { CosmicReport } from "@/components/CosmicReport";
import marketsData from "@/data/markets.json";
import { useHydrated } from "@/hooks/useHydrated";
import { enrich } from "@/lib/market-metadata";
import { useCosmicStore } from "@/lib/store";
import type { Market } from "@/lib/types";

const rawMarkets = marketsData as Market[];

export default function ResolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const idx = rawMarkets.findIndex((m) => m.id === slug);
  const market = idx >= 0 ? rawMarkets[idx] : undefined;
  if (!market) notFound();

  const bureau = useMemo(() => enrich(market, idx), [market, idx]);

  const hydrated = useHydrated();
  const storeResolution = useCosmicStore((s) => s.getResolution(slug));
  const storePosition = useCosmicStore((s) => s.getPosition(slug));
  const resolution = hydrated ? storeResolution : undefined;
  const position = hydrated ? storePosition : undefined;

  if (!hydrated) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-[14px] bg-black font-mono text-bone">
        <div className="text-[10px] uppercase tracking-mark text-amber">
          ◈ ATTESTATION FILED
        </div>
        <div className="text-[12px] uppercase tracking-stamp text-bone-2">
          Retrieving record from public archive…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="markets" />

      <div className="bureau-page bureau-page--tight">
        {!resolution ? (
          <div className="border border-rule bg-paper-2 px-10 py-20 text-center max-sm:px-5 max-sm:py-12">
            <div className="bureau-mono mb-[10px] text-[10px] uppercase tracking-[0.24em] text-ink-3">
              — NO RECORD ON FILE —
            </div>
            <div className="bureau-serif mb-3 text-balance text-[26px] font-medium leading-[1.3] tracking-[-0.015em]">
              {market.question}
            </div>
            <div className="bureau-serif mx-auto mb-[22px] max-w-[560px] text-[15px] italic leading-[1.5] text-ink-3">
              This market has not yet been resolved by the Settlement Bureau.
              The observational window remains open.
            </div>
            <Link
              href={`/market/${slug}`}
              className="inline-block bg-ink px-[22px] py-3 font-mono text-[11px] font-semibold uppercase tracking-stamp text-paper no-underline"
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
            <div className="mt-7 flex flex-wrap items-center justify-between gap-[14px] border-t border-rule pt-4 max-sm:flex-col max-sm:items-start">
              <div className="bureau-mono text-[10px] uppercase tracking-eyebrow text-ink-3">
                Archived under RES-
                {new Date(resolution.timestamp).toISOString().slice(0, 10)}-
                {bureau.ref.slice(-4)} · permanent record
              </div>
              <div className="flex flex-wrap gap-[10px]">
                <Link
                  href={`/market/${slug}`}
                  className="border border-ink bg-paper px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-stamp text-ink no-underline"
                >
                  Market page
                </Link>
                <Link
                  href="/"
                  className="bg-ink px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-stamp text-paper no-underline"
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
