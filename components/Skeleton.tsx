/**
 * Bureau-style skeletons. Cream paper, rule lines, dashed placeholders —
 * no rounded corners, no grey chips. Reads as "document not yet filed".
 */

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`bureau-skeleton-pulse bg-rule-2 ${className}`}
      style={style}
    />
  );
}

export function FeaturedMarketSkeleton() {
  return (
    <div className="border-y border-rule bg-paper py-[18px]">
      <div className="mb-[14px] flex gap-[10px]">
        <Skeleton className="h-[18px] w-[180px]" />
        <Skeleton className="h-[18px] w-[90px]" />
        <Skeleton className="h-[18px] w-[120px]" />
      </div>
      <Skeleton className="mb-2 h-[40px] w-[85%]" />
      <Skeleton className="mb-4 h-[40px] w-[60%]" />
      <Skeleton className="mb-5 h-[12px] w-1/2" />
      <Skeleton className="h-[180px] w-full" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="border-y border-rule py-[14px]">
      <div className="mb-[10px] flex items-baseline justify-between border-b border-rule pb-[10px]">
        <div className="flex gap-5">
          <div>
            <Skeleton className="mb-[6px] h-[9px] w-[60px]" />
            <Skeleton className="h-[28px] w-[70px]" />
          </div>
          <div>
            <Skeleton className="mb-[6px] h-[9px] w-[24px]" />
            <Skeleton className="h-[20px] w-[44px]" />
          </div>
          <div>
            <Skeleton className="mb-[6px] h-[9px] w-[50px]" />
            <Skeleton className="h-[18px] w-[50px]" />
          </div>
        </div>
        <div className="flex gap-[2px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={`range-${i}`} className="h-[22px] w-[28px]" />
          ))}
        </div>
      </div>
      <Skeleton className="h-[220px] w-full" />
    </div>
  );
}

export function BettingPanelSkeleton() {
  return (
    <div className="border border-ink bg-paper">
      <div className="flex justify-between border-b border-ink bg-paper-2 px-[14px] py-[10px]">
        <Skeleton className="h-[11px] w-[100px]" />
        <Skeleton className="h-[10px] w-[60px]" />
      </div>
      <div className="p-[14px]">
        <div className="mb-[14px] grid grid-cols-2 border border-ink">
          <Skeleton className="h-[44px]" />
          <Skeleton className="h-[44px] border-l border-ink" />
        </div>
        <Skeleton className="mb-[6px] h-[9px] w-[90px]" />
        <Skeleton className="mb-[10px] h-[44px]" />
        <div className="mb-[10px] grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={`quick-${i}`} className="h-[28px]" />
          ))}
        </div>
        <Skeleton className="mb-4 h-[32px]" />
        <div className="mb-[14px] border-y border-ink py-[10px]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={`receipt-${i}`}
              className={`flex justify-between py-[5px] ${i === 6 ? "" : "border-b border-dotted border-rule"}`}
            >
              <Skeleton className="h-[11px] w-[80px]" />
              <Skeleton className="h-[11px] w-[50px]" />
            </div>
          ))}
        </div>
        <Skeleton className="h-[46px]" />
      </div>
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div className="bureau-page">
      <div className="border-b-[3px] border-double border-ink pb-4">
        <div className="flex items-baseline justify-between">
          <div>
            <Skeleton className="mb-2 h-[10px] w-[320px]" />
            <Skeleton className="h-[38px] w-[280px]" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-[10px] w-[140px]" />
            <Skeleton className="h-[10px] w-[100px]" />
            <Skeleton className="h-[10px] w-[180px]" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border border-t-0 border-ink max-[960px]:grid-cols-2 max-sm:grid-cols-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`stat-${i}`}
            className={`px-6 py-[22px] ${i === 4 ? "" : "border-r border-ink"}`}
          >
            <Skeleton className="mb-3 h-[10px] w-[130px]" />
            <Skeleton
              className={`h-[32px] ${i === 1 ? "w-[170px]" : "w-[80px]"}`}
            />
            <Skeleton className="mt-2 h-[10px] w-[100px]" />
          </div>
        ))}
      </div>
      <div className="mt-8 flex border-b-2 border-ink">
        {[160, 200, 140, 160].map((w, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholder row, order static
            key={`tab-${i}`}
            className="h-[38px]"
            style={{ width: w }}
          />
        ))}
      </div>
      <div className="bureau-table-scroll">
        <div className="grid min-w-[920px] grid-cols-[140px_1.5fr_80px_80px_80px_100px_120px_100px] gap-[14px] border-b border-rule px-3 py-[14px]">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={`hdr-${i}`} className="h-[10px]" />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`row-${i}`}
            className="grid min-w-[920px] grid-cols-[140px_1.5fr_80px_80px_80px_100px_120px_100px] items-center gap-[14px] border-b border-rule px-3 py-4"
          >
            <Skeleton className="h-[10px]" />
            <Skeleton className="h-[18px]" />
            <Skeleton className="h-[20px]" />
            <Skeleton className="h-[14px]" />
            <Skeleton className="h-[14px]" />
            <Skeleton className="h-[14px]" />
            <Skeleton className="h-[18px]" />
            <Skeleton className="h-[20px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
