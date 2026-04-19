"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";
import { Disclaimer } from "@/components/bureau/Disclaimer";
import { FlareTicker } from "@/components/bureau/FlareTicker";
import { GovHeaderStrip } from "@/components/bureau/GovHeaderStrip";
import { Nav } from "@/components/bureau/Nav";
import { CosmicReport } from "@/components/CosmicReport";
import marketsData from "@/data/markets.json";
import { useHydrated } from "@/hooks/useHydrated";
import { enrich } from "@/lib/market-metadata";
import { useCosmicStore } from "@/lib/store";
import type { Market } from "@/lib/types";

const rawMarkets = marketsData as Market[];

export default function ResolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const idx = rawMarkets.findIndex((m) => m.id === slug);
  const market = idx >= 0 ? rawMarkets[idx] : undefined;
  if (!market) notFound();

  const bureau = useMemo(() => enrich(market, idx), [market, idx]);

  const hydrated = useHydrated();
  const storeResolution = useCosmicStore((s) => s.getResolution(slug));
  const storePosition = useCosmicStore((s) => s.getPosition(slug));
  const resolution = hydrated ? storeResolution : undefined;
  const position = hydrated ? storePosition : undefined;

  if (!hydrated) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          color: "var(--bone)",
          fontFamily: "var(--ff-mono)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.28em",
            color: "var(--amber)",
            textTransform: "uppercase",
          }}
        >
          ◈ ATTESTATION FILED
        </div>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "var(--bone-2)",
            textTransform: "uppercase",
          }}
        >
          Retrieving record from public archive…
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        minHeight: "100vh",
      }}
    >
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="markets" />

      <div className="bureau-page bureau-page--tight">
        {!resolution ? (
          <div
            style={{
              padding: "80px 40px",
              border: "1px solid var(--rule)",
              background: "var(--paper-2)",
              textAlign: "center",
            }}
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
              — NO RECORD ON FILE —
            </div>
            <div
              className="bureau-serif"
              style={{
                fontSize: 26,
                letterSpacing: "-0.015em",
                fontWeight: 500,
                lineHeight: 1.3,
                textWrap: "balance",
                marginBottom: 12,
              }}
            >
              {market.question}
            </div>
            <div
              className="bureau-serif"
              style={{
                fontSize: 15,
                fontStyle: "italic",
                color: "var(--ink-3)",
                lineHeight: 1.5,
                maxWidth: 560,
                margin: "0 auto 22px",
              }}
            >
              This market has not yet been resolved by the Settlement Bureau.
              The observational window remains open.
            </div>
            <Link
              href={`/market/${slug}`}
              style={{
                display: "inline-block",
                padding: "12px 22px",
                background: "var(--ink)",
                color: "var(--paper)",
                fontFamily: "var(--ff-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Return to market ⟶
            </Link>
          </div>
        ) : (
          <>
            <CosmicReport
              resolution={resolution}
              marketQuestion={market.question}
              market={bureau}
              position={position}
            />
            <div
              className="bureau-resolution-footer"
              style={{
                marginTop: 28,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 16,
                borderTop: "1px solid var(--rule)",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div
                className="bureau-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                }}
              >
                Archived under RES-
                {new Date(resolution.timestamp).toISOString().slice(0, 10)}-
                {bureau.ref.slice(-4)} · permanent record
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href={`/market/${slug}`}
                  style={{
                    padding: "12px 20px",
                    background: "var(--paper)",
                    color: "var(--ink)",
                    border: "1px solid var(--ink)",
                    fontFamily: "var(--ff-mono)",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Market page
                </Link>
                <Link
                  href="/"
                  style={{
                    padding: "12px 20px",
                    background: "var(--ink)",
                    color: "var(--paper)",
                    fontFamily: "var(--ff-mono)",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Return to market index ⟶
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <Disclaimer />
    </div>
  );
}
