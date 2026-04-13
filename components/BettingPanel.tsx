"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Market } from "@/lib/types";
import { useCosmicStore } from "@/lib/store";
import { useHydrated } from "@/hooks/useHydrated";

const QUICK_AMOUNTS = [10, 25, 50, 100];

export function BettingPanel({
  market,
  yesPrice,
  noPrice,
  initialSide,
  onBetPlaced,
  onAllIn,
}: {
  market: Market;
  yesPrice: number;
  noPrice: number;
  initialSide: "YES" | "NO";
  onBetPlaced: () => void;
  onAllIn?: (active: boolean, side: "YES" | "NO") => void;
}) {
  const [side, setSide] = useState<"YES" | "NO">(initialSide);
  const [amount, setAmount] = useState(10);
  const [justBet, setJustBet] = useState(false);
  const [isAllIn, setIsAllIn] = useState(false);

  const hydrated = useHydrated();
  const balance = useCosmicStore((s) => s.balance);
  const placeBet = useCosmicStore((s) => s.placeBet);
  const storePosition = useCosmicStore((s) => s.getPosition(market.id));
  const storeResolution = useCosmicStore((s) => s.getResolution(market.id));
  const storePnl = useCosmicStore((s) => s.getPnL(market.id));

  // Guard with hydrated to prevent SSR mismatch
  const position = hydrated ? storePosition : undefined;
  const resolution = hydrated ? storeResolution : undefined;
  const pnl = hydrated ? storePnl : null;

  const price = side === "YES" ? yesPrice : noPrice;
  const potentialReturn = price > 0 ? amount / price : 0;
  const profit = potentialReturn - amount;
  const canBet = amount > 0 && amount <= balance && !position && !resolution;

  const yesPct = Math.round(yesPrice * 100);
  const noPct = Math.round(noPrice * 100);

  const handleBuy = () => {
    if (!canBet) return;
    const success = placeBet(market.id, market.question, side, amount, price);
    if (success) {
      setJustBet(true);
      onBetPlaced();
    }
  };

  return (
    <div className="space-y-4">
      {/* Betting interface */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4">
          {/* Side selector */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => !position && setSide("YES")}
              disabled={!!position}
              className={`rounded-lg py-3 text-center text-sm font-bold transition-all ${
                side === "YES"
                  ? "bg-green text-white shadow-sm"
                  : "bg-green-bg text-green hover:bg-green/10"
              } ${position ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Buy Yes {yesPct}¢
            </button>
            <button
              type="button"
              onClick={() => !position && setSide("NO")}
              disabled={!!position}
              className={`rounded-lg py-3 text-center text-sm font-bold transition-all ${
                side === "NO"
                  ? "bg-red text-white shadow-sm"
                  : "bg-red-bg text-red hover:bg-red/10"
              } ${position ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Buy No {noPct}¢
            </button>
          </div>

          {/* Show position if exists */}
          {position ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Your position</span>
                  <span
                    className={`font-bold ${position.side === "YES" ? "text-green" : "text-red"}`}
                  >
                    {position.side}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Amount</span>
                  <span className="font-medium tabular-nums">
                    ${position.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shares</span>
                  <span className="font-medium tabular-nums">
                    {position.shares.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Avg price</span>
                  <span className="font-medium tabular-nums">
                    {Math.round(position.price * 100)}¢
                  </span>
                </div>

                {/* Show P&L if resolved */}
                {resolution && pnl !== null && (
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted">P&L</span>
                    <span
                      className={`font-bold tabular-nums ${pnl >= 0 ? "text-green" : "text-red"}`}
                    >
                      {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Resolved state */}
              {resolution && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg p-3 text-center text-sm font-bold ${
                      position.side === resolution.outcome
                        ? "bg-green-bg text-green"
                        : "bg-red-bg text-red"
                    }`}
                  >
                    {position.side === resolution.outcome
                      ? "You won this market."
                      : "The cosmos ruled against you."}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          ) : (
            <>
              {/* Amount input */}
              <div className="mb-3">
                <label className="mb-1.5 block text-xs font-medium text-muted">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(Number(e.target.value) || 0);
                      if (isAllIn) {
                        setIsAllIn(false);
                        onAllIn?.(false, side);
                      }
                    }}
                    className="w-full rounded-lg border border-border bg-white py-2.5 pl-7 pr-3 text-sm font-medium tabular-nums focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>

              {/* Quick amount buttons */}
              <div className="mb-2 flex gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      setAmount(a);
                      if (isAllIn) {
                        setIsAllIn(false);
                        onAllIn?.(false, side);
                      }
                    }}
                    className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      amount === a && !isAllIn
                        ? "bg-foreground text-background"
                        : "bg-gray-100 text-muted hover:bg-gray-200"
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>

              {/* ALL IN button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const allInAmount = Math.floor(balance);
                    if (allInAmount <= 0) return;
                    setAmount(allInAmount);
                    setIsAllIn(true);
                    onAllIn?.(true, side);
                  }}
                  className={`w-full rounded-md py-2 text-xs font-black tracking-widest uppercase transition-all ${
                    isAllIn
                      ? side === "YES"
                        ? "bg-green text-white all-in-glow [--glow-color:rgba(34,197,94,0.4)]"
                        : "bg-red text-white all-in-glow [--glow-color:rgba(239,68,68,0.4)]"
                      : "border border-dashed border-gray-300 text-muted hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {isAllIn ? `ALL IN — $${Math.floor(balance)}` : "ALL IN"}
                </button>
              </div>

              {/* Potential return */}
              <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Avg price</span>
                  <span className="tabular-nums font-medium">
                    {Math.round(price * 100)}¢
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shares</span>
                  <span className="tabular-nums font-medium">
                    {potentialReturn.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted">Potential return</span>
                  <span className="tabular-nums font-bold text-green">
                    ${potentialReturn.toFixed(2)}{" "}
                    <span className="text-xs font-normal">
                      (+{((profit / amount) * 100).toFixed(0)}%)
                    </span>
                  </span>
                </div>
              </div>

              {/* Buy button */}
              <motion.button
                type="button"
                onClick={handleBuy}
                disabled={!canBet}
                animate={
                  isAllIn && canBet ? { scale: [1, 1.02, 1] } : { scale: 1 }
                }
                transition={
                  isAllIn
                    ? {
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }
                    : { duration: 0.15 }
                }
                className={`w-full rounded-lg text-white font-bold transition-all ${
                  !canBet
                    ? "bg-gray-300 cursor-not-allowed py-3 text-sm"
                    : isAllIn
                      ? side === "YES"
                        ? "bg-green py-4 text-base tracking-wide all-in-glow [--glow-color:rgba(34,197,94,0.35)]"
                        : "bg-red py-4 text-base tracking-wide all-in-glow [--glow-color:rgba(239,68,68,0.35)]"
                      : side === "YES"
                        ? "bg-green hover:bg-green/90 active:scale-[0.98] py-3 text-sm"
                        : "bg-red hover:bg-red/90 active:scale-[0.98] py-3 text-sm"
                }`}
              >
                {amount > balance
                  ? "Insufficient balance"
                  : isAllIn
                    ? `GO ALL IN — ${side}`
                    : `Buy ${side}`}
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
