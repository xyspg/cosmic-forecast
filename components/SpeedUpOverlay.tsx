"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { BureauMarket } from "@/lib/market-metadata";

function CornerStamp({
  pos,
  children,
}: {
  pos: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bureau-corner-stamp"
      style={{
        position: "absolute",
        ...pos,
        fontSize: 9,
        letterSpacing: "0.22em",
        color: "var(--bone-2)",
        textTransform: "uppercase",
        fontFamily: "var(--ff-mono)",
      }}
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
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: last ? "none" : "1px solid rgba(232,228,216,0.12)",
        fontSize: 11,
        letterSpacing: "0.06em",
      }}
    >
      <span
        style={{
          color: "var(--bone-2)",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontSize: 10,
        }}
      >
        {k}
      </span>
      <span
        style={{
          color: highlight ? "var(--amber)" : "var(--bone)",
          fontWeight: highlight ? 600 : 400,
        }}
      >
        {v}
      </span>
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

  const price =
    market && side ? (side === "YES" ? market.yesPrice : market.noPrice) : 0;
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
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(6px) saturate(0.6)",
            WebkitBackdropFilter: "blur(6px) saturate(0.6)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            fontFamily: "var(--ff-mono)",
            overflowY: "auto",
            padding: "40px 20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                borderTop: "1px dashed rgba(184,132,42,0.35)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                borderLeft: "1px dashed rgba(184,132,42,0.35)",
              }}
            />
          </div>

          <CornerStamp pos={{ top: 24, left: 24 }}>
            BUREAU OF PREDICTION MARKETS · SETTLEMENT DIVISION
          </CornerStamp>
          <CornerStamp pos={{ top: 24, right: 24 }}>
            SESSION 0x9F4C8A21 · PROTOCOL v2.1
          </CornerStamp>
          <CornerStamp pos={{ bottom: 24, left: 24 }}>
            {market ? `α ${market.ra} · δ ${market.dec}` : "α — · δ —"}
          </CornerStamp>
          <CornerStamp pos={{ bottom: 24, right: 24 }}>
            T+{String(elapsed).padStart(3, "0")}s · AWAITING OPERATOR INPUT
          </CornerStamp>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
            style={{
              position: "relative",
              maxWidth: 720,
              width: "92%",
              color: "var(--bone)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 10,
                borderBottom: "1px solid rgba(232,228,216,0.22)",
                fontSize: 10,
                letterSpacing: "0.24em",
                color: "var(--amber)",
              }}
            >
              <span>◈ ORDER ACCEPTED — AWAITING SETTLEMENT WINDOW</span>
              <span style={{ color: "var(--bone-2)" }}>
                {market ? `REF ${market.ref}` : "REF —"} / ORD-
                {String(tick).padStart(6, "0").slice(-6)}
              </span>
            </div>

            <div style={{ padding: "18px 0 14px", textAlign: "center" }}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.24em",
                  color: "var(--bone-2)",
                  marginBottom: 12,
                }}
              >
                — IN THE MATTER OF —
              </div>
              <div
                className="bureau-serif bureau-speedup-headline"
                style={{
                  fontSize: 22,
                  letterSpacing: "-0.015em",
                  color: "var(--bone)",
                  lineHeight: 1.25,
                  fontWeight: 400,
                  textWrap: "balance",
                  maxWidth: 580,
                  margin: "0 auto",
                }}
              >
                {market?.question ?? "—"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.24em",
                  color: "var(--bone-2)",
                  marginTop: 14,
                }}
              >
                — POSITION OF RECORD —
              </div>
            </div>

            <div style={{ border: "1px solid rgba(232,228,216,0.25)" }}>
              <LedgerRow k="Declarant" v="ACCT-0042188-NYU" />
              <LedgerRow k="Declared side" v={side ?? "—"} highlight />
              <LedgerRow
                k="Principal committed"
                v={`USD ${(amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
              <LedgerRow k="Shares" v={shares.toFixed(2)} />
              <LedgerRow
                k="Maximum recoverable"
                v={`USD ${payout.toFixed(2)}`}
              />
              <LedgerRow k="Oracle method" v="SHA-256 ⟂ DONKI FLR" />
              <LedgerRow
                k="Scheduled settlement"
                v={market?.endsLabel.toUpperCase() ?? "—"}
                last
              />
            </div>

            <div
              style={{
                marginTop: 22,
                padding: "14px 16px",
                borderLeft: "2px solid var(--amber)",
                fontFamily: "var(--ff-serif)",
                fontSize: 14,
                fontStyle: "italic",
                color: "var(--bone)",
                lineHeight: 1.55,
              }}
            >
              The outcome awaits the next qualifying solar event. The Bureau
              makes available a discretionary acceleration, under which the
              settlement window is collapsed to the present instant. Operators
              may elect to wait, or to proceed.
            </div>

            <div
              className="bureau-speedup-btns"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.8fr",
                gap: 12,
                marginTop: 22,
              }}
            >
              <button
                type="button"
                onClick={onDismiss}
                disabled={!onDismiss}
                style={{
                  padding: "16px 14px",
                  background: "transparent",
                  color: "var(--bone-2)",
                  border: "1px solid rgba(232,228,216,0.35)",
                  cursor: onDismiss ? "pointer" : "default",
                  fontFamily: "var(--ff-mono)",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Await scheduled settlement</span>
                <span>{market ? `${market.daysLeft}d` : "—"}</span>
              </button>
              <button
                type="button"
                onClick={onSpeedUp}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--amber)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#000";
                }}
                style={{
                  padding: "16px 18px",
                  background: "#000",
                  color: "var(--amber)",
                  border: "1px solid var(--amber)",
                  cursor: "pointer",
                  fontFamily: "var(--ff-mono)",
                  fontSize: 11,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  transition: "background 220ms ease, color 220ms ease",
                  position: "relative",
                }}
              >
                <span>◈ Speed up time</span>
                <span style={{ color: "var(--amber)" }}>⟶</span>
                <span
                  style={{
                    position: "absolute",
                    inset: -1,
                    border: "1px solid var(--amber)",
                    animation: "bureau-pulse-border 2.4s ease-in-out infinite",
                    pointerEvents: "none",
                  }}
                />
              </button>
            </div>

            <div
              style={{
                marginTop: 20,
                paddingTop: 14,
                borderTop: "1px solid rgba(232,228,216,0.15)",
                fontSize: 9,
                letterSpacing: "0.12em",
                color: "var(--bone-2)",
                lineHeight: 1.7,
                textAlign: "center",
              }}
            >
              ACCELERATION IS IRREVERSIBLE. THE SETTLEMENT DIGEST IS PUBLISHED
              TO THE PUBLIC ARCHIVE UPON ATTESTATION.
              <br />
              NO REPRESENTATION IS MADE REGARDING THE AUSPICIOUSNESS OF THE
              CURRENT OBSERVATIONAL WINDOW.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
