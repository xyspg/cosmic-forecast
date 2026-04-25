import { Link } from "@tanstack/react-router";

import { useHydrated } from "@/hooks/useHydrated";
import { useCosmicStore } from "@/lib/store";

import { Skeleton } from "../Skeleton";
import { Wordmark } from "./Wordmark";

function NavLink({ label, to, active }: { label: string; to?: "/" | "/wallet"; active?: boolean }) {
  const cls = [
    "py-[4px] no-underline border-b-2",
    active ? "text-ink border-ink font-semibold" : "text-ink-3 border-transparent font-normal",
    to ? "cursor-pointer" : "cursor-default",
  ].join(" ");
  if (to) {
    return (
      <Link to={to} className={cls}>
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
    <div className="border-rule bg-paper flex flex-wrap items-center justify-between gap-[10px] border-b px-[32px] py-[14px] max-sm:px-[14px] max-sm:py-[10px]">
      <Link to="/" className="cursor-pointer text-inherit no-underline">
        <Wordmark />
      </Link>
      <div className="tracking-eyebrow max-sm:border-rule flex gap-7 font-mono text-[11px] uppercase max-sm:order-3 max-sm:w-full max-sm:justify-start max-sm:gap-5 max-sm:border-t max-sm:border-dotted max-sm:pt-[6px]">
        <NavLink label="Markets" to="/" active={active === "markets"} />
        <NavLink label="Ledger" to="/wallet" active={active === "ledger"} />
      </div>
      <div className="flex items-center gap-[14px]">
        <div className="border-ink bg-paper-2 flex items-center gap-[10px] border px-3 py-[6px] font-mono max-sm:px-[10px] max-sm:py-1">
          <span className="text-ink-3 text-[9px] tracking-[0.18em] uppercase max-sm:hidden">
            Cash
          </span>
          {hydrated ? (
            <span className="bureau-num text-[14px] font-semibold">${balance.toFixed(2)}</span>
          ) : (
            <Skeleton className="h-[14px] w-16" />
          )}
        </div>
      </div>
    </div>
  );
}
