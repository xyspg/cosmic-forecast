"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCosmicStore } from "@/lib/store";
import { useHydrated } from "@/hooks/useHydrated";
import { RollingNumber } from "./RollingNumber";

export function Navbar() {
  const hydrated = useHydrated();
  const balance = useCosmicStore((s) => s.balance);

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
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
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
              placeholder="Search markets"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 font-mono">
              /
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5">
            <div className="h-2 w-2 rounded-full bg-green" />
            <RollingNumber
              value={hydrated ? balance : 1000}
              prefix="$"
              className="text-sm font-semibold text-gray-900"
            />
          </div>
          <button
            type="button"
            className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </button>
        </div>
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
