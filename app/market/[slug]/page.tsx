"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityFeed } from "@/components/ActivityFeed";
import { BettingPanel } from "@/components/BettingPanel";
import { CommentFeed } from "@/components/CommentFeed";
import { CosmicReport } from "@/components/CosmicReport";
import { Navbar } from "@/components/Navbar";
import { OrderBook } from "@/components/OrderBook";
import { PriceChart } from "@/components/PriceChart";
import { ResultModal } from "@/components/ResultModal";
import { SpeedUpOverlay } from "@/components/SpeedUpOverlay";
import { WarpAnimation } from "@/components/WarpAnimation";
import marketsData from "@/data/markets.json";
import { useHydrated } from "@/hooks/useHydrated";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { formatNumber, formatVolume } from "@/lib/fake-data";
import { useCosmicStore } from "@/lib/store";
import type { Market, ResolveBetResponse } from "@/lib/types";

const markets = marketsData as Market[];

export default function MarketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const market = markets.find((m) => m.id === slug);

  if (!market) {
    notFound();
  }

  return <MarketPageContent market={market} />;
}

function MarketPageContent({ market }: { market: Market }) {
  const searchParams = useSearchParams();
  const sideParam = searchParams.get("side");
  const initialSide: "YES" | "NO" =
    sideParam?.toLowerCase() === "no" ? "NO" : "YES";

  const ticker = useMarketTicker(market);
  const resolveMarket = useCosmicStore((s) => s.resolveMarket);

  // Flow states
  const [showSpeedUp, setShowSpeedUp] = useState(false);
  const [showWarp, setShowWarp] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Refs to coordinate two async events: animation done + API response
  type ApiResult = {
    outcome: "YES" | "NO";
    explanation: string;
    nasaEventId: string;
    nasaEventType: string;
    hash: string;
  };
  const apiResultRef = useRef<ApiResult | null>(null);
  const warpDoneRef = useRef(false);

  // Always-fresh resolve function via ref (avoids stale closures in callbacks)
  const resolveRef = useRef<(result: ApiResult) => void>(() => {});
  resolveRef.current = (result) => {
    setShowWarp(false);
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
    // Show result modal after a brief delay for the warp to fade
    setTimeout(() => setShowResult(true), 400);
  };

  // After user places a bet → clear ALL IN mode + wait 2s → show dark overlay
  const handleBetPlaced = useCallback(() => {
    setAllInMode(false);
    setTimeout(() => {
      setShowSpeedUp(true);
    }, 2000);
  }, []);

  const existingPosition = useCosmicStore((s) => s.getPosition(market.id));

  // User clicks "Speed Up Time" → start warp + fire API calls
  const handleSpeedUp = useCallback(async () => {
    setShowSpeedUp(false);
    setShowWarp(true);
    apiResultRef.current = null;
    warpDoneRef.current = false;
    ticker.freeze();

    const date = new Date().toISOString().split("T")[0];
    let result: ApiResult;

    try {
      const resolveRes = await fetch("/api/resolve-bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketSlug: market.id, date }),
      });

      const resolveData = (await resolveRes.json()) as ResolveBetResponse;

      result = {
        outcome: resolveData.outcome,
        explanation:
          resolveData.explanation || "The universe has spoken decisively.",
        nasaEventId: resolveData.nasaEventId,
        nasaEventType: resolveData.nasaEventType || "Solar Flare",
        hash: resolveData.hash,
      };
    } catch {
      result = {
        outcome: Math.random() > 0.5 ? "YES" : "NO",
        explanation:
          "The cosmic signal was received but partially obscured by interstellar noise. The SHA-256 resonance pattern remains unambiguous.",
        nasaEventId: "FLR-FALLBACK",
        nasaEventType: "Solar Flare",
        hash: "0".repeat(64),
      };
    }

    // API done — if animation already finished, resolve immediately
    apiResultRef.current = result;
    if (warpDoneRef.current) {
      resolveRef.current(result);
    }
  }, [market.id, ticker]);

  // Warp animation finishes — if API already returned, resolve immediately
  // Otherwise animation stays visible until handleSpeedUp resolves
  const handleWarpComplete = useCallback(() => {
    warpDoneRef.current = true;
    const result = apiResultRef.current;
    if (result) {
      resolveRef.current(result);
    }
  }, []);

  // ALL IN mode — dramatic page-wide reaction
  const [allInMode, setAllInMode] = useState(false);
  const [allInSide, setAllInSide] = useState<"YES" | "NO">("YES");

  const handleAllIn = useCallback((active: boolean, side: "YES" | "NO") => {
    setAllInMode(active);
    setAllInSide(side);
  }, []);

  // Related markets
  const relatedMarkets = useMemo(
    () =>
      markets
        .filter((m) => m.category === market.category && m.id !== market.id)
        .slice(0, 4),
    [market.category, market.id],
  );

  const endDate = new Date(market.endDate);
  const daysLeft = Math.max(
    0,
    Math.ceil((endDate.getTime() - Date.now()) / 86400000),
  );

  // Get resolution + P&L from store — guard with hydrated to avoid mismatch
  const hydrated = useHydrated();
  const storeResolution = useCosmicStore((s) => s.getResolution(market.id));
  const storePnl = useCosmicStore((s) => s.getPnL(market.id));
  const resolution = hydrated ? storeResolution : undefined;
  const pnl = hydrated ? storePnl : null;

  // Self-heal orphan state: position persisted but resolution never completed
  // (tab closed / refresh mid-flow). Silently resolve on load — no overlay.
  const didHealOrphanRef = useRef(false);
  useEffect(() => {
    if (!hydrated || didHealOrphanRef.current) return;
    // Lock immediately so bets placed later in this session aren't auto-healed
    // (they go through the normal overlay → warp flow instead)
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
        // Leave state as-is; user can retry by placing another action
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

  return (
    <>
      <SpeedUpOverlay visible={showSpeedUp} onSpeedUp={handleSpeedUp} />
      <WarpAnimation active={showWarp} onComplete={handleWarpComplete} />

      {/* Result modal — shows win/loss after resolution */}
      {existingPosition && pnl !== null && resolution && (
        <ResultModal
          open={showResult}
          onClose={() => setShowResult(false)}
          won={existingPosition.side === resolution.outcome}
          amount={
            existingPosition.side === resolution.outcome
              ? existingPosition.shares
              : 0
          }
          pnl={pnl}
          marketQuestion={market.question}
          betAmount={existingPosition.amount}
          side={existingPosition.side}
        />
      )}

      {/* ALL IN vignette overlay */}
      <AnimatePresence>
        {allInMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed inset-0 z-40 pointer-events-none all-in-vignette"
          />
        )}
      </AnimatePresence>

      {/* ALL IN ambient glow behind betting panel */}
      <AnimatePresence>
        {allInMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 right-0 z-30 pointer-events-none hidden lg:block"
            style={{
              width: "500px",
              height: "600px",
              top: "120px",
              right: "calc(50% - 560px + 380px)",
              background: `radial-gradient(ellipse at center, ${
                allInSide === "YES"
                  ? "rgba(34, 197, 94, 0.12)"
                  : "rgba(239, 68, 68, 0.12)"
              } 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      <Navbar />

      <main className="mx-auto max-w-5xl overflow-x-hidden px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Markets
          </Link>
          <span>/</span>
          <span className="text-gray-900">{market.category}</span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left column */}
          <div className="min-w-0 space-y-6">
            {/* Question */}
            <div>
              <h1 className="text-2xl font-bold leading-tight text-gray-900 mb-3">
                {market.question}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {daysLeft > 0 ? `${daysLeft} days left` : "Ending soon"}
                </span>
                <span>{formatVolume(ticker.volume)} Volume</span>
                <span>{formatNumber(ticker.totalBettors)} Bettors</span>
              </div>
            </div>

            {/* Price chart */}
            <motion.div
              animate={{ opacity: allInMode ? 0.5 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <PriceChart slug={market.id} currentPrice={ticker.yesPrice} />
            </motion.div>

            {/* Betting panel — below chart on mobile, sidebar on desktop */}
            <div className="lg:hidden">
              <BettingPanel
                market={market}
                yesPrice={ticker.yesPrice}
                noPrice={ticker.noPrice}
                initialSide={initialSide}
                onBetPlaced={handleBetPlaced}
                onAllIn={handleAllIn}
              />
            </div>

            {/* Cosmic report — show after resolution */}
            {resolution && (
              <CosmicReport
                resolution={resolution}
                marketQuestion={market.question}
              />
            )}

            {/* Comments, order book, info — dim during ALL IN */}
            <motion.div
              className="space-y-6"
              animate={{ opacity: allInMode ? 0.35 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <CommentFeed slug={market.id} />
              <OrderBook yesPrice={ticker.yesPrice} slug={market.id} />

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-bold text-gray-900">
                  Resolution Criteria
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  This market resolves based on real-time astronomical data from
                  NASA&apos;s DONKI (Space Weather Database). The outcome is
                  deterministically computed using SHA-256 hashing of the latest
                  solar event ID, current date, and market identifier.
                </p>
              </div>

              {relatedMarkets.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold text-gray-900">
                    Related Markets
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {relatedMarkets.map((rm) => (
                      <Link
                        key={rm.id}
                        href={`/market/${rm.id}`}
                        className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300"
                      >
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                          {rm.question}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-green tabular-nums">
                            {Math.round(rm.yesPrice * 100)}¢ Yes
                          </span>
                          <span className="text-gray-400">
                            {formatVolume(rm.volume)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column — hidden on mobile (betting panel is inline above) */}
          <div className="hidden lg:block space-y-6">
            <BettingPanel
              market={market}
              yesPrice={ticker.yesPrice}
              noPrice={ticker.noPrice}
              initialSide={initialSide}
              onBetPlaced={handleBetPlaced}
              onAllIn={handleAllIn}
            />
            <motion.div
              animate={{ opacity: allInMode ? 0.35 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ActivityFeed markets={markets.slice(0, 10)} />
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
