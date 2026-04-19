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
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
        borderBottom: last ? "none" : "1px dotted var(--rule)",
        fontFamily: "var(--ff-mono)",
        fontSize: 11,
      }}
    >
      <span style={{ color: "var(--ink-3)" }}>{k}</span>
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
    <div style={{ border: "1px solid var(--ink)", background: "var(--paper)" }}>
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--ink)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          background: "var(--paper-2)",
        }}
      >
        <div
          className="bureau-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {position ? "Position on file" : "Order ticket"}
        </div>
        <div
          className="bureau-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--ink-3)",
          }}
        >
          FORM PM-4
        </div>
      </div>

      <div style={{ padding: 14 }}>
        {position ? (
          <>
            <div
              style={{
                borderBottom: "1px solid var(--ink)",
                paddingBottom: 10,
                marginBottom: 12,
              }}
            >
              <div className="bureau-eyebrow" style={{ marginBottom: 4 }}>
                Side of record
              </div>
              <div
                className="bureau-serif"
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  color:
                    position.side === "YES" ? "var(--ink)" : "var(--ink-3)",
                }}
              >
                {position.side}{" "}
                <span style={{ fontSize: 18, color: "var(--ink-3)" }}>
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
                      style={{
                        color:
                          position.side === resolution.outcome
                            ? "var(--pl-pos)"
                            : "var(--pl-neg)",
                      }}
                    >
                      {resolution.outcome}
                    </span>
                  }
                />
                <ReceiptRow
                  k="Realized P&L"
                  v={
                    <span
                      style={{
                        color: pnl >= 0 ? "var(--pl-pos)" : "var(--pl-neg)",
                        fontWeight: 600,
                      }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--amber)";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#000";
                  e.currentTarget.style.color = "var(--amber)";
                }}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "14px 0",
                  background: "#000",
                  color: "var(--amber)",
                  border: "1px solid var(--amber)",
                  cursor: "pointer",
                  fontFamily: "var(--ff-mono)",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  transition: "background 220ms ease, color 220ms ease",
                }}
              >
                ◈ Speed up settlement
              </button>
            )}

            {resolution && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 14,
                    padding: "10px 12px",
                    border: "1px solid var(--ink)",
                    background:
                      position.side === resolution.outcome
                        ? "var(--pl-pos-bg)"
                        : "var(--pl-neg-bg)",
                    fontFamily: "var(--ff-mono)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textAlign: "center",
                    color:
                      position.side === resolution.outcome
                        ? "var(--pl-pos)"
                        : "var(--pl-neg)",
                    fontWeight: 600,
                  }}
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0,
                border: "1px solid var(--ink)",
                marginBottom: 14,
              }}
            >
              {(["YES", "NO"] as const).map((s) => {
                const active = side === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    style={{
                      padding: "14px 10px",
                      border: 0,
                      cursor: "pointer",
                      borderRight: s === "YES" ? "1px solid var(--ink)" : 0,
                      background: active ? "var(--ink)" : "var(--paper)",
                      color: active ? "var(--paper)" : "var(--ink)",
                      fontFamily: "var(--ff-mono)",
                      letterSpacing: "0.14em",
                      fontSize: 11,
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{s}</span>
                    <span
                      className="bureau-num"
                      style={{ fontSize: 15, fontWeight: 500 }}
                    >
                      {s === "YES" ? yesCent : noCent}¢
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="bureau-eyebrow" style={{ marginBottom: 6 }}>
              Principal · USD
            </div>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <span
                className="bureau-mono"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--ink-3)",
                }}
              >
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
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 24px",
                  border: "1px solid var(--rule)",
                  background: "var(--paper)",
                  fontFamily: "var(--ff-mono)",
                  fontSize: 18,
                  color: "var(--ink)",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 4,
                marginBottom: 8,
              }}
            >
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
                    style={{
                      padding: "8px 0",
                      border: "1px solid var(--rule)",
                      cursor: "pointer",
                      background: active ? "var(--ink)" : "var(--paper)",
                      color: active ? "var(--paper)" : "var(--ink-2)",
                      fontFamily: "var(--ff-mono)",
                      fontSize: 11,
                      letterSpacing: "0.08em",
                    }}
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
              style={{
                width: "100%",
                padding: "8px 0",
                border: "1px dashed var(--ink)",
                background: isAllIn ? "var(--ink)" : "var(--paper-2)",
                color: isAllIn ? "var(--paper)" : "var(--ink)",
                fontFamily: "var(--ff-mono)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                marginBottom: 14,
              }}
            >
              {isAllIn
                ? `ALL IN · $${Math.floor(balance)}`
                : `Maximum principal · $${balance.toFixed(2)}`}
            </button>

            <div
              style={{
                borderTop: "1px solid var(--ink)",
                borderBottom: "1px solid var(--ink)",
                padding: "10px 0",
                marginBottom: 14,
              }}
            >
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
                    style={{
                      color: roi > 0 ? "var(--pl-pos)" : "var(--ink-3)",
                    }}
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
              style={{
                width: "100%",
                padding: "16px 0",
                background: canBet ? "var(--ink)" : "var(--ink-4)",
                color: "var(--paper)",
                border: 0,
                cursor: canBet ? "pointer" : "not-allowed",
                fontFamily: "var(--ff-mono)",
                fontSize: 12,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {amount > balance
                ? "Insufficient principal"
                : `Submit ${side} order · $${amount.toFixed(2)}`}
            </motion.button>

            <div
              style={{
                fontFamily: "var(--ff-sans)",
                fontSize: 10,
                color: "var(--ink-3)",
                lineHeight: 1.5,
                marginTop: 10,
              }}
            >
              By submitting, participant attests to understanding of the
              resolution methodology and represents that principal is
              uncommitted elsewhere. Positions are non-transferable.
            </div>
          </>
        )}
      </div>

      {position && (
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid var(--ink)",
            background: "var(--paper-2)",
            fontFamily: "var(--ff-mono)",
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--ink-3)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>OPEN INTEREST</span>
          <span>{fmtUSDShort(market.volume)}</span>
        </div>
      )}
    </div>
  );
}
