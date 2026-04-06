import { Navbar } from "@/components/Navbar";
import {
  FeaturedMarketSkeleton,
  MarketCardSkeleton,
  SidebarSkeleton,
} from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <>
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gray-900" />
            <span className="text-lg font-bold text-gray-900">
              Cosmic Forecast
            </span>
          </div>
          <div className="h-9 w-24 animate-pulse rounded-full bg-gray-100" />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            <FeaturedMarketSkeleton />
            <div>
              <div className="h-6 w-28 animate-pulse rounded bg-gray-100 mb-4" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }, (_, i) => (
                  <MarketCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
          <aside className="hidden lg:block">
            <SidebarSkeleton />
          </aside>
        </div>
      </main>
    </>
  );
}
