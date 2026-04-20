"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BureauMarket } from "@/lib/market-metadata";

const DURATION = 5600;

function formatTC(ms: number): string {
  const total = Math.max(0, ms);
  const s = Math.floor(total / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  const msp = String(Math.floor(total) % 1000).padStart(3, "0");
  return `${mm}:${ss}.${msp}`;
}

type Phase = "acquire" | "observe" | "digest" | "attest" | "exit";

function phaseLabel(p: Phase): string {
  return (
    {
      acquire: "ACQUIRING",
      observe: "OBSERVING",
      digest: "DIGESTING",
      attest: "ATTESTING",
      exit: "FILED",
    } as const
  )[p];
}

function Corner({
  pos,
  children,
}: {
  pos: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className="hidden md:block"
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: "0.28em",
        color: "var(--bone-2)",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function ProgressBar({ p }: { p: number }) {
  return (
    <div
      style={{
        width: "min(220px, 38vw)",
        height: 3,
        background: "rgba(232,228,216,0.15)",
        margin: "10px auto 0",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--amber)",
          transform: `scaleX(${p})`,
          transformOrigin: "left",
          transition: "transform 60ms linear",
        }}
      />
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  border: "1px solid rgba(232,228,216,0.18)",
  padding: "10px 12px",
  background: "rgba(232,228,216,0.015)",
  minHeight: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

function PanelHead({ title, right }: { title: string; right: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingBottom: 8,
        borderBottom: "1px solid rgba(232,228,216,0.12)",
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "var(--bone)",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: 9,
          letterSpacing: "0.2em",
          color: "var(--amber)",
          textTransform: "uppercase",
        }}
      >
        {right}
      </span>
    </div>
  );
}

function FluxPanel({ t, className }: { t: number; className?: string }) {
  const W = 420;
  const H = 220;
  const padL = 38;
  const padR = 10;
  const padT = 14;
  const padB = 22;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const N = 200;

  const full = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let v = 0.12 + 0.03 * Math.sin(x * 23) + 0.02 * Math.sin(x * 61);
      v += 0.25 * x;
      const d = x - 0.68;
      v += 0.72 * Math.exp((-d * d) / 0.0045);
      if (x > 0.68) v += 0.08 * Math.exp(-(x - 0.68) * 14);
      arr.push(Math.max(0.02, Math.min(1, v)));
    }
    return arr;
  }, []);

  const filled = Math.floor(Math.min(1, t / 4200) * N);
  const pts = full
    .slice(0, filled)
    .map((v, i) => {
      const x = padL + (i / (N - 1)) * iw;
      const y = padT + (1 - v) * ih;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const headX = padL + ((filled - 1) / (N - 1)) * iw;
  const headY = padT + (1 - (full[Math.max(0, filled - 1)] || 0.1)) * ih;

  const bands = [
    { y: 0.25, cls: "X", color: "rgba(212,160,74,0.18)" },
    { y: 0.55, cls: "M", color: "rgba(212,160,74,0.10)" },
    { y: 0.78, cls: "C", color: "rgba(232,228,216,0.05)" },
  ];

  const peak = Math.max(...full.slice(0, filled || 1));

  return (
    <div className={className} style={panelStyle}>
      <PanelHead title="GOES-19 · XRS-B · 1–8 Å" right="W/m² · LIVE" />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", padding: "6px 0", flex: 1, minHeight: 0 }}
        role="presentation"
      >
        <title>Soft X-ray flux</title>
        {bands.map((b, i) => {
          const nextY = i < bands.length - 1 ? bands[i + 1].y : 1;
          return (
            <g key={b.cls}>
              <rect
                x={padL}
                y={padT + b.y * ih}
                width={iw}
                height={(nextY - b.y) * ih}
                fill={b.color}
              />
              <text
                x={padL - 6}
                y={padT + b.y * ih + 10}
                fill="var(--bone-2)"
                fontSize="9"
                letterSpacing="0.1em"
                textAnchor="end"
              >
                {b.cls}
              </text>
            </g>
          );
        })}
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={`grid-${g}`}
            x1={padL}
            y1={padT + g * ih}
            x2={padL + iw}
            y2={padT + g * ih}
            stroke="rgba(232,228,216,0.08)"
            strokeDasharray="2 3"
          />
        ))}
        <line
          x1={padL}
          y1={padT + ih}
          x2={padL + iw}
          y2={padT + ih}
          stroke="rgba(232,228,216,0.25)"
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={padT + ih}
          stroke="rgba(232,228,216,0.25)"
        />
        {pts && (
          <path d={pts} fill="none" stroke="var(--amber)" strokeWidth="1.5" />
        )}
        {filled > 0 && (
          <g>
            <circle
              cx={headX.toFixed(2)}
              cy={headY.toFixed(2)}
              r="3"
              fill="var(--amber)"
            />
            <circle
              cx={headX.toFixed(2)}
              cy={headY.toFixed(2)}
              r="6"
              fill="none"
              stroke="var(--amber)"
              opacity="0.5"
            >
              <animate
                attributeName="r"
                values="4;10;4"
                dur="1.2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.5;0;0.5"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}
        {["−60", "−45", "−30", "−15", "NOW"].map((label, i) => {
          const x = padL + (i / 4) * iw;
          return (
            <text
              key={label}
              x={x}
              y={H - 6}
              fill="var(--bone-2)"
              fontSize="9"
              letterSpacing="0.12em"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 4px",
          fontSize: 10,
          color: "var(--bone-2)",
          letterSpacing: "0.12em",
        }}
      >
        <span>PEAK {(peak * 2.9).toFixed(2)}×10⁻⁵</span>
        <span>WINDOW 60 SEC</span>
      </div>
    </div>
  );
}

function SolarDisk({ t, className }: { t: number; className?: string }) {
  const W = 280;
  const H = 280;
  const cx = W / 2;
  const cy = H / 2;
  const R = 104;
  const rot = (t / 1000) * 18;
  const arx =
    cx + R * Math.sin((41 * Math.PI) / 180) * Math.cos((8 * Math.PI) / 180);
  const ary = cy - R * Math.sin((8 * Math.PI) / 180);
  const acquired = t > 1050;
  const flared = t > 2800;

  return (
    <div className={className} style={panelStyle}>
      <PanelHead title="SOLAR DISK · 193 Å" right="AR3947" />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", flex: 1, minHeight: 0 }}
        role="presentation"
      >
        <title>Solar disk acquisition</title>
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="rgba(232,228,216,0.35)"
          strokeWidth="1"
        />
        <circle
          cx={cx}
          cy={cy}
          r={R - 10}
          fill="none"
          stroke="rgba(232,228,216,0.1)"
          strokeWidth="1"
          strokeDasharray="1 4"
        />
        <defs>
          <radialGradient id="sun-g" cx="0.4" cy="0.35">
            <stop offset="0%" stopColor="rgba(212,160,74,0.14)" />
            <stop offset="60%" stopColor="rgba(212,160,74,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R - 2} fill="url(#sun-g)" />
        <g stroke="rgba(232,228,216,0.12)" strokeWidth="0.6">
          {[-60, -30, 0, 30, 60].map((lat) => {
            const y = cy - R * Math.sin((lat * Math.PI) / 180);
            const w = R * Math.cos((lat * Math.PI) / 180);
            return (
              <line
                key={`lat-${lat}`}
                x1={(cx - w).toFixed(2)}
                y1={y.toFixed(2)}
                x2={(cx + w).toFixed(2)}
                y2={y.toFixed(2)}
              />
            );
          })}
          {[-60, -30, 0, 30, 60].map((lon) => {
            const x = cx + R * Math.sin((lon * Math.PI) / 180);
            return (
              <line
                key={`lon-${lon}`}
                x1={x.toFixed(2)}
                y1={cy - R * 0.9}
                x2={x.toFixed(2)}
                y2={cy + R * 0.9}
              />
            );
          })}
        </g>
        <g transform={`rotate(${rot.toFixed(2)} ${cx} ${cy})`}>
          {Array.from({ length: 48 }).map((_, i) => {
            const a = (i / 48) * Math.PI * 2;
            const x1 = (cx + Math.cos(a) * (R + 6)).toFixed(2);
            const y1 = (cy + Math.sin(a) * (R + 6)).toFixed(2);
            const len = i % 4 === 0 ? 8 : 3;
            const x2 = (cx + Math.cos(a) * (R + 6 + len)).toFixed(2);
            const y2 = (cy + Math.sin(a) * (R + 6 + len)).toFixed(2);
            return (
              <line
                // biome-ignore lint/suspicious/noArrayIndexKey: decorative tick marks, order never changes
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(232,228,216,0.4)"
                strokeWidth="0.6"
              />
            );
          })}
        </g>
        {acquired && (
          <g>
            <circle
              cx={arx.toFixed(2)}
              cy={ary.toFixed(2)}
              r={flared ? 9 : 5}
              fill={flared ? "var(--amber)" : "none"}
              stroke="var(--amber)"
              strokeWidth="1"
              style={{ transition: "r 260ms ease, fill 260ms ease" }}
            />
            <line
              x1={arx - 16}
              y1={ary}
              x2={arx - 10}
              y2={ary}
              stroke="var(--amber)"
              strokeWidth="1"
            />
            <line
              x1={arx + 10}
              y1={ary}
              x2={arx + 16}
              y2={ary}
              stroke="var(--amber)"
              strokeWidth="1"
            />
            <line
              x1={arx}
              y1={ary - 16}
              x2={arx}
              y2={ary - 10}
              stroke="var(--amber)"
              strokeWidth="1"
            />
            <line
              x1={arx}
              y1={ary + 10}
              x2={arx}
              y2={ary + 16}
              stroke="var(--amber)"
              strokeWidth="1"
            />
            <text
              x={arx + 20}
              y={ary + 4}
              fill="var(--amber)"
              fontSize="10"
              letterSpacing="0.12em"
            >
              AR3947
            </text>
            {flared && (
              <circle
                cx={arx.toFixed(2)}
                cy={ary.toFixed(2)}
                r="9"
                fill="none"
                stroke="var(--amber)"
                strokeWidth="1"
              >
                <animate
                  attributeName="r"
                  values="9;24;9"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.7;0;0.7"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        )}
        <line
          x1={cx}
          y1={10}
          x2={cx}
          y2={cy - R - 12}
          stroke="rgba(232,228,216,0.2)"
          strokeDasharray="2 3"
        />
        <line
          x1={cx}
          y1={cy + R + 12}
          x2={cx}
          y2={H - 10}
          stroke="rgba(232,228,216,0.2)"
          strokeDasharray="2 3"
        />
        <line
          x1={10}
          y1={cy}
          x2={cx - R - 12}
          y2={cy}
          stroke="rgba(232,228,216,0.2)"
          strokeDasharray="2 3"
        />
        <line
          x1={cx + R + 12}
          y1={cy}
          x2={W - 10}
          y2={cy}
          stroke="rgba(232,228,216,0.2)"
          strokeDasharray="2 3"
        />
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 4px",
          fontSize: 10,
          color: "var(--bone-2)",
          letterSpacing: "0.12em",
        }}
      >
        <span>HELIO N08 W41</span>
        <span>
          {acquired
            ? flared
              ? "EVENT CONFIRMED"
              : "TARGET ACQUIRED"
            : "SLEWING…"}
        </span>
      </div>
    </div>
  );
}

function EventLog({ t, className }: { t: number; className?: string }) {
  const entries: [number, string, string][] = [
    [70, "OPRQ", "Operator request received · collapse scheduled window"],
    [320, "AUTH", "Principal attested · ACCT-0042188-NYU"],
    [560, "SLEW", "Instrument slew to heliographic N08 W41 initiated"],
    [980, "LOCK", "GOES-19 XRS-B channel A locked · σ/n 48.2"],
    [1370, "AUX ", "SOHO LASCO C2 auxiliary stream engaged"],
    [1720, "OBS ", "Observation window opened"],
    [2170, "FLR ", "Rising edge detected · flux crossing M-class threshold"],
    [2590, "PEAK", "Peak flux 2.1×10⁻⁵ W/m² · event classified M2.1"],
    [2980, "DECAY", "Soft decay · tail consistent with impulsive class"],
    [3330, "LOG ", "Event parameter string committed to buffer"],
    [3750, "HASH", "Digest pipeline initialized · compression rounds begun"],
    [4520, "NIBB", "Terminal nibble extracted"],
    [4830, "MAP ", "Oracle table lookup · outcome filed to archive"],
    [5180, "FILE", "Attestation filed to public archive · RES-2026-04-19-0042"],
    [5400, "END ", "Settlement complete · returning operator to Bureau"],
  ];

  const visible = entries.filter(([time]) => t >= time);

  return (
    <div
      className={className}
      style={{
        ...panelStyle,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <PanelHead title="Settlement log · tty0" right="◉ STREAMING" />
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          fontSize: 11,
          lineHeight: 1.75,
          padding: "6px 0",
        }}
      >
        {visible.map(([time, tag, msg], i) => {
          const mmss = formatTC(time);
          const isLatest = i === visible.length - 1;
          const tagTrim = tag.trim();
          return (
            <div
              key={`log-${time}`}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 44px 1fr",
                gap: 8,
                color: isLatest ? "var(--bone)" : "rgba(232,228,216,0.55)",
                transition: "color 300ms ease",
              }}
            >
              <span style={{ color: "var(--bone-2)" }}>
                T+{mmss.slice(0, 8)}
              </span>
              <span
                style={{
                  color:
                    tagTrim === "FLR" || tagTrim === "PEAK" || tagTrim === "MAP"
                      ? "var(--amber)"
                      : "var(--bone-2)",
                }}
              >
                {tag}
              </span>
              <span>{msg}</span>
            </div>
          );
        })}
        <div
          style={{
            height: 14,
            display: "flex",
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 12,
              background: "var(--amber)",
              animation: "bureau-cursor-blink 0.7s steps(1) infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function DigestPanel({ t, fullHash }: { t: number; fullHash: string }) {
  const start = 3750;
  const end = 4520;
  const prog = Math.max(0, Math.min(1, (t - start) / (end - start)));
  const filled = Math.floor(prog * 64);
  const chars = Array.from({ length: 64 }, (_, i) => {
    if (i < filled) return fullHash[i];
    if (i === filled && filled < 64) {
      const s = "0123456789abcdef";
      return s[Math.floor(t / 60) % 16];
    }
    return "·";
  });
  const nibbleReady = t >= 4520;
  const mapReady = t >= 4830;

  return (
    <div
      style={{ ...panelStyle, padding: "12px 14px 14px" }}
      className="md:px-[18px] md:py-[14px]"
    >
      <div className="flex flex-col gap-1 border-b border-[rgba(232,228,216,0.15)] pb-2 md:flex-row md:items-baseline md:justify-between md:gap-4 md:pb-[10px]">
        <div className="flex flex-wrap items-baseline gap-2 md:gap-4">
          <span
            style={{
              color: "var(--amber)",
              fontSize: 10,
              letterSpacing: "0.28em",
            }}
          >
            ◈ SHA-256 DIGEST
          </span>
          <span
            style={{
              color: "var(--bone-2)",
              fontSize: 10,
              letterSpacing: "0.14em",
            }}
          >
            PROTOCOL v2.1 · ROUND {Math.min(64, filled)} / 64
          </span>
        </div>
        <span
          className="hidden md:inline"
          style={{
            color: "var(--bone-2)",
            fontSize: 10,
            letterSpacing: "0.14em",
          }}
        >
          INPUT · DONKI FLR 2026-04-19T14:38Z · AR3947 · M2.1
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-[2px] py-3 md:gap-[3px] md:py-4">
        {chars.slice(0, 62).map((c, i) => (
          <span
            key={`digest-${i}-${c}`}
            style={{
              fontSize: "clamp(10px, 2.6vw, 18px)",
              letterSpacing: "0.04em",
              textAlign: "center",
              color: c === "·" ? "rgba(232,228,216,0.28)" : "var(--bone)",
              fontFeatureSettings: '"tnum" 1',
              minWidth: "0.7em",
            }}
          >
            {c}
          </span>
        ))}
        <div
          style={{
            display: "inline-flex",
            gap: 2,
            padding: "4px 8px",
            marginLeft: 6,
            border: `1px solid ${nibbleReady ? "var(--amber)" : "rgba(232,228,216,0.18)"}`,
            transition: "border-color 300ms ease, background 300ms ease",
            background: nibbleReady ? "rgba(184,132,42,0.08)" : "transparent",
          }}
        >
          <span
            style={{
              fontSize: "clamp(12px, 2.6vw, 18px)",
              color:
                chars[62] === "·" ? "rgba(232,228,216,0.28)" : "var(--bone)",
            }}
          >
            {chars[62]}
          </span>
          <span
            style={{
              fontSize: "clamp(12px, 2.6vw, 18px)",
              color: nibbleReady
                ? "var(--amber)"
                : chars[63] === "·"
                  ? "rgba(232,228,216,0.28)"
                  : "var(--bone)",
              fontWeight: 600,
            }}
          >
            {chars[63]}
          </span>
        </div>
      </div>

      <div
        className="flex flex-col gap-2 border-t border-dashed border-[rgba(232,228,216,0.15)] pt-2 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-5 md:pt-3"
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          color: "var(--bone-2)",
        }}
      >
        <div className="text-left">
          TERMINAL NIBBLE{" "}
          <span
            style={{
              color: nibbleReady ? "var(--amber)" : "rgba(232,228,216,0.35)",
            }}
          >
            → {nibbleReady ? `0x${fullHash[63]}` : "0x·"}
          </span>
        </div>
        <div
          className="text-left md:text-center"
          style={{ color: mapReady ? "var(--amber)" : "var(--bone-2)" }}
        >
          {mapReady ? "ORACLE TABLE §4.2 ·" : "AWAITING DIGEST ·"}
        </div>
        <div className="text-left md:text-right">
          OUTCOME{" "}
          <span
            style={{
              color: mapReady ? "var(--amber)" : "rgba(232,228,216,0.35)",
              fontWeight: 600,
              letterSpacing: "0.2em",
            }}
          >
            {mapReady ? "→ FILED" : "→ ——"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function WarpAnimation({
  active,
  onComplete,
  market,
  apiReady = true,
}: {
  active: boolean;
  onComplete?: () => void;
  market?: BureauMarket;
  /** When false, progress halts at 90% until the API result lands. Defaults to true. */
  apiReady?: boolean;
}) {
  const [t, setT] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const doneRef = useRef(false);
  const apiReadyRef = useRef(apiReady);
  apiReadyRef.current = apiReady;

  const fullHash = useMemo(() => {
    const chars = "0123456789abcdef";
    let h = "";
    let s = Math.floor(Math.random() * 0xffffffff);
    for (let i = 0; i < 64; i++) {
      s = (s * 1664525 + 1013904223) >>> 0;
      h += chars[s & 0xf];
    }
    return h;
  }, []);

  useEffect(() => {
    if (!active) {
      setT(0);
      doneRef.current = false;
      return;
    }
    startRef.current = performance.now();
    doneRef.current = false;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - startRef.current;
      setT(elapsed);
      if (elapsed >= DURATION && apiReadyRef.current) {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete?.();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, onComplete]);

  const rawProgress = Math.min(1, t / DURATION);
  const progress = apiReady ? rawProgress : Math.min(0.9, rawProgress);
  const waiting = t >= DURATION && !apiReady;
  const tc = formatTC(Math.min(t, DURATION));
  const phase: Phase =
    t < 1225
      ? "acquire"
      : t < 3500
        ? "observe"
        : t < 4725
          ? "digest"
          : t < 5425
            ? "attest"
            : "exit";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            background: "#000",
            color: "var(--bone)",
            fontFamily: "var(--ff-mono)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(rgba(232,228,216,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(232,228,216,0.035) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
              pointerEvents: "none",
            }}
          />

          <Corner pos={{ top: 18, left: 24 }}>
            BUREAU OF PREDICTION MARKETS · SETTLEMENT DIVISION
          </Corner>
          <Corner pos={{ top: 18, right: 24 }}>
            {market ? `REF ${market.ref} · ` : ""}OBSERVATION SHEET N°
            RES-2026-04-19-0042
          </Corner>
          <Corner pos={{ bottom: 18, left: 24 }}>
            INSTRUMENT: GOES-19 XRS-B · SOHO LASCO C2 · DSN-14
          </Corner>
          <Corner pos={{ bottom: 18, right: 24 }}>
            SIGNAL OK · 1.412 MHz DOWNLINK · CHECKSUM GOOD
          </Corner>

          <div className="absolute inset-x-3 inset-y-4 flex min-w-0 flex-col gap-3 overflow-y-auto overflow-x-hidden md:inset-[60px_40px_50px_40px] md:gap-[14px] md:overflow-hidden">
            <div className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-3 border-b border-[rgba(232,228,216,0.22)] pb-3 md:grid-cols-[1fr_auto_1fr] md:gap-8 md:pb-[18px]">
              <div className="min-w-0">
                <Label>Mission elapsed</Label>
                <div
                  style={{
                    fontSize: "clamp(20px, 6.4vw, 48px)",
                    letterSpacing: "0.04em",
                    color: "var(--bone)",
                    fontWeight: 500,
                    lineHeight: 1,
                    marginTop: 6,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  T+{tc}
                </div>
              </div>
              <div className="min-w-0 text-right md:text-center">
                <Label>Phase</Label>
                <div
                  style={{
                    color: "var(--amber)",
                    fontSize: 12,
                    letterSpacing: "0.3em",
                    marginTop: 8,
                    animation: waiting
                      ? "bureau-cursor-blink 1.1s steps(1) infinite"
                      : undefined,
                  }}
                >
                  {waiting ? "AWAITING DOWNLINK" : phaseLabel(phase)}
                </div>
                <div className="mt-2 flex justify-end md:justify-center">
                  <ProgressBar p={progress} />
                </div>
              </div>
              <div className="hidden text-right md:block">
                <Label>Scheduled window</Label>
                <div
                  style={{
                    fontSize: 15,
                    letterSpacing: "0.1em",
                    color: "var(--bone)",
                    marginTop: 8,
                  }}
                >
                  COLLAPSED BY OPERATOR REQUEST
                </div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    color: "var(--bone-2)",
                    marginTop: 4,
                  }}
                >
                  AUTH · ACCT-0042188-NYU
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[1.3fr_1fr_1.2fr] md:min-h-[220px] md:flex-1 md:gap-4 md:overflow-hidden">
              <FluxPanel t={t} className="min-h-[240px] min-w-0 md:min-h-0" />
              <SolarDisk t={t} className="min-h-[240px] min-w-0 md:min-h-0" />
              <EventLog t={t} className="min-h-[240px] min-w-0 md:min-h-0" />
            </div>

            <DigestPanel t={t} fullHash={fullHash} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
