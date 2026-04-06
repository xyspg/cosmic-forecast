"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import marketsData from "@/data/markets.json";
import type { Market } from "@/lib/types";
import { useCosmicStore } from "@/lib/store";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { SpeedUpOverlay } from "@/components/SpeedUpOverlay";
import { WarpAnimation } from "@/components/WarpAnimation";
import { CosmicReport } from "@/components/CosmicReport";

const markets = marketsData as Market[];
const featuredMarkets = markets.filter((m) => m.featured);

export default function JoinPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const market = featuredMarkets[currentIndex % featuredMarkets.length];

  return (
    <JoinPageContent
      key={market.id}
      market={market}
      onNext={() => setCurrentIndex((i) => i + 1)}
    />
  );
}

function JoinPageContent({
  market,
  onNext,
}: {
  market: Market;
  onNext: () => void;
}) {
  const ticker = useMarketTicker(market);
  const balance = useCosmicStore((s) => s.balance);
  const placeBet = useCosmicStore((s) => s.placeBet);
  const resolveMarket = useCosmicStore((s) => s.resolveMarket);
  const position = useCosmicStore((s) => s.getPosition(market.id));
  const resolution = useCosmicStore((s) => s.getResolution(market.id));
  const pnl = useCosmicStore((s) => s.getPnL(market.id));

  const [showSpeedUp, setShowSpeedUp] = useState(false);
  const [showWarp, setShowWarp] = useState(false);
  const [apiResult, setApiResult] = useState<{
    outcome: "YES" | "NO";
    explanation: string;
    nasaEventId: string;
    nasaEventType: string;
    hash: string;
  } | null>(null);

  const yesPct = Math.round(ticker.yesPrice * 100);
  const noPct = Math.round(ticker.noPrice * 100);

  const handleBet = (side: "YES" | "NO") => {
    if (position || resolution) return;
    const price = side === "YES" ? ticker.yesPrice : ticker.noPrice;
    const success = placeBet(market.id, market.question, side, 10, price);
    if (success) {
      setTimeout(() => setShowSpeedUp(true), 2000);
    }
  };

  const handleSpeedUp = useCallback(async () => {
    setShowSpeedUp(false);
    setShowWarp(true);
    ticker.freeze();

    const date = new Date().toISOString().split("T")[0];
    try {
      const resolveRes = await fetch("/api/resolve-bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketSlug: market.id, date }),
      });
      const resolveData = await resolveRes.json();

      const explanationRes = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketSlug: market.id,
          outcome: resolveData.outcome,
          nasaEvent: resolveData.nasaEvent,
          marketQuestion: resolveData.marketQuestion,
        }),
      });
      const explData = await explanationRes.json();

      setApiResult({
        outcome: resolveData.outcome,
        explanation: explData.explanation || "The universe has spoken.",
        nasaEventId: resolveData.nasaEventId,
        nasaEventType: resolveData.nasaEventType || "Solar Flare",
        hash: resolveData.hash,
      });
    } catch {
      setApiResult({
        outcome: Math.random() > 0.5 ? "YES" : "NO",
        explanation: "The cosmic signal was received. The SHA-256 resonance pattern is unambiguous.",
        nasaEventId: "FLR-FALLBACK",
        nasaEventType: "Solar Flare",
        hash: "0".repeat(64),
      });
    }
  }, [market.id, ticker]);

  const handleWarpComplete = useCallback(() => {
    setShowWarp(false);
    if (apiResult) {
      const confidence = Math.round((85 + Math.random() * 14.9) * 10) / 10;
      ticker.setOutcome(apiResult.outcome);
      resolveMarket(
        market.id,
        apiResult.outcome,
        apiResult.explanation,
        apiResult.nasaEventId,
        apiResult.nasaEventType,
        apiResult.hash,
        confidence,
      );
    }
  }, [apiResult, market.id, ticker, resolveMarket]);

  return (
    <>
      <SpeedUpOverlay visible={showSpeedUp} onSpeedUp={handleSpeedUp} />
      <WarpAnimation active={showWarp} onComplete={handleWarpComplete} />

      <div className="flex min-h-dvh flex-col bg-white">
        {/* Header */}
        <header className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
              <span className="text-base font-semibold">Cosmic Forecast</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-green" />
              <span className="text-sm font-medium tabular-nums">
                ${balance.toFixed(2)}
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-6">
          <div className="w-full max-w-md space-y-6">
            {/* Question */}
            <h1 className="text-center text-xl font-bold leading-tight">
              {market.question}
            </h1>

            {resolution ? (
              <div className="space-y-4">
                <CosmicReport
                  resolution={resolution}
                  marketQuestion={market.question}
                />

                {position && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-4 text-center text-sm font-bold ${
                      position.side === resolution.outcome
                        ? "bg-green-bg text-green"
                        : "bg-red-bg text-red"
                    }`}
                  >
                    {position.side === resolution.outcome
                      ? `You won! +$${((pnl ?? 0) > 0 ? pnl : 0)?.toFixed(2)}`
                      : `The cosmos ruled against you. -$${position.amount.toFixed(2)}`}
                  </motion.div>
                )}

                <button
                  type="button"
                  onClick={onNext}
                  className="w-full rounded-xl bg-foreground py-4 text-base font-bold text-background active:scale-[0.98] transition-transform"
                >
                  Next Market
                </button>
              </div>
            ) : (
              <>
                {/* Big Yes/No buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleBet("YES")}
                    disabled={!!position}
                    className={`rounded-2xl py-8 text-center transition-all ${
                      position?.side === "YES"
                        ? "bg-green text-white shadow-lg scale-[1.02]"
                        : position
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-green-bg text-green active:scale-95"
                    }`}
                  >
                    <span className="block text-sm font-medium mb-1">Yes</span>
                    <span className="block text-4xl font-black tabular-nums">
                      {yesPct}¢
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBet("NO")}
                    disabled={!!position}
                    className={`rounded-2xl py-8 text-center transition-all ${
                      position?.side === "NO"
                        ? "bg-red text-white shadow-lg scale-[1.02]"
                        : position
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-red-bg text-red active:scale-95"
                    }`}
                  >
                    <span className="block text-sm font-medium mb-1">No</span>
                    <span className="block text-4xl font-black tabular-nums">
                      {noPct}¢
                    </span>
                  </button>
                </div>

                {position && !showSpeedUp && !showWarp && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-sm text-muted"
                  >
                    Position locked. $10 on {position.side}.
                  </motion.p>
                )}
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-4 py-3 text-center text-xs text-muted/60">
          Outcomes determined by cosmic forces beyond human comprehension.
        </footer>
      </div>
    </>
  );
}
