import { motion } from "motion/react";

import type { BureauMarket } from "@/lib/market-metadata";
import type { Position, Resolution } from "@/lib/store";
import type { CosmicEventSnapshot } from "@/lib/types";

function CiteRow({ k, v, last }: { k: string; v: React.ReactNode; last?: boolean }) {
  return (
    <div
      className={`flex justify-between px-3 py-[7px] font-mono text-[11px] ${last ? "" : "border-rule border-b border-dotted"}`}
    >
      <span className="tracking-wire text-ink-3 text-[10px] uppercase">{k}</span>
      <span className="text-ink">{v}</span>
    </div>
  );
}

function AttestCol({ k, v, accent }: { k: string; v: React.ReactNode; accent?: boolean }) {
  return (
    <div>
      <div className="tracking-stamp text-bone-2 text-[9px]">{k}</div>
      <div className={`mt-[2px] ${accent ? "text-amber" : "text-bone"}`}>{v}</div>
    </div>
  );
}

function fmtUSD(n: number) {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function utcTime(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function peakFluxFromClass(classType?: string): string | undefined {
  if (!classType) return undefined;
  const m = classType.trim().match(/^([ABCMX])\s*([\d.]+)?/i);
  if (!m) return undefined;
  const letter = m[1].toUpperCase();
  const coef = m[2] ? Number.parseFloat(m[2]) : 1;
  const exp: Record<string, number> = {
    A: -8,
    B: -7,
    C: -6,
    M: -5,
    X: -4,
  };
  const e = exp[letter];
  if (e === undefined || !Number.isFinite(coef)) return undefined;
  const sup = String(e)
    .replace("-", "⁻")
    .replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);
  return `${coef.toFixed(1)}×10${sup} W/m²`;
}

function gstSeverity(kp?: number): string | undefined {
  if (kp === undefined || kp === null) return undefined;
  if (kp >= 9) return "G5 (Extreme)";
  if (kp >= 8) return "G4 (Severe)";
  if (kp >= 7) return "G3 (Strong)";
  if (kp >= 6) return "G2 (Moderate)";
  if (kp >= 5) return "G1 (Minor)";
  return `Kp ${kp}`;
}

function regionLabel(ev?: CosmicEventSnapshot): string | undefined {
  if (!ev) return undefined;
  if (ev.activeRegionNum) return `AR${ev.activeRegionNum}`;
  if (ev.sourceLocation) return ev.sourceLocation;
  return undefined;
}

function headline(outcome: "YES" | "NO", ev?: CosmicEventSnapshot): React.ReactNode {
  const oc = (
    <>
      Market resolves <span className="italic">{outcome.toLowerCase()}</span>
    </>
  );
  if (!ev) {
    return <>{oc} following cosmic observational attestation.</>;
  }
  const region = regionLabel(ev);
  const regionClause = region ? ` over active region ${region}` : "";
  switch (ev.type) {
    case "Solar Flare": {
      const cls = ev.classType ? `${ev.classType}-class ` : "";
      return (
        <>
          {oc} following {cls}solar flare event{regionClause}.
        </>
      );
    }
    case "Coronal Mass Ejection": {
      const src = ev.sourceLocation ? ` from ${ev.sourceLocation}` : "";
      return (
        <>
          {oc} following coronal mass ejection{src}.
        </>
      );
    }
    case "Geomagnetic Storm": {
      const sev = gstSeverity(ev.kpIndex);
      return (
        <>
          {oc} following {sev ? `${sev} ` : ""}geomagnetic storm.
        </>
      );
    }
    case "Solar Energetic Particle":
      return <>{oc} following solar energetic particle event.</>;
    case "Interplanetary Shock":
      return (
        <>
          {oc} following interplanetary shock{regionClause}.
        </>
      );
    case "High Speed Stream":
      return <>{oc} following high-speed solar wind stream.</>;
    case "Radiation Belt Enhancement":
      return <>{oc} following radiation belt enhancement.</>;
    default:
      return <>{oc} following cosmic observational attestation.</>;
  }
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
  const refNum = market?.ref ?? "MKT-0000";

  const ev = resolution.nasaEvent;
  const eventLink = ev?.link;
  const classRef = ev?.classType;
  const region = regionLabel(ev);
  const onset = utcTime(ev?.date);
  const peak = utcTime(ev?.peakTime);
  const decay = utcTime(ev?.endTime);
  const heliocoords = ev?.sourceLocation || undefined;
  const instrument = ev?.instruments?.[0];
  const peakFlux = peakFluxFromClass(ev?.classType);
  const sev = gstSeverity(ev?.kpIndex);

  const primaryEvent =
    classRef && region
      ? `${classRef} · ${region}`
      : classRef
        ? classRef
        : region
          ? region
          : sev
            ? sev
            : ev?.type || resolution.nasaEventType || "—";

  const EventIdView = eventLink ? (
    <a
      href={eventLink}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-dotted underline-offset-[3px]"
    >
      {eventShort}
    </a>
  ) : (
    <span>{eventShort}</span>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="border-ink bg-paper overflow-hidden border"
    >
      <div className="text-bone flex flex-wrap items-center justify-between gap-2 bg-black px-6 py-[14px] font-mono max-sm:px-4 max-sm:py-3">
        <div className="flex items-center gap-[14px]">
          <span className="text-amber">◈</span>
          <span className="tracking-mark text-[10px]">COSMIC FORECAST · SETTLEMENT DIVISION</span>
        </div>
        <div className="tracking-eyebrow text-bone-2 text-[10px]">
          OFFICIAL RECORD OF RESOLUTION · N° {refNum}
        </div>
      </div>

      <div className="px-8 pt-8 pb-10 max-sm:px-[18px] max-sm:pt-[22px] max-sm:pb-7">
        <div className="border-ink flex flex-wrap items-baseline justify-between gap-3 border-b-[3px] border-double pb-[14px]">
          <div>
            <div className="bureau-mono text-ink-3 text-[10px] tracking-[0.22em] uppercase">
              For immediate release
            </div>
            <div className="bureau-mono tracking-eyebrow text-ink-3 mt-[2px] text-[10px] uppercase">
              {new Date(resolution.timestamp).toUTCString().replace("GMT", "UTC")}
            </div>
          </div>
          <div className="bureau-mono tracking-eyebrow text-ink-3 text-right text-[10px] uppercase">
            <div>Filing reference</div>
            <div className="text-ink">
              RES-{new Date(resolution.timestamp).toISOString().slice(0, 10)}-{refNum.slice(-4)}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bureau-mono text-ink-3 mb-3 text-[11px] tracking-[0.22em] uppercase">
            ARECIBO, P.R. — 19 APR.
          </div>
          <h1 className="bureau-serif m-0 text-[clamp(24px,5.5vw,40px)] leading-[1.12] font-medium tracking-[-0.028em] text-balance max-sm:text-[28px] max-sm:break-words">
            {headline(outcome, ev)}
          </h1>
          <div className="bureau-serif text-ink-2 mt-[18px] text-[18px] leading-[1.45] italic max-sm:text-[15px]">
            Observational window collapsed by operator request; oracle attestation rendered at{" "}
            {new Date(resolution.timestamp).toISOString().slice(11, 19)} UTC.
          </div>
          <div className="bureau-mono text-ink-3 mt-[14px] text-[11px] tracking-[0.1em]">
            By <span className="text-ink">SETTLEMENT BUREAU STAFF</span> · with DONKI observational
            support
          </div>
        </div>

        <div className="mt-7 grid grid-cols-[1.7fr_1fr] gap-8 max-[960px]:grid-cols-1 max-[960px]:gap-[22px]">
          <div className="bureau-serif text-ink text-[15px] leading-[1.7] max-sm:text-[14px]">
            <p className="mb-[14px]">
              <span className="float-left pt-[5px] pr-[10px] font-serif text-[52px] leading-[0.9] font-medium max-sm:text-[36px]">
                T
              </span>
              he market referenced by instrument {refNum} — <em>{marketQuestion}</em> — has been
              formally resolved <b>{outcome}</b> by the Settlement Bureau following the attested
              observation of a{" "}
              {classRef ? (
                <>
                  {classRef}-class {ev?.type.toLowerCase() ?? "solar"} event
                </>
              ) : (
                <>{(ev?.type ?? "cosmic").toLowerCase()} event</>
              )}
              {region ? (
                <>
                  {" "}
                  over active region <b>{region}</b>
                </>
              ) : null}
              .
            </p>
            <p className="mb-[14px]">{resolution.explanation}</p>
            <p className="mb-[14px]">
              The event, recorded in the NASA Space Weather Database Of Notifications, Knowledge,
              Information as {EventIdView}
              {peakFlux ? (
                <>, exhibited a peak flux of {peakFlux} over the 1–8 Å soft X-ray band</>
              ) : null}
              . Per methodology revision 2.1, the event&apos;s observational parameters were mapped
              to outcome against the published resolution table, and the determination attested to
              the Bureau ledger.
            </p>
            <p className="mb-[14px]">
              The resolution proceeded without incident. No discretionary adjustment was applied.
              All open positions have been marked to terminal value; settlement proceeds will be
              available in participant accounts upon the next scheduled ledger flush.
            </p>
            <p className="text-ink-3 m-0 font-serif text-[13px] italic">— END OF NOTICE —</p>
          </div>

          <div>
            <div className="border-ink bg-paper-2 mb-[18px] border-2 px-4 py-[18px]">
              <div className="bureau-mono tracking-mark text-ink-3 mb-[10px] text-center text-[9px]">
                ——— MARKET RESOLVED ———
              </div>
              <div className="bureau-serif mb-[14px] text-center text-[13px] leading-[1.35] text-balance italic">
                {marketQuestion}
              </div>
              <div className="bureau-mono tracking-stamp text-ink-3 mb-[6px] text-center text-[9px]">
                FINAL DETERMINATION
              </div>
              <div className="bureau-serif text-ink text-center text-[clamp(40px,9vw,52px)] leading-none font-medium tracking-[-0.02em] max-sm:text-[40px]">
                {outcome}
              </div>
              <div className="bureau-mono border-rule tracking-stamp text-ink-3 mt-[14px] border-t pt-3 text-center text-[9px]">
                RESOLVED {new Date(resolution.timestamp).toUTCString().slice(5, 22)} UTC
              </div>
            </div>

            <div className="border-ink border">
              <div className="border-ink bg-paper-2 border-b px-3 py-2">
                <div className="bureau-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Cited observational data
                </div>
              </div>
              <CiteRow k="Primary event" v={primaryEvent} />
              {peakFlux && <CiteRow k="Peak flux" v={peakFlux} />}
              {sev && <CiteRow k="Storm severity" v={sev} />}
              {ev?.kpIndex !== undefined && <CiteRow k="Kp (max)" v={ev.kpIndex.toFixed(1)} />}
              {onset && <CiteRow k="Onset (UTC)" v={onset} />}
              {peak && <CiteRow k="Peak (UTC)" v={peak} />}
              {decay && <CiteRow k="Decay (UTC)" v={decay} />}
              {heliocoords && <CiteRow k="Position (helio.)" v={heliocoords} />}
              <CiteRow
                k="Instrument"
                v={instrument || resolution.nasaEventType || "—"}
                last={!eventLink}
              />
              {eventLink && (
                <div className="flex justify-between px-3 py-[7px] font-mono text-[11px]">
                  <span className="tracking-wire text-ink-3 text-[10px] uppercase">
                    DONKI record
                  </span>
                  <a
                    href={eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink hover:text-amber underline decoration-dotted underline-offset-[3px]"
                  >
                    View on NASA DONKI ↗
                  </a>
                </div>
              )}
            </div>

            {position && (
              <div className="border-ink mt-[18px] border">
                <div className="border-ink bg-paper-2 border-b px-3 py-2">
                  <div className="bureau-mono text-[10px] font-semibold tracking-[0.18em] uppercase">
                    Position settlement
                  </div>
                </div>
                <CiteRow k="Declared side" v={side ?? "—"} />
                <CiteRow k="Shares" v={shares.toFixed(2)} />
                <CiteRow k="Entry (avg.)" v={`${Math.round((position.price || 0) * 100)}¢`} />
                <CiteRow k="Terminal value" v={`${won ? "100" : "0"}¢`} />
                <CiteRow k="Principal" v={fmtUSD(amount)} />
                <CiteRow k="Return of principal" v={won ? fmtUSD(shares) : "$0.00"} />
                <div className="border-ink flex justify-between border-t-2 px-3 py-[10px] font-mono">
                  <span className="text-ink-3 text-[10px] tracking-[0.18em] uppercase">
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

        <div className="text-bone mt-8 bg-black px-6 py-5">
          <div className="flex items-baseline justify-between border-b border-[#2b2a26] pb-3">
            <div className="bureau-mono text-amber text-[10px] tracking-[0.22em]">
              ◈ CRYPTOGRAPHIC ATTESTATION
            </div>
            <div className="bureau-mono tracking-eyebrow text-bone-2 text-[10px]">
              SHA-256 · PROTOCOL v2.1 · CONFIDENCE {resolution.confidence}%
            </div>
          </div>
          <div className="bureau-mono text-bone mt-3 text-[11px] leading-[1.7] tracking-[0.04em] break-all">
            {hashShort}
          </div>
          <div className="mt-[14px] grid grid-cols-4 gap-[14px] font-mono text-[10px] max-sm:grid-cols-1">
            <AttestCol k="EVENT ID" v={EventIdView} />
            <AttestCol k="NIBBLE" v={`0x${nibble}`} />
            <AttestCol k="OUTCOME MAP" v={`→ ${outcome}`} accent />
            <AttestCol k="OBSERVER" v="BPM · SETTLE" />
          </div>
          <div className="text-bone-2 mt-[14px] font-mono text-[9px] leading-[1.7] tracking-[0.04em]">
            This attestation is published to the public archive in perpetuity. Verification
            instructions are provided in the Oracle Specification, § 4.2. Any discrepancy between
            the published digest and independently computed value should be reported to the Bureau
            within 72 hours of publication.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
