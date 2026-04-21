"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Disclaimer } from "@/components/bureau/Disclaimer";
import { FlareTicker } from "@/components/bureau/FlareTicker";
import { GovHeaderStrip } from "@/components/bureau/GovHeaderStrip";
import { MarketChartPanel } from "@/components/bureau/MarketChartPanel";
import { MarketHero } from "@/components/bureau/MarketHero";
import { Methodology } from "@/components/bureau/Methodology";
import { Nav } from "@/components/bureau/Nav";
import { OracleStatus } from "@/components/bureau/OracleStatus";
import { OrderTicket } from "@/components/bureau/OrderTicket";
import { TopCounterparties } from "@/components/bureau/TopCounterparties";
import { SpeedUpOverlay } from "@/components/SpeedUpOverlay";
import { WarpAnimation } from "@/components/WarpAnimation";
import marketsData from "@/data/markets.json";
import { useHydrated } from "@/hooks/useHydrated";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { formatVolume } from "@/lib/fake-data";
import { enrich, fmtUSDShort } from "@/lib/market-metadata";
import { useCosmicStore } from "@/lib/store";
import type { Market, ResolveBetResponse } from "@/lib/types";
import MarketLoading from "./loading";

const rawMarkets = marketsData as Market[];

export default function MarketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const marketIndex = rawMarkets.findIndex((m) => m.id === slug);
  const rawMarket = marketIndex >= 0 ? rawMarkets[marketIndex] : undefined;

  if (!rawMarket) {
    notFound();
  }

  return <MarketPageContent market={rawMarket} index={marketIndex} />;
}

