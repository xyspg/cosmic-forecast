"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCosmicStore } from "@/lib/store";
import { useHydrated } from "@/hooks/useHydrated";
import { RollingNumber } from "./RollingNumber";
import marketsData from "@/data/markets.json";
import type { Market } from "@/lib/types";

const markets = marketsData as Market[];

export function Navbar() {
  const hydrated = useHydrated();
  const balance = useCosmicStore((s) => s.balance);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return markets
      .filter((m) => m.question.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
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
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Cosmic Forecast
          </span>
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
          <div className="relative w-full">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search markets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
            />
            {!query && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 font-mono">
                /
              </span>
            )}
          </div>

          {/* Search results dropdown */}
          {focused && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
              {results.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  onMouseDown={() => {
                    router.push(`/market/${m.id}`);
                    setQuery("");
                    setFocused(false);
                  }}
                >
                  <span className="text-sm text-gray-900 line-clamp-1 flex-1">
                    {m.question}
                  </span>
                  <span className="text-xs font-bold tabular-nums text-gray-500 shrink-0">
                    {Math.round(m.yesPrice * 100)}%
                  </span>
                </button>
              ))}
            </div>
          )}
          {focused && query.length >= 2 && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg p-4 z-50">
              <p className="text-sm text-gray-400 text-center">
                No markets found
              </p>
            </div>
          )}
        </div>

        {/* Right side — balance link to wallet */}
        <Link
          href="/wallet"
          className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 transition-colors hover:bg-gray-50"
        >
          <div className="h-2 w-2 rounded-full bg-green" />
          <RollingNumber
            value={hydrated ? balance : 1000}
            prefix="$"
            className="text-sm font-semibold text-gray-900"
          />
        </Link>
      </div>
    </header>
  );
}

export function CategoryTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (cat: string) => void;
}) {
  const TABS = [
    "All",
    "Trending",
    "New",
    "Politics",
    "Crypto",
    "Sports",
    "Tech",
    "Culture",
    "Science",
    "Finance",
    "Climate",
    "AI",
    "Space",
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
