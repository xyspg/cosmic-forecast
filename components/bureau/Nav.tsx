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
  const cls = [
    "py-[4px] no-underline border-b-2",
    active ? "text-ink border-ink font-semibold" : "text-ink-3 border-transparent font-normal",
    href ? "cursor-pointer" : "cursor-default",
  ].join(" ");
  if (href) {
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  }
  return <span className={cls}>{label}</span>;
}

export function Nav({ active = "markets" }: { active?: "markets" | "ledger" }) {
  const hydrated = useHydrated();
  const balance = useCosmicStore((s) => s.balance);

  return (
    <div className="flex flex-wrap items-center justify-between gap-[10px] border-b border-rule bg-paper px-[32px] py-[14px] max-sm:px-[14px] max-sm:py-[10px]">
      <Link href="/" className="cursor-pointer text-inherit no-underline">
        <Wordmark />
      </Link>
      <div className="flex gap-7 font-mono text-[11px] uppercase tracking-eyebrow max-sm:order-3 max-sm:w-full max-sm:gap-5 max-sm:justify-start max-sm:border-t max-sm:border-dotted max-sm:border-rule max-sm:pt-[6px]">
        <NavLink label="Markets" href="/" active={active === "markets"} />
        <NavLink label="Ledger" href="/wallet" active={active === "ledger"} />
      </div>
      <div className="flex items-center gap-[14px]">
        <div className="flex items-center gap-[10px] border border-ink bg-paper-2 px-3 py-[6px] font-mono max-sm:px-[10px] max-sm:py-1">
          <span className="text-[9px] uppercase tracking-[0.18em] text-ink-3 max-sm:hidden">
            Cash
          </span>
          {hydrated ? (
            <span className="bureau-num text-[14px] font-semibold">
              ${balance.toFixed(2)}
            </span>
          ) : (
            <Skeleton className="h-[14px] w-16" />
          )}
        </div>
      </div>
    </div>
  );
}
