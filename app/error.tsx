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
    <div
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          width: "100%",
          border: "1px solid var(--ink)",
          background: "var(--paper)",
        }}
      >
        <div
          style={{
            background: "#000",
            color: "var(--bone)",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--ff-mono)",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.28em",
              color: "var(--amber)",
            }}
          >
            ◈ SYSTEM NOTICE · BUREAU OF PREDICTION MARKETS
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "var(--bone-2)",
            }}
          >
            FORM ERR-7
          </span>
        </div>

        <div
          className="bureau-error-card"
          style={{ padding: "28px 32px 32px" }}
        >
          <div
            className="bureau-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.24em",
              color: "var(--ink-3)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            — UNSCHEDULED INTERRUPTION —
          </div>
          <h1
            className="bureau-serif bureau-error-headline"
            style={{
              fontSize: 32,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              fontWeight: 500,
              margin: "0 0 14px",
              textWrap: "balance",
            }}
          >
            The Bureau has encountered an irregularity.
          </h1>
          <p
            className="bureau-serif"
            style={{
              fontSize: 15,
              fontStyle: "italic",
              color: "var(--ink-2)",
              lineHeight: 1.55,
              margin: "0 0 20px",
            }}
          >
            Operations have been suspended pending review. Your session will be
            restored from the Bureau's archive upon retry.
          </p>

          {error?.digest && (
            <div
              className="bureau-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "var(--ink-4)",
                marginBottom: 18,
                paddingBottom: 10,
                borderBottom: "1px dotted var(--rule)",
              }}
            >
              FILING DIGEST · {error.digest}
            </div>
          )}

          <button
            type="button"
            onClick={handleTryAgain}
            style={{
              width: "100%",
              padding: "14px 22px",
              background: "var(--ink)",
              color: "var(--paper)",
              border: 0,
              cursor: "pointer",
              fontFamily: "var(--ff-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
