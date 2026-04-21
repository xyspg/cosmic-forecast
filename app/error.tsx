"use client";

import { useEffect } from "react";

const STORE_KEY = "cosmic-forecast-store";

export default function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[bureau error boundary]", error);
  }, [error]);

  const handleTryAgain = () => {
    try {
      window.localStorage.removeItem(STORE_KEY);
    } catch {
      // storage unavailable (private mode, quota) — reload still repaints
      // with fresh defaults
    }
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-10 text-ink">
      <div className="w-full max-w-[680px] border border-ink bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-[10px] bg-black px-5 py-3 font-mono text-bone">
          <span className="text-[10px] tracking-mark text-amber">
            ◈ SYSTEM NOTICE · BUREAU OF PREDICTION MARKETS
          </span>
          <span className="text-[10px] tracking-eyebrow text-bone-2">
            FORM ERR-7
          </span>
        </div>

        <div className="px-8 pb-8 pt-7 max-sm:px-[18px] max-sm:pb-6 max-sm:pt-[22px]">
          <div className="bureau-mono mb-[10px] text-[10px] uppercase tracking-[0.24em] text-ink-3">
            — UNSCHEDULED INTERRUPTION —
          </div>
          <h1 className="bureau-serif m-0 mb-[14px] text-balance text-[32px] font-medium leading-[1.15] tracking-[-0.02em] max-sm:text-[24px]">
            The Bureau has encountered an irregularity.
          </h1>
          <p className="bureau-serif m-0 mb-5 text-[15px] italic leading-[1.55] text-ink-2">
            Operations have been suspended pending review. Your session will be
            restored from the Bureau&apos;s archive upon retry.
          </p>

          {error?.digest && (
            <div className="bureau-mono mb-[18px] border-b border-dotted border-rule pb-[10px] text-[10px] tracking-wire text-ink-4">
              FILING DIGEST · {error.digest}
            </div>
          )}

          <button
            type="button"
            onClick={handleTryAgain}
            className="w-full cursor-pointer border-0 bg-ink px-[22px] py-[14px] font-mono text-[11px] font-semibold uppercase tracking-stamp text-paper"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
