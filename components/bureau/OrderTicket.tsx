"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { fmtUSDShort } from "@/lib/market-metadata";
import { useCosmicStore } from "@/lib/store";
import type { Market } from "@/lib/types";

const QUICK_AMOUNTS = [10, 25, 50, 100];

function ReceiptRow({
  k,
  v,
  last,
}: {
  k: string;
  v: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-[5px] font-mono text-[11px] ${last ? "" : "border-b border-dotted border-rule"}`}
    >
      <span className="text-ink-3">{k}</span>
      <span>{v}</span>
    </div>
  );
}

export function OrderTicket({
  market,
  yesPrice,
  noPrice,
  endsLabel,
  initialSide,
  onBetPlaced,
  onAllIn,
  onRequestSpeedUp,
}: {
  market: Market;
  yesPrice: number;
  noPrice: number;
  endsLabel: string;
  initialSide: "YES" | "NO";
  onBetPlaced: () => void;
  onAllIn?: (active: boolean, side: "YES" | "NO") => void;
  onRequestSpeedUp?: () => void;
}) {
  const [side, setSide] = useState<"YES" | "NO">(initialSide);
  const [amount, setAmount] = useState(100);
  const [isAllIn, setIsAllIn] = useState(false);

  const hydrated = useHydrated();
  const balance = useCosmicStore((s) => s.balance);
  const placeBet = useCosmicStore((s) => s.placeBet);
  const storePosition = useCosmicStore((s) => s.getPosition(market.id));
  const storeResolution = useCosmicStore((s) => s.getResolution(market.id));
  const storePnl = useCosmicStore((s) => s.getPnL(market.id));

  const position = hydrated ? storePosition : undefined;
  const resolution = hydrated ? storeResolution : undefined;
  const pnl = hydrated ? storePnl : null;

  const price = side === "YES" ? yesPrice : noPrice;
  const shares = price > 0 ? amount / price : 0;
  const potential = shares;
  const roi = amount > 0 ? ((potential - amount) / amount) * 100 : 0;

  const yesCent = Math.round(yesPrice * 100);
  const noCent = Math.round(noPrice * 100);
  const canBet = amount > 0 && amount <= balance && !position && !resolution;

  const handleBuy = () => {
    if (!canBet) return;
    const success = placeBet(market.id, market.question, side, amount, price);
    if (success) onBetPlaced();
  };

  const clearAllIn = () => {
    if (isAllIn) {
      setIsAllIn(false);
      onAllIn?.(false, side);
    }
  };

  return (
    <div className="border border-ink bg-paper">
      <div className="flex items-baseline justify-between border-b border-ink bg-paper-2 px-[14px] py-[10px]">
        <div className="bureau-mono text-[11px] font-semibold uppercase tracking-eyebrow">
          {position ? "Position on file" : "Order ticket"}
        </div>
        <div className="bureau-mono text-[10px] tracking-[0.1em] text-ink-3">
          FORM PM-4
        </div>
      </div>

      <div className="p-[14px]">
        {position ? (
          <>
            <div className="mb-3 border-b border-ink pb-[10px]">
              <div className="bureau-eyebrow mb-1">Side of record</div>
              <div
                className={`bureau-serif text-[28px] font-medium ${position.side === "YES" ? "text-ink" : "text-ink-3"}`}
              >
                {position.side}{" "}
                <span className="text-[18px] text-ink-3">
                  @ {Math.round(position.price * 100)}¢
                </span>
              </div>
            </div>

            <ReceiptRow
              k="Principal"
              v={<span>${position.amount.toFixed(2)}</span>}
            />
            <ReceiptRow
              k="Shares"
              v={<span>{position.shares.toFixed(2)}</span>}
            />
            {resolution && pnl !== null ? (
              <>
                <ReceiptRow
                  k="Outcome"
                  v={
                    <span
                      className={
                        position.side === resolution.outcome
                          ? "text-pl-pos"
                          : "text-pl-neg"
                      }
                    >
                      {resolution.outcome}
                    </span>
                  }
                />
                <ReceiptRow
                  k="Realized P&L"
                  v={
                    <span
                      className={`font-semibold ${pnl >= 0 ? "text-pl-pos" : "text-pl-neg"}`}
                    >
                      {pnl >= 0 ? "+" : "−"}${Math.abs(pnl).toFixed(2)}
                    </span>
                  }
                  last
                />
              </>
            ) : (
              <ReceiptRow k="Settlement" v={<span>{endsLabel}</span>} last />
            )}

            {!resolution && onRequestSpeedUp && (
              <button
                type="button"
                onClick={onRequestSpeedUp}
                className="mt-[14px] w-full cursor-pointer border border-amber bg-black py-[14px] font-mono text-[11px] font-semibold uppercase tracking-stamp text-amber transition-colors duration-200 hover:bg-amber hover:text-black"
              >
                ◈ Speed up settlement
              </button>
            )}

            {resolution && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-[14px] border border-ink px-3 py-[10px] text-center font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${
                    position.side === resolution.outcome
                      ? "bg-pl-pos-bg text-pl-pos"
                      : "bg-pl-neg-bg text-pl-neg"
                  }`}
                >
                  {position.side === resolution.outcome
                    ? "Position cleared — participant prevailed"
                    : "Position extinguished by oracle"}
                </motion.div>
              </AnimatePresence>
            )}
          </>
        ) : (
          <>
            <div className="mb-[14px] grid grid-cols-2 border border-ink">
              {(["YES", "NO"] as const).map((s) => {
                const active = side === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`flex cursor-pointer items-baseline justify-between border-0 px-[10px] py-[14px] text-left font-mono text-[11px] tracking-eyebrow ${
                      s === "YES" ? "border-r border-ink" : ""
                    } ${active ? "bg-ink text-paper" : "bg-paper text-ink"}`}
                  >
                    <span className="font-semibold">{s}</span>
                    <span className="bureau-num text-[15px] font-medium">
                      {s === "YES" ? yesCent : noCent}¢
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="bureau-eyebrow mb-[6px]">Principal · USD</div>
            <div className="relative mb-[10px]">
              <span className="bureau-mono absolute left-[10px] top-1/2 -translate-y-1/2 text-ink-3">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  clearAllIn();
                  const n = Number(e.target.value.replace(/[^\d.]/g, ""));
                  setAmount(Number.isFinite(n) ? Math.max(0, n) : 0);
                }}
                className="box-border w-full border border-rule bg-paper py-3 pl-6 pr-3 font-mono text-[18px] text-ink outline-none"
              />
            </div>

            <div className="mb-2 grid grid-cols-4 gap-1">
              {QUICK_AMOUNTS.map((v) => {
                const active = amount === v && !isAllIn;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      clearAllIn();
                      setAmount(v);
                    }}
                    className={`cursor-pointer border border-rule py-2 font-mono text-[11px] tracking-wire ${
                      active ? "bg-ink text-paper" : "bg-paper text-ink-2"
                    }`}
                  >
                    ${v}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const max = Math.floor(balance);
                if (max <= 0) return;
                setAmount(max);
                setIsAllIn(true);
                onAllIn?.(true, side);
              }}
              suppressHydrationWarning
              className={`mb-[14px] w-full cursor-pointer border border-dashed border-ink py-2 font-mono text-[10px] uppercase tracking-stamp ${
                isAllIn ? "bg-ink text-paper" : "bg-paper-2 text-ink"
              }`}
            >
              {isAllIn
                ? `ALL IN · $${Math.floor(balance)}`
                : `Maximum principal · $${balance.toFixed(2)}`}
            </button>

            <div className="mb-[14px] border-y border-ink py-[10px]">
              <ReceiptRow
                k="Avg. price"
                v={<span>{Math.round(price * 100)}¢</span>}
              />
              <ReceiptRow k="Shares" v={<span>{shares.toFixed(2)}</span>} />
              <ReceiptRow
                k={`Max. payout if ${side}`}
                v={<span>${potential.toFixed(2)}</span>}
              />
              <ReceiptRow
                k="Implied return"
                v={
                  <span
                    className={roi > 0 ? "text-pl-pos" : "text-ink-3"}
                  >
                    +{roi.toFixed(1)}%
                  </span>
                }
              />
              <ReceiptRow k="Fees" v={<span>$0.00</span>} />
              <ReceiptRow k="Settlement" v={<span>{endsLabel}</span>} last />
            </div>

            <motion.button
              type="button"
              onClick={handleBuy}
              disabled={!canBet}
              animate={
                isAllIn && canBet ? { scale: [1, 1.015, 1] } : { scale: 1 }
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
              className={`w-full border-0 py-4 font-mono text-[12px] font-semibold uppercase tracking-stamp text-paper ${
                canBet ? "cursor-pointer bg-ink" : "cursor-not-allowed bg-ink-4"
              }`}
            >
              {amount > balance
                ? "Insufficient principal"
                : `Submit ${side} order · $${amount.toFixed(2)}`}
            </motion.button>

            <div className="mt-[10px] font-sans text-[10px] leading-[1.5] text-ink-3">
              By submitting, participant attests to understanding of the
              resolution methodology and represents that principal is
              uncommitted elsewhere. Positions are non-transferable.
            </div>
          </>
        )}
      </div>

      {position && (
        <div className="flex justify-between border-t border-ink bg-paper-2 px-[14px] py-[10px] font-mono text-[10px] tracking-[0.1em] text-ink-3">
          <span>OPEN INTEREST</span>
          <span>{fmtUSDShort(market.volume)}</span>
        </div>
      )}
    </div>
  );
}
