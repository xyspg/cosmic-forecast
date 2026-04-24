import { FlareTicker } from "@/components/bureau/FlareTicker";
import { GovHeaderStrip } from "@/components/bureau/GovHeaderStrip";
import { Nav } from "@/components/bureau/Nav";
import { BettingPanelSkeleton, ChartSkeleton, Skeleton } from "@/components/Skeleton";

export default function MarketLoading() {
  return (
    <div className="bg-paper text-ink min-h-screen">
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="markets" />

      <div className="bureau-page py-5">
        <div className="border-rule flex items-baseline justify-between border-b pb-3">
          <Skeleton className="h-[11px] w-[260px]" />
          <Skeleton className="h-[11px] w-[320px]" />
        </div>

        <div className="border-rule border-b pt-6 pb-2">
          <div className="mb-[14px] flex gap-[10px]">
            <Skeleton className="h-5 w-[220px]" />
            <Skeleton className="h-5 w-[90px]" />
            <Skeleton className="h-5 w-[140px]" />
            <Skeleton className="ml-auto h-5 w-[150px]" />
          </div>
          <Skeleton className="mb-2 h-[50px] w-4/5" />
          <Skeleton className="mb-[18px] h-[50px] w-[55%]" />
          <Skeleton className="mb-3 h-4 w-[65%]" />
          <Skeleton className="h-[11px] w-[55%]" />
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-9 pt-6 max-[960px]:grid-cols-1 max-[960px]:gap-6">
          <div>
            <ChartSkeleton />
            <div className="mt-[18px]">
              <Skeleton className="mb-[14px] h-9 w-[160px]" />
              {[1, 2, 3].map((i) => (
                <div key={`p-${i}`} className="mb-3">
                  <Skeleton className="mb-[6px] h-[14px]" />
                  <Skeleton className="mb-[6px] h-[14px]" />
                  <Skeleton className="h-[14px] w-[70%]" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <BettingPanelSkeleton />
            <div className="border-rule border">
              <div className="border-rule bg-paper-2 border-b px-[14px] py-[10px]">
                <Skeleton className="h-[10px] w-[140px]" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={`cp-${i}`}
                  className={`flex justify-between px-[14px] py-[10px] ${i === 5 ? "" : "border-rule border-b border-dotted"}`}
                >
                  <Skeleton className="h-3 w-[130px]" />
                  <Skeleton className="h-3 w-[60px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
