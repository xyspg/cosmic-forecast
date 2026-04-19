"use client";

import Link from "next/link";
import { useHydrated } from "@/hooks/useHydrated";
import { useCosmicStore } from "@/lib/store";
import { Skeleton } from "../Skeleton";
import { Wordmark } from "./Wordmark";

function NavLink({
  label,
  href,
  active,
}: {
  label: string;
  href?: string;
  active?: boolean;
}) {
  const style: React.CSSProperties = {
    color: active ? "var(--ink)" : "var(--ink-3)",
    borderBottom: active ? "2px solid var(--ink)" : "2px solid transparent",
    padding: "4px 0",
    fontWeight: active ? 600 : 400,
    textDecoration: "none",
    cursor: href ? "pointer" : "default",
  };
  if (href) {
    return (
      <Link href={href} style={style}>
        {label}
      </Link>
    );
  }
  return <span style={style}>{label}</span>;
}

export function Nav({ active = "markets" }: { active?: "markets" | "ledger" }) {
  const hydrated = useHydrated();
  const balance = useCosmicStore((s) => s.balance);

  return (
    <div
      className="bureau-nav"
      style={{
        padding: "14px 32px",
        borderBottom: "1px solid var(--rule)",
        background: "var(--paper)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        href="/"
        style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
      >
        <Wordmark />
      </Link>
      <div
        className="bureau-nav__center"
        style={{
          display: "flex",
          gap: 28,
          fontFamily: "var(--ff-mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        <NavLink label="Markets" href="/" active={active === "markets"} />
        <NavLink label="Ledger" href="/wallet" active={active === "ledger"} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          className="bureau-cash-pill"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 12px",
            border: "1px solid var(--ink)",
            background: "var(--paper-2)",
            fontFamily: "var(--ff-mono)",
          }}
        >
          <span
            className="bureau-nav__balance-label"
            style={{
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "var(--ink-3)",
              textTransform: "uppercase",
            }}
          >
            Cash
          </span>
          {hydrated ? (
            <span
              className="bureau-num"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              ${balance.toFixed(2)}
            </span>
          ) : (
            <Skeleton style={{ width: 64, height: 14 }} />
          )}
        </div>
      </div>
    </div>
  );
}
