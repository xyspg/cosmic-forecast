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
    <div className="bg-paper text-ink flex min-h-screen items-center justify-center px-5 py-10">
      <div className="border-ink bg-paper w-full max-w-[680px] border">
        <div className="text-bone flex flex-wrap items-center justify-between gap-[10px] bg-black px-5 py-3 font-mono">
          <span className="tracking-mark text-amber text-[10px]">
            ◈ SYSTEM NOTICE · BUREAU OF PREDICTION MARKETS
          </span>
          <span className="tracking-eyebrow text-bone-2 text-[10px]">FORM ERR-7</span>
        </div>

        <div className="px-8 pt-7 pb-8 max-sm:px-[18px] max-sm:pt-[22px] max-sm:pb-6">
          <div className="bureau-mono text-ink-3 mb-[10px] text-[10px] tracking-[0.24em] uppercase">
            — UNSCHEDULED INTERRUPTION —
          </div>
          <h1 className="bureau-serif m-0 mb-[14px] text-[32px] leading-[1.15] font-medium tracking-[-0.02em] text-balance max-sm:text-[24px]">
            The Bureau has encountered an irregularity.
          </h1>
          <p className="bureau-serif text-ink-2 m-0 mb-5 text-[15px] leading-[1.55] italic">
            Operations have been suspended pending review. Your session will be restored from the
            Bureau&apos;s archive upon retry.
          </p>

          {error?.digest && (
            <div className="bureau-mono border-rule tracking-wire text-ink-4 mb-[18px] border-b border-dotted pb-[10px] text-[10px]">
              FILING DIGEST · {error.digest}
            </div>
          )}

          <button
            type="button"
            onClick={handleTryAgain}
            className="bg-ink tracking-stamp text-paper w-full cursor-pointer border-0 px-[22px] py-[14px] font-mono text-[11px] font-semibold uppercase"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
