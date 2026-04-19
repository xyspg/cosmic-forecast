"use client";

import { motion } from "motion/react";
import type { BureauMarket } from "@/lib/market-metadata";
import type { Position, Resolution } from "@/lib/store";

function CiteRow({
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
        padding: "7px 12px",
        borderBottom: last ? "none" : "1px dotted var(--rule)",
        fontFamily: "var(--ff-mono)",
        fontSize: 11,
      }}
    >
      <span
        style={{
          color: "var(--ink-3)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {k}
      </span>
      <span style={{ color: "var(--ink)" }}>{v}</span>
    </div>
  );
}

function AttestCol({
  k,
  v,
  accent,
}: {
  k: string;
  v: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          color: "var(--bone-2)",
          fontSize: 9,
          letterSpacing: "0.2em",
        }}
      >
        {k}
      </div>
      <div
        style={{
          color: accent ? "var(--amber)" : "var(--bone)",
          marginTop: 2,
        }}
      >
        {v}
      </div>
    </div>
  );
}

function fmtUSD(n: number) {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CosmicReport({
  resolution,
  marketQuestion,
  market,
  position,
}: {
  resolution: Resolution;
  marketQuestion: string;
  market?: BureauMarket;
  position?: Position;
}) {
  const outcome = resolution.outcome;
  const won = position ? position.side === outcome : null;
  const side = position?.side;
  const amount = position?.amount ?? 0;
  const shares = position?.shares ?? 0;
  const finalPL = position ? (won ? shares - amount : -amount) : 0;

  const hashShort = (resolution.hash ?? "").slice(0, 64).padEnd(64, "0");
  const nibble = hashShort.slice(-1);
  const eventShort = resolution.nasaEventId || "FLR-0000";
  const classRef = "M2.1";
  const region = "AR3947";
  const refNum = market?.ref ?? "MKT-0000";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      style={{
        background: "var(--paper)",
        border: "1px solid var(--ink)",
        overflow: "hidden",
      }}
    >
      <div
        className="bureau-resolution-header"
        style={{
          background: "#000",
          color: "var(--bone)",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--ff-mono)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "var(--amber)" }}>◈</span>
          <span style={{ fontSize: 10, letterSpacing: "0.28em" }}>
            COSMIC FORECAST · SETTLEMENT DIVISION
          </span>
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--bone-2)",
          }}
        >
          OFFICIAL RECORD OF RESOLUTION · N° {refNum}
        </div>
      </div>

      <div
        className="bureau-resolution-body-wrap"
        style={{ padding: "32px 32px 40px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingBottom: 14,
            borderBottom: "3px double var(--ink)",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              className="bureau-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                color: "var(--ink-3)",
                textTransform: "uppercase",
              }}
            >
              For immediate release
            </div>
            <div
              className="bureau-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              {new Date(resolution.timestamp)
                .toUTCString()
                .replace("GMT", "UTC")}
            </div>
          </div>
          <div
            className="bureau-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--ink-3)",
              textAlign: "right",
              textTransform: "uppercase",
            }}
          >
            <div>Filing reference</div>
            <div style={{ color: "var(--ink)" }}>
              RES-{new Date(resolution.timestamp).toISOString().slice(0, 10)}-
              {refNum.slice(-4)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div
            className="bureau-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              color: "var(--ink-3)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            ARECIBO, P.R. — 19 APR.
          </div>
          <h1
            className="bureau-serif bureau-resolution-headline"
            style={{
              fontSize: "clamp(24px, 5.5vw, 40px)",
              letterSpacing: "-0.028em",
              lineHeight: 1.12,
              margin: 0,
              fontWeight: 500,
              textWrap: "balance",
            }}
          >
            Market resolves{" "}
            <span style={{ fontStyle: "italic" }}>{outcome.toLowerCase()}</span>{" "}
            following {classRef}-class solar event over active region {region}.
          </h1>
          <div
            className="bureau-serif bureau-resolution-summary"
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: "var(--ink-2)",
              marginTop: 18,
              lineHeight: 1.45,
            }}
          >
            Observational window collapsed by operator request; oracle
            attestation rendered at{" "}
            {new Date(resolution.timestamp).toISOString().slice(11, 19)} UTC.
          </div>
          <div
            className="bureau-mono"
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.1em",
              marginTop: 14,
            }}
          >
            By{" "}
            <span style={{ color: "var(--ink)" }}>SETTLEMENT BUREAU STAFF</span>{" "}
            · with DONKI observational support
          </div>
        </div>

        <div
          className="bureau-resolution-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: 32,
            marginTop: 28,
          }}
        >
          <div
            className="bureau-serif bureau-resolution-body"
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "var(--ink)",
            }}
          >
            <p style={{ margin: "0 0 14px" }}>
              <span
                className="bureau-resolution-dropcap"
                style={{
                  float: "left",
                  fontFamily: "var(--ff-serif)",
                  fontSize: 52,
                  lineHeight: 0.9,
                  paddingRight: 10,
                  paddingTop: 5,
                  fontWeight: 500,
                }}
              >
                T
              </span>
              he market referenced by instrument {refNum} —{" "}
              <em>{marketQuestion}</em> — has been formally resolved{" "}
              <b>{outcome}</b> by the Settlement Bureau following the attested
              observation of a {classRef}-class solar flare event over active
              region {region}.
            </p>
            <p style={{ margin: "0 0 14px" }}>{resolution.explanation}</p>
            <p style={{ margin: "0 0 14px" }}>
              The event, recorded in the NASA Space Weather Database Of
              Notifications, Knowledge, Information as {eventShort}, exhibited a
              peak flux of 2.1 × 10⁻⁵ W/m² over the 1–8 Å soft X-ray band. Per
              methodology revision 2.1, the SHA-256 digest of the event
              parameter string was computed, the terminal nibble of the
              resulting hash extracted, and the outcome mapped to the market
              according to the published resolution table.
            </p>
            <p style={{ margin: "0 0 14px" }}>
              The resolution proceeded without incident. No discretionary
              adjustment was applied. All open positions have been marked to
              terminal value; settlement proceeds will be available in
              participant accounts upon the next scheduled ledger flush.
            </p>
            <p
              style={{
                margin: 0,
                color: "var(--ink-3)",
                fontFamily: "var(--ff-serif)",
                fontStyle: "italic",
                fontSize: 13,
              }}
            >
              — END OF NOTICE —
            </p>
          </div>

          <div>
            <div
              style={{
                border: "2px solid var(--ink)",
                padding: "18px 16px",
                background: "var(--paper-2)",
                marginBottom: 18,
              }}
            >
              <div
                className="bureau-mono"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.28em",
                  color: "var(--ink-3)",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                ——— MARKET RESOLVED ———
              </div>
              <div
                className="bureau-serif"
                style={{
                  fontSize: 13,
                  textAlign: "center",
                  fontStyle: "italic",
                  lineHeight: 1.35,
                  marginBottom: 14,
                  textWrap: "balance",
                }}
              >
                {marketQuestion}
              </div>
              <div
                className="bureau-mono"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "var(--ink-3)",
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                FINAL DETERMINATION
              </div>
              <div
                className="bureau-serif bureau-resolution-outcome"
                style={{
                  fontSize: "clamp(40px, 9vw, 52px)",
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                  lineHeight: 1,
                  color: "var(--ink)",
                  fontWeight: 500,
                }}
              >
                {outcome}
              </div>
              <div
                className="bureau-mono"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "var(--ink-3)",
                  textAlign: "center",
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid var(--rule)",
                }}
              >
                RESOLVED{" "}
                {new Date(resolution.timestamp).toUTCString().slice(5, 22)} UTC
              </div>
            </div>

            <div style={{ border: "1px solid var(--ink)" }}>
              <div
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid var(--ink)",
                  background: "var(--paper-2)",
                }}
              >
                <div
                  className="bureau-mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Cited observational data
                </div>
              </div>
              <CiteRow k="Primary event" v={`${classRef} · ${region}`} />
              <CiteRow k="Peak flux" v="2.1×10⁻⁵ W/m²" />
              <CiteRow k="Onset (UTC)" v="14:22:11" />
              <CiteRow k="Peak (UTC)" v="14:31:04" />
              <CiteRow k="Decay (UTC)" v="14:38:22" />
              <CiteRow k="Position (helio.)" v="N08 W41" />
              <CiteRow k="Radio burst" v="Type II (Culgoora)" />
              <CiteRow
                k="Instrument"
                v={resolution.nasaEventType || "GOES-19 XRS-B"}
                last
              />
            </div>

            {position && (
              <div style={{ marginTop: 18, border: "1px solid var(--ink)" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderBottom: "1px solid var(--ink)",
                    background: "var(--paper-2)",
                  }}
                >
                  <div
                    className="bureau-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Position settlement
                  </div>
                </div>
                <CiteRow k="Declared side" v={side ?? "—"} />
                <CiteRow k="Shares" v={shares.toFixed(2)} />
                <CiteRow
                  k="Entry (avg.)"
                  v={`${Math.round((position.price || 0) * 100)}¢`}
                />
                <CiteRow k="Terminal value" v={`${won ? "100" : "0"}¢`} />
                <CiteRow k="Principal" v={fmtUSD(amount)} />
                <CiteRow
                  k="Return of principal"
                  v={won ? fmtUSD(shares) : "$0.00"}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderTop: "2px solid var(--ink)",
                    fontFamily: "var(--ff-mono)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      color: "var(--ink-3)",
                      textTransform: "uppercase",
                    }}
                  >
                    Net outcome
                  </span>
                  <span
                    className="bureau-num"
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: won ? "var(--pl-pos)" : "var(--pl-neg)",
                    }}
                  >
                    {won ? "+" : "−"}
                    {fmtUSD(Math.abs(finalPL))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: 32,
            padding: "20px 24px",
            background: "#000",
            color: "var(--bone)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingBottom: 12,
              borderBottom: "1px solid #2b2a26",
            }}
          >
            <div
              className="bureau-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                color: "var(--amber)",
              }}
            >
              ◈ CRYPTOGRAPHIC ATTESTATION
            </div>
            <div
              className="bureau-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--bone-2)",
              }}
            >
              SHA-256 · PROTOCOL v2.1 · CONFIDENCE {resolution.confidence}%
            </div>
          </div>
          <div
            className="bureau-mono"
            style={{
              fontSize: 11,
              wordBreak: "break-all",
              marginTop: 12,
              color: "var(--bone)",
              letterSpacing: "0.04em",
              lineHeight: 1.7,
            }}
          >
            {hashShort}
          </div>
          <div
            className="bureau-attest-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
              marginTop: 14,
              fontFamily: "var(--ff-mono)",
              fontSize: 10,
            }}
          >
            <AttestCol k="EVENT ID" v={eventShort} />
            <AttestCol k="NIBBLE" v={`0x${nibble}`} />
            <AttestCol k="OUTCOME MAP" v={`→ ${outcome}`} accent />
            <AttestCol k="OBSERVER" v="BPM · SETTLE" />
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: "var(--ff-mono)",
              fontSize: 9,
              lineHeight: 1.7,
              color: "var(--bone-2)",
              letterSpacing: "0.04em",
            }}
          >
            This attestation is published to the public archive in perpetuity.
            Verification instructions are provided in the Oracle Specification,
            § 4.2. Any discrepancy between the published digest and
            independently computed value should be reported to the Bureau within
            72 hours of publication.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
