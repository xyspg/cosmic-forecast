import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { fmtUSDShort } from "@/lib/market-metadata";
import { useCosmicStore } from "@/lib/store";
import type { Market } from "@/lib/types";

const QUICK_AMOUNTS = [10, 25, 50, 100];

function ReceiptRow({ k, v, last }: { k: string; v: React.ReactNode; last?: boolean }) {
  return (
    <div
      className={`flex justify-between py-[5px] font-mono text-[11px] ${last ? "" : "border-rule border-b border-dotted"}`}
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

  const balance = useCosmicStore((s) => s.balance);
  const placeBet = useCosmicStore((s) => s.placeBet);
  const position = useCosmicStore((s) => s.getPosition(market.id));
  const resolution = useCosmicStore((s) => s.getResolution(market.id));
  const pnl = useCosmicStore((s) => s.getPnL(market.id));

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
    <div className="border-ink bg-paper border">
      <div className="border-ink bg-paper-2 flex items-baseline justify-between border-b px-[14px] py-[10px]">
        <div className="bureau-mono tracking-eyebrow text-[11px] font-semibold uppercase">
          {position ? "Position on file" : "Order ticket"}
        </div>
        <div className="bureau-mono text-ink-3 text-[10px] tracking-[0.1em]">FORM PM-4</div>
      </div>

      <div className="p-[14px]">
        {position ? (
          <>
            <div className="border-ink mb-3 border-b pb-[10px]">
              <div className="bureau-eyebrow mb-1">Side of record</div>
              <div
                className={`bureau-serif text-[28px] font-medium ${position.side === "YES" ? "text-ink" : "text-ink-3"}`}
              >
                {position.side}{" "}
                <span className="text-ink-3 text-[18px]">
                  @ {Math.round(position.price * 100)}¢
                </span>
              </div>
            </div>

            <ReceiptRow k="Principal" v={<span>${position.amount.toFixed(2)}</span>} />
            <ReceiptRow k="Shares" v={<span>{position.shares.toFixed(2)}</span>} />
            {resolution && pnl !== null ? (
              <>
                <ReceiptRow
                  k="Outcome"
                  v={
                    <span
                      className={
                        position.side === resolution.outcome ? "text-pl-pos" : "text-pl-neg"
                      }
                    >
                      {resolution.outcome}
                    </span>
                  }
                />
                <ReceiptRow
                  k="Realized P&L"
                  v={
                    <span className={`font-semibold ${pnl >= 0 ? "text-pl-pos" : "text-pl-neg"}`}>
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
                className="border-amber tracking-stamp text-amber hover:bg-amber mt-[14px] w-full cursor-pointer border bg-black py-[14px] font-mono text-[11px] font-semibold uppercase transition-colors duration-200 hover:text-black"
              >
                ◈ Speed up settlement
              </button>
            )}

            {resolution && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border-ink mt-[14px] border px-3 py-[10px] text-center font-mono text-[11px] font-semibold tracking-[0.1em] uppercase ${
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
            <div className="border-ink mb-[14px] grid grid-cols-2 border">
              {(["YES", "NO"] as const).map((s) => {
                const active = side === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`tracking-eyebrow flex cursor-pointer items-baseline justify-between border-0 px-[10px] py-[14px] text-left font-mono text-[11px] ${
                      s === "YES" ? "border-ink border-r" : ""
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
              <span className="bureau-mono text-ink-3 absolute top-1/2 left-[10px] -translate-y-1/2">
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
                className="border-rule bg-paper text-ink box-border w-full border py-3 pr-3 pl-6 font-mono text-[18px] outline-none"
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
                    className={`border-rule tracking-wire cursor-pointer border py-2 font-mono text-[11px] ${
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
              className={`border-ink tracking-stamp mb-[14px] w-full cursor-pointer border border-dashed py-2 font-mono text-[10px] uppercase ${
                isAllIn ? "bg-ink text-paper" : "bg-paper-2 text-ink"
              }`}
            >
              {isAllIn
                ? `ALL IN · $${Math.floor(balance)}`
                : `Maximum principal · $${balance.toFixed(2)}`}
            </button>

            <div className="border-ink mb-[14px] border-y py-[10px]">
              <ReceiptRow k="Avg. price" v={<span>{Math.round(price * 100)}¢</span>} />
              <ReceiptRow k="Shares" v={<span>{shares.toFixed(2)}</span>} />
              <ReceiptRow k={`Max. payout if ${side}`} v={<span>${potential.toFixed(2)}</span>} />
              <ReceiptRow
                k="Implied return"
                v={
                  <span className={roi > 0 ? "text-pl-pos" : "text-ink-3"}>+{roi.toFixed(1)}%</span>
                }
              />
              <ReceiptRow k="Fees" v={<span>$0.00</span>} />
              <ReceiptRow k="Settlement" v={<span>{endsLabel}</span>} last />
            </div>

            <motion.button
              type="button"
              onClick={handleBuy}
              disabled={!canBet}
              animate={isAllIn && canBet ? { scale: [1, 1.015, 1] } : { scale: 1 }}
              transition={
                isAllIn
                  ? {
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }
                  : { duration: 0.15 }
              }
              className={`tracking-stamp text-paper w-full border-0 py-4 font-mono text-[12px] font-semibold uppercase ${
                canBet ? "bg-ink cursor-pointer" : "bg-ink-4 cursor-not-allowed"
              }`}
            >
              {amount > balance
                ? "Insufficient principal"
                : `Submit ${side} order · $${amount.toFixed(2)}`}
            </motion.button>

            <div className="text-ink-3 mt-[10px] font-sans text-[10px] leading-[1.5]">
              By submitting, participant attests to understanding of the resolution methodology and
              represents that principal is uncommitted elsewhere. Positions are non-transferable.
            </div>
          </>
        )}
      </div>

      {position && (
        <div className="border-ink bg-paper-2 text-ink-3 flex justify-between border-t px-[14px] py-[10px] font-mono text-[10px] tracking-[0.1em]">
          <span>OPEN INTEREST</span>
          <span>{fmtUSDShort(market.volume)}</span>
        </div>
      )}
    </div>
  );
}
