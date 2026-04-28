import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import type { BureauMarket } from "@/lib/market-metadata";

function CornerStamp({
  positionClass,
  children,
}: {
  positionClass: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`tracking-stamp text-bone-2 absolute hidden font-mono text-[9px] uppercase md:block ${positionClass}`}
    >
      {children}
    </div>
  );
}

function LedgerRow({
  k,
  v,
  highlight,
  last,
}: {
  k: string;
  v: React.ReactNode;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex justify-between px-4 py-[10px] text-[11px] tracking-[0.06em] ${last ? "" : "border-b border-[rgba(232,228,216,0.12)]"}`}
    >
      <span className="tracking-eyebrow text-bone-2 text-[10px] uppercase">{k}</span>
      <span className={highlight ? "text-amber font-semibold" : "text-bone font-normal"}>{v}</span>
    </div>
  );
}

export function SpeedUpOverlay({
  visible,
  onSpeedUp,
  onDismiss,
  market,
  side,
  amount,
}: {
  visible: boolean;
  onSpeedUp: () => void;
  onDismiss?: () => void;
  market?: BureauMarket;
  side?: "YES" | "NO";
  amount?: number;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!visible) {
      setElapsed(0);
      setTick(0);
      return;
    }
    const iv1 = setInterval(() => setElapsed((e) => e + 1), 1000);
    const iv2 = setInterval(() => setTick((t) => t + 1), 180);
    return () => {
      clearInterval(iv1);
      clearInterval(iv2);
    };
  }, [visible]);

  const price = market && side ? (side === "YES" ? market.yesPrice : market.noPrice) : 0;
  const shares = price > 0 && amount ? amount / price : 0;
  const payout = shares;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-black/[0.82] px-5 py-10 font-mono"
          style={{
            backdropFilter: "blur(6px) saturate(0.6)",
            WebkitBackdropFilter: "blur(6px) saturate(0.6)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[rgba(184,132,42,0.35)]" />
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-[rgba(184,132,42,0.35)]" />
          </div>

          <CornerStamp positionClass="top-6 left-6">
            BUREAU OF PREDICTION MARKETS · SETTLEMENT DIVISION
          </CornerStamp>
          <CornerStamp positionClass="top-6 right-6">
            SESSION 0x9F4C8A21 · PROTOCOL v2.1
          </CornerStamp>
          <CornerStamp positionClass="bottom-6 left-6">
            {market ? `α ${market.ra} · δ ${market.dec}` : "α — · δ —"}
          </CornerStamp>
          <CornerStamp positionClass="bottom-6 right-6">
            T+{String(elapsed).padStart(3, "0")}s · AWAITING OPERATOR INPUT
          </CornerStamp>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="text-bone relative w-[92%] max-w-[720px]"
          >
            <div className="text-amber flex items-center justify-between border-b border-[rgba(232,228,216,0.22)] pb-[10px] text-[10px] tracking-[0.24em]">
              <span>◈ ORDER ACCEPTED — AWAITING SETTLEMENT WINDOW</span>
              <span className="text-bone-2">
                {market ? `REF ${market.ref}` : "REF —"} / ORD-
                {String(tick).padStart(6, "0").slice(-6)}
              </span>
            </div>

            <div className="px-0 pt-[18px] pb-[14px] text-center">
              <div className="text-bone-2 mb-3 text-[10px] tracking-[0.24em]">
                — IN THE MATTER OF —
              </div>
              <div className="bureau-serif text-bone mx-auto max-w-[580px] text-[22px] leading-[1.25] font-normal tracking-[-0.015em] text-balance max-sm:text-[18px]">
                {market?.question ?? "—"}
              </div>
              <div className="text-bone-2 mt-[14px] text-[10px] tracking-[0.24em]">
                — POSITION OF RECORD —
              </div>
            </div>

            <div className="border border-[rgba(232,228,216,0.25)]">
              <LedgerRow k="Declarant" v="ACCT-0042188-NYU" />
              <LedgerRow k="Declared side" v={side ?? "—"} highlight />
              <LedgerRow
                k="Principal committed"
                v={`USD ${(amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
              <LedgerRow k="Shares" v={shares.toFixed(2)} />
              <LedgerRow k="Maximum recoverable" v={`USD ${payout.toFixed(2)}`} />
              <LedgerRow k="Oracle method" v="SHA-256 ⟂ DONKI FLR" />
              <LedgerRow k="Scheduled settlement" v={market?.endsLabel.toUpperCase() ?? "—"} last />
            </div>

            <div className="border-amber text-bone mt-[22px] border-l-2 px-4 py-[14px] font-serif text-[14px] leading-[1.55] italic">
              The outcome awaits the next qualifying solar event. Under general relativity, time
              elapses unevenly between observers in different reference frames; the Bureau makes
              available a discretionary <span className="not-italic">time dilation</span>, under
              which the operator&rsquo;s local clock is advanced to the settlement instant while the
              market itself remains in its rest frame. Operators may elect to wait, or to proceed.
            </div>

            <div className="mt-[22px] grid grid-cols-[1fr_1.8fr] gap-3 max-sm:grid-cols-1 max-sm:gap-[10px]">
              <button
                type="button"
                onClick={onDismiss}
                disabled={!onDismiss}
                className={`tracking-stamp text-bone-2 flex justify-between border border-[rgba(232,228,216,0.35)] bg-transparent px-[14px] py-4 text-left font-mono text-[10px] uppercase ${onDismiss ? "cursor-pointer" : "cursor-default"}`}
              >
                <span>Await scheduled settlement</span>
                <span>{market ? `${market.daysLeft}d` : "—"}</span>
              </button>
              <button
                type="button"
                onClick={onSpeedUp}
                className="border-amber text-amber hover:bg-amber relative flex cursor-pointer justify-between border bg-black px-[18px] py-4 text-left font-mono text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-200 hover:text-black"
              >
                <span>◈ Engage time dilation</span>
                <span className="text-amber">⟶</span>
                <span
                  className="border-amber pointer-events-none absolute -inset-px border"
                  style={{
                    animation: "bureau-pulse-border 2.4s ease-in-out infinite",
                  }}
                />
              </button>
            </div>

            <div className="text-bone-2 mt-5 border-t border-[rgba(232,228,216,0.15)] pt-[14px] text-center text-[9px] leading-[1.7] tracking-[0.12em]">
              ACCELERATION IS IRREVERSIBLE. THE SETTLEMENT DIGEST IS PUBLISHED TO THE PUBLIC ARCHIVE
              UPON ATTESTATION.
              <br />
              NO REPRESENTATION IS MADE REGARDING THE AUSPICIOUSNESS OF THE CURRENT OBSERVATIONAL
              WINDOW.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
