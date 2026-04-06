/**
 * Reusable skeleton primitives for loading states.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-100 ${className}`}
    />
  );
}

export function MarketCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-10 rounded-md" />
            <Skeleton className="h-6 w-10 rounded-md" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-10 rounded-md" />
            <Skeleton className="h-6 w-10 rounded-md" />
          </div>
        </div>
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function FeaturedMarketSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 pt-5 pb-3 space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="flex gap-8">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-[140px] w-full rounded-lg" />
      </div>
      <div className="border-t border-gray-100 px-5 py-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-8 rounded-md" />
          ))}
        </div>
      </div>
      <Skeleton className="h-[220px] w-full rounded-lg" />
    </div>
  );
}

export function BettingPanelSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 flex-1 rounded-md" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