function MarketPageContent({
  market,
  index,
}: {
  market: Market;
  index: number;
}) {
  const searchParams = useSearchParams();
  const sideParam = searchParams.get("side");
  const initialSide: "YES" | "NO" =
    sideParam?.toLowerCase() === "no" ? "NO" : "YES";

  const router = useRouter();
  const ticker = useMarketTicker(market);
  const resolveMarket = useCosmicStore((s) => s.resolveMarket);

  const bureau = useMemo(() => enrich(market, index), [market, index]);

  const [showSpeedUp, setShowSpeedUp] = useState(false);
  const [showWarp, setShowWarp] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  type ApiResult = {
    outcome: "YES" | "NO";
    explanation: string;
    nasaEventId: string;
    nasaEventType: string;
    hash: string;
  };
  const apiResultRef = useRef<ApiResult | null>(null);
  const warpDoneRef = useRef(false);

  const resolveRef = useRef<(result: ApiResult) => void>(() => {});
  resolveRef.current = (result) => {
    const confidence = Math.round((85 + Math.random() * 14.9) * 10) / 10;
    ticker.setOutcome(result.outcome);
    resolveMarket(
      market.id,
      result.outcome,
      result.explanation,
      result.nasaEventId,
      result.nasaEventType,
      result.hash,
      confidence,
    );
    router.push(`/resolution/${market.id}`);
    // leave showWarp=true; navigation unmounts the market page and the warp with it
  };

  const handleBetPlaced = useCallback(() => {
    setAllInMode(false);
    setShowSpeedUp(true);
  }, []);

  const existingPosition = useCosmicStore((s) => s.getPosition(market.id));

  const handleSpeedUp = useCallback(async () => {
    setShowSpeedUp(false);
    setShowWarp(true);
    setApiReady(false);
    apiResultRef.current = null;
    warpDoneRef.current = false;
    ticker.freeze();

    const date = new Date().toISOString().split("T")[0];
    let result: ApiResult;

    const fallback: ApiResult = {
      outcome: Math.random() > 0.5 ? "YES" : "NO",
      explanation:
        "The cosmic signal was received but partially obscured by interstellar noise. The oracle attestation remains unambiguous.",
      nasaEventId: "FLR-FALLBACK",
      nasaEventType: "Solar Flare",
      hash: "0".repeat(64),
    };

    try {
      const resolveRes = await fetch("/api/resolve-bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketSlug: market.id, date }),
      });

      const resolveData = (await resolveRes.json()) as ResolveBetResponse;

      // Required fields must all be present before we persist the resolution.
      // A partial response (e.g. LLM timeout) used to write an orphan object
      // that broke P&L and CosmicReport rendering. See KNOWN_ISSUES.md.
      if (
        resolveData?.outcome &&
        resolveData?.nasaEventId &&
        resolveData?.hash
      ) {
        result = {
          outcome: resolveData.outcome,
          explanation:
            resolveData.explanation || "The universe has spoken decisively.",
          nasaEventId: resolveData.nasaEventId,
          nasaEventType: resolveData.nasaEventType || "Solar Flare",
          hash: resolveData.hash,
        };
      } else {
        result = fallback;
      }
    } catch {
      result = fallback;
    }

    apiResultRef.current = result;
    setApiReady(true);
    if (warpDoneRef.current) {
      resolveRef.current(result);
    }
  }, [market.id, ticker]);

  const handleWarpComplete = useCallback(() => {
    warpDoneRef.current = true;
    const result = apiResultRef.current;
    if (result) {
      resolveRef.current(result);
    }
  }, []);

  const [allInMode, setAllInMode] = useState(false);
  const [allInSide, setAllInSide] = useState<"YES" | "NO">("YES");

  const handleAllIn = useCallback((active: boolean, side: "YES" | "NO") => {
    setAllInMode(active);
    setAllInSide(side);
  }, []);

  const relatedMarkets = useMemo(
    () =>
      rawMarkets
        .filter((m) => m.category === market.category && m.id !== market.id)
        .slice(0, 4),
    [market.category, market.id],
  );

  const hydrated = useHydrated();
  const storeResolution = useCosmicStore((s) => s.getResolution(market.id));
  const storePnl = useCosmicStore((s) => s.getPnL(market.id));
  const resolution = hydrated ? storeResolution : undefined;
  const pnl = hydrated ? storePnl : null;

  const didHealOrphanRef = useRef(false);
  useEffect(() => {
    if (!hydrated || didHealOrphanRef.current) return;
    didHealOrphanRef.current = true;
    if (!existingPosition || storeResolution) return;

    (async () => {
      const date = new Date().toISOString().split("T")[0];
      try {
        const res = await fetch("/api/resolve-bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ marketSlug: market.id, date }),
        });
        const data = (await res.json()) as ResolveBetResponse;
        if (!data?.outcome) return;
        const confidence = Math.round((85 + Math.random() * 14.9) * 10) / 10;
        ticker.setOutcome(data.outcome);
        resolveMarket(
          market.id,
          data.outcome,
          data.explanation || "The universe has spoken decisively.",
          data.nasaEventId,
          data.nasaEventType || "Solar Flare",
          data.hash,
          confidence,
        );
      } catch {
        // Leave state as-is
      }
    })();
  }, [
    hydrated,
    existingPosition,
    storeResolution,
    market.id,
    resolveMarket,
    ticker,
  ]);

  const yesCent = Math.round(ticker.yesPrice * 100);
  const noCent = Math.round(ticker.noPrice * 100);

  if (!hydrated) return <MarketLoading />;

  return (
    <div className="bg-paper text-ink">
      <SpeedUpOverlay
        visible={showSpeedUp}
        onSpeedUp={handleSpeedUp}
        onDismiss={() => setShowSpeedUp(false)}
        market={bureau}
        side={existingPosition?.side}
        amount={existingPosition?.amount}
      />
      <WarpAnimation
        active={showWarp}
        onComplete={handleWarpComplete}
        market={bureau}
        apiReady={apiReady}
      />

      <AnimatePresence>
        {allInMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="all-in-vignette pointer-events-none fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {allInMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="pointer-events-none fixed right-0 top-0 z-30 hidden h-[600px] w-[500px] lg:block"
            style={{
              top: "120px",
              right: "calc(50% - 560px + 380px)",
              background: `radial-gradient(ellipse at center, ${
                allInSide === "YES"
                  ? "rgba(14, 14, 12, 0.14)"
                  : "rgba(184, 132, 42, 0.18)"
              } 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="markets" />

      <div className="bureau-page py-5">
        <MarketHero m={bureau} yesCent={yesCent} noCent={noCent} />

        <div className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-[minmax(0,1fr)_360px] md:gap-9">
          {/* Chart — row 1 col 1 on desktop, first on mobile */}
          <motion.div
            animate={{ opacity: allInMode ? 0.55 : 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="min-w-0 md:col-start-1 md:row-start-1"
          >
            <MarketChartPanel
              marketId={market.id}
              yesPrice={ticker.yesPrice}
              volume={ticker.volume}
            />

            {resolution && (
              <Link
                href={`/resolution/${market.id}`}
                className="mt-6 flex flex-wrap items-center justify-between gap-[10px] border border-ink bg-paper-2 px-5 py-4 text-inherit no-underline"
              >
                <div>
                  <div className="bureau-mono mb-1 text-[10px] uppercase tracking-[0.22em] text-ink-3">
                    This market has been resolved
                  </div>
                  <div className="bureau-serif text-[18px] font-medium tracking-[-0.01em]">
                    Read the official resolution notice →
                  </div>
                </div>
                <span className="bureau-mono text-[11px] uppercase tracking-stamp text-ink">
                  {resolution.outcome} ·{" "}
                  {pnl !== null && (pnl >= 0 ? "+" : "−")}$
                  {pnl !== null ? Math.abs(pnl).toFixed(2) : "—"}
                </span>
              </Link>
            )}
          </motion.div>

          {/* Sidebar — spans both rows on desktop; on mobile appears right after the chart */}
          <div className="flex min-w-0 flex-col gap-5 md:col-start-2 md:row-start-1 md:row-span-2">
            <OrderTicket
              market={market}
              yesPrice={ticker.yesPrice}
              noPrice={ticker.noPrice}
              endsLabel={bureau.endsLabel}
              initialSide={initialSide}
              onBetPlaced={handleBetPlaced}
              onAllIn={handleAllIn}
              onRequestSpeedUp={() => setShowSpeedUp(true)}
            />
            <motion.div
              animate={{ opacity: allInMode ? 0.4 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col gap-5"
            >
              <TopCounterparties total={ticker.totalBettors} />
              <OracleStatus
                sessionHash={`0x${market.id
                  .replace(/[^a-f0-9]/gi, "")
                  .padEnd(8, "0")
                  .slice(0, 8)}…`}
              />
              <div className="bureau-mono flex justify-between border-t border-rule pt-3 text-[10px] uppercase tracking-[0.1em] text-ink-3">
                <span>OPEN INTEREST</span>
                <span className="bureau-num text-ink">
                  {fmtUSDShort(ticker.volume)}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Secondary info — row 2 col 1 on desktop, last on mobile */}
          <div className="min-w-0 md:col-start-1 md:row-start-2">
            <Methodology />

            {relatedMarkets.length > 0 && (
              <div className="mt-7">
                <div className="mb-[14px] flex items-baseline justify-between border-b-2 border-ink pb-2">
                  <div className="bureau-serif text-[20px] font-medium tracking-[-0.01em]">
                    Related markets
                  </div>
                  <div className="bureau-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                    Same desk · {market.category}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[14px] max-sm:grid-cols-1">
                  {relatedMarkets.map((rm) => (
                    <Link
                      key={rm.id}
                      href={`/market/${rm.id}`}
                      className="flex flex-col gap-[10px] border border-rule bg-paper p-[14px] text-inherit no-underline"
                    >
                      <div
                        className="bureau-serif overflow-hidden text-[15px] font-medium leading-[1.3] text-ink"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {rm.question}
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="bureau-num text-[14px] font-semibold">
                          {Math.round(rm.yesPrice * 100)}¢{" "}
                          <span className="text-[11px] text-ink-3">YES</span>
                        </span>
                        <span className="bureau-mono text-[10px] tracking-wire text-ink-3">
                          {formatVolume(rm.volume)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
