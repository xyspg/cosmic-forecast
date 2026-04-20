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
      className={`flex justify-between px-3 py-[7px] font-mono text-[11px] ${last ? "" : "border-b border-dotted border-rule"}`}
    >
      <span className="text-[10px] uppercase tracking-wire text-ink-3">
        {k}
      </span>
      <span className="text-ink">{v}</span>
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
      <div className="text-[9px] tracking-stamp text-bone-2">{k}</div>
      <div className={`mt-[2px] ${accent ? "text-amber" : "text-bone"}`}>
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
      className="overflow-hidden border border-ink bg-paper"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-black px-6 py-[14px] font-mono text-bone max-sm:px-4 max-sm:py-3">
        <div className="flex items-center gap-[14px]">
          <span className="text-amber">◈</span>
          <span className="text-[10px] tracking-mark">
            COSMIC FORECAST · SETTLEMENT DIVISION
          </span>
        </div>
        <div className="text-[10px] tracking-eyebrow text-bone-2">
          OFFICIAL RECORD OF RESOLUTION · N° {refNum}
        </div>
      </div>

      <div className="px-8 pb-10 pt-8 max-sm:px-[18px] max-sm:pb-7 max-sm:pt-[22px]">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-[3px] border-double border-ink pb-[14px]">
          <div>
            <div className="bureau-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
              For immediate release
            </div>
            <div className="bureau-mono mt-[2px] text-[10px] uppercase tracking-eyebrow text-ink-3">
              {new Date(resolution.timestamp)
                .toUTCString()
                .replace("GMT", "UTC")}
            </div>
          </div>
          <div className="bureau-mono text-right text-[10px] uppercase tracking-eyebrow text-ink-3">
            <div>Filing reference</div>
            <div className="text-ink">
              RES-{new Date(resolution.timestamp).toISOString().slice(0, 10)}-
              {refNum.slice(-4)}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bureau-mono mb-3 text-[11px] uppercase tracking-[0.22em] text-ink-3">
            ARECIBO, P.R. — 19 APR.
          </div>
          <h1 className="bureau-serif m-0 text-balance text-[clamp(24px,5.5vw,40px)] font-medium leading-[1.12] tracking-[-0.028em] max-sm:break-words max-sm:text-[28px]">
            Market resolves <span className="italic">{outcome.toLowerCase()}</span>{" "}
            following {classRef}-class solar event over active region {region}.
          </h1>
          <div className="bureau-serif mt-[18px] text-[18px] italic leading-[1.45] text-ink-2 max-sm:text-[15px]">
            Observational window collapsed by operator request; oracle
            attestation rendered at{" "}
            {new Date(resolution.timestamp).toISOString().slice(11, 19)} UTC.
          </div>
          <div className="bureau-mono mt-[14px] text-[11px] tracking-[0.1em] text-ink-3">
            By <span className="text-ink">SETTLEMENT BUREAU STAFF</span> · with
            DONKI observational support
          </div>
        </div>

        <div className="mt-7 grid grid-cols-[1.7fr_1fr] gap-8 max-[960px]:grid-cols-1 max-[960px]:gap-[22px]">
          <div className="bureau-serif text-[15px] leading-[1.7] text-ink max-sm:text-[14px]">
            <p className="mb-[14px]">
              <span className="float-left pr-[10px] pt-[5px] font-serif text-[52px] font-medium leading-[0.9] max-sm:text-[36px]">
                T
              </span>
              he market referenced by instrument {refNum} —{" "}
              <em>{marketQuestion}</em> — has been formally resolved{" "}
              <b>{outcome}</b> by the Settlement Bureau following the attested
              observation of a {classRef}-class solar flare event over active
              region {region}.
            </p>
            <p className="mb-[14px]">{resolution.explanation}</p>
            <p className="mb-[14px]">
              The event, recorded in the NASA Space Weather Database Of
              Notifications, Knowledge, Information as {eventShort}, exhibited a
              peak flux of 2.1 × 10⁻⁵ W/m² over the 1–8 Å soft X-ray band. Per
              methodology revision 2.1, the event&apos;s observational
              parameters were mapped to outcome against the published resolution
              table, and the determination attested to the Bureau ledger.
            </p>
            <p className="mb-[14px]">
              The resolution proceeded without incident. No discretionary
              adjustment was applied. All open positions have been marked to
              terminal value; settlement proceeds will be available in
              participant accounts upon the next scheduled ledger flush.
            </p>
            <p className="m-0 font-serif text-[13px] italic text-ink-3">
              — END OF NOTICE —
            </p>
          </div>

          <div>
            <div className="mb-[18px] border-2 border-ink bg-paper-2 px-4 py-[18px]">
              <div className="bureau-mono mb-[10px] text-center text-[9px] tracking-mark text-ink-3">
                ——— MARKET RESOLVED ———
              </div>
              <div className="bureau-serif mb-[14px] text-balance text-center text-[13px] italic leading-[1.35]">
                {marketQuestion}
              </div>
              <div className="bureau-mono mb-[6px] text-center text-[9px] tracking-stamp text-ink-3">
                FINAL DETERMINATION
              </div>
              <div className="bureau-serif text-center text-[clamp(40px,9vw,52px)] font-medium leading-none tracking-[-0.02em] text-ink max-sm:text-[40px]">
                {outcome}
              </div>
              <div className="bureau-mono mt-[14px] border-t border-rule pt-3 text-center text-[9px] tracking-stamp text-ink-3">
                RESOLVED{" "}
                {new Date(resolution.timestamp).toUTCString().slice(5, 22)} UTC
              </div>
            </div>

            <div className="border border-ink">
              <div className="border-b border-ink bg-paper-2 px-3 py-2">
                <div className="bureau-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
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
              <div className="mt-[18px] border border-ink">
                <div className="border-b border-ink bg-paper-2 px-3 py-2">
                  <div className="bureau-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
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
                <div className="flex justify-between border-t-2 border-ink px-3 py-[10px] font-mono">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-ink-3">
                    Net outcome
                  </span>
                  <span
                    className={`bureau-num text-[16px] font-semibold ${won ? "text-pl-pos" : "text-pl-neg"}`}
                  >
                    {won ? "+" : "−"}
                    {fmtUSD(Math.abs(finalPL))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-black px-6 py-5 text-bone">
          <div className="flex items-baseline justify-between border-b border-[#2b2a26] pb-3">
            <div className="bureau-mono text-[10px] tracking-[0.22em] text-amber">
              ◈ CRYPTOGRAPHIC ATTESTATION
            </div>
            <div className="bureau-mono text-[10px] tracking-eyebrow text-bone-2">
              SHA-256 · PROTOCOL v2.1 · CONFIDENCE {resolution.confidence}%
            </div>
          </div>
          <div className="bureau-mono mt-3 break-all text-[11px] leading-[1.7] tracking-[0.04em] text-bone">
            {hashShort}
          </div>
          <div className="mt-[14px] grid grid-cols-4 gap-[14px] font-mono text-[10px] max-sm:grid-cols-1">
            <AttestCol k="EVENT ID" v={eventShort} />
            <AttestCol k="NIBBLE" v={`0x${nibble}`} />
            <AttestCol k="OUTCOME MAP" v={`→ ${outcome}`} accent />
            <AttestCol k="OBSERVER" v="BPM · SETTLE" />
          </div>
          <div className="mt-[14px] font-mono text-[9px] leading-[1.7] tracking-[0.04em] text-bone-2">
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
