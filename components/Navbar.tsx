"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCosmicStore } from "@/lib/store";
import { useHydrated } from "@/hooks/useHydrated";

const CATEGORIES = [
  "All",
  "Politics",
  "Crypto",
  "Sports",
  "Tech",
  "Culture",
  "Science",
] as const;

export function Navbar({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory?: string;
  onCategoryChange?: (cat: string) => void;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/markets";
  const hydrated = useHydrated();
  const balance = useCosmicStore((s) => s.balance);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Cosmic Forecast
          </span>
        </Link>

        {/* Category tabs — only on homepage/markets */}
        {isHome && onCategoryChange && (
          <nav className="hidden md:flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-foreground text-background"
                    : "text-muted hover:bg-gray-100 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        )}

        {/* Right side — wallet balance */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-green" />
            <span className="text-sm font-medium tabular-nums">
              ${(hydrated ? balance : 1000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
