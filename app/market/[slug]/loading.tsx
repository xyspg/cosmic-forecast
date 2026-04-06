import {
  ChartSkeleton,
  BettingPanelSkeleton,
  Skeleton,
} from "@/components/Skeleton";

export default function MarketLoading() {
  return (
    <>
      {/* Navbar skeleton */}
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
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <span className="text-gray-300">/</span>
          <Skeleton className="h-4 w-12" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Chart */}
            <ChartSkeleton />

            {/* Comments */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <Skeleton className="h-5 w-24" />
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <BettingPanelSkeleton />

            {/* Activity skeleton */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <Skeleton className="h-5 w-28" />
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
