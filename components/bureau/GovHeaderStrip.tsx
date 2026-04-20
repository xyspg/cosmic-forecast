"use client";

import { useEffect, useState } from "react";

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

function formatSys(d: Date) {
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
  );
}

export function GovHeaderStrip() {
  const [sys, setSys] = useState(() => formatSys(new Date()));
  useEffect(() => {
    const id = setInterval(() => setSys(formatSys(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="bureau-gov-strip"
      style={{
        background: "var(--paper-2)",
        borderBottom: "1px solid var(--rule)",
        padding: "4px 20px",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--ff-mono)",
        fontSize: 10,
        color: "var(--ink-3)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      <div style={{ display: "flex", gap: 18 }}>
        <span>Vol. XII · No. 0419</span>
        <span suppressHydrationWarning>SYS {sys}</span>
      </div>
      <div
        className="bureau-gov-strip__secondary"
        style={{ display: "flex", gap: 18 }}
      >
        <span>OBS. STATION — ARECIBO 18.344°N 66.753°W</span>
        <span style={{ color: "var(--ink)" }}>◉ ALL SYSTEMS NOMINAL</span>
      </div>
    </div>
  );
}
