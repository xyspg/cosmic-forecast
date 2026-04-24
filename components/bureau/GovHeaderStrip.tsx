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
    <div className="border-rule bg-paper-2 text-ink-3 flex flex-wrap justify-between gap-2 border-b px-[20px] py-[4px] font-mono text-[10px] tracking-[0.08em] uppercase max-sm:px-3 max-sm:text-[9px]">
      <div className="flex flex-wrap gap-[18px] max-sm:gap-2">
        <span>Vol. XII · No. 0419</span>
        <span suppressHydrationWarning>SYS {sys}</span>
      </div>
      <div className="flex gap-[18px] max-sm:hidden">
        <span>OBS. STATION — ARECIBO 18.344°N 66.753°W</span>
        <span className="text-ink">◉ ALL SYSTEMS NOMINAL</span>
      </div>
    </div>
  );
}
