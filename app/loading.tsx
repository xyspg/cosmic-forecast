import { Disclaimer } from "@/components/bureau/Disclaimer";
import { FlareTicker } from "@/components/bureau/FlareTicker";
import { GovHeaderStrip } from "@/components/bureau/GovHeaderStrip";
import { Nav } from "@/components/bureau/Nav";
import { FeaturedMarketSkeleton, Skeleton } from "@/components/Skeleton";

const CATEGORY_PILLS = [50, 70, 60, 70, 60, 70, 80, 80];
const TABLE_ROWS = [0, 1, 2, 3, 4, 5];
const WIRE_ROWS = [0, 1, 2, 3];
const SOLAR_ROWS = [0, 1, 2, 3, 4, 5];

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="markets" />

      <div className="bureau-page pt-7">
        <div className="flex items-end justify-between border-b-[3px] border-double border-ink pb-[14px] max-sm:flex-col max-sm:items-start max-sm:gap-[10px]">
          <div>
            <Skeleton className="mb-[10px] h-[10px] w-[280px]" />
            <Skeleton className="h-[38px] w-[360px]" />
          </div>
          <div className="flex flex-col items-end gap-[6px]">
            <Skeleton className="h-[10px] w-[140px]" />
            <Skeleton className="h-[10px] w-[160px]" />
            <Skeleton className="h-[10px] w-[180px]" />
          </div>
        </div>
      </div>

      <div className="bureau-page grid grid-cols-[1fr_320px] gap-8 max-[960px]:grid-cols-1 max-[960px]:gap-6">
        <div>
          <FeaturedMarketSkeleton />

          <div className="mt-7 flex gap-[22px] border-b border-rule py-[10px]">
            {CATEGORY_PILLS.map((w, i) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholder row, order static
                key={`cat-${i}`}
                className="h-3"
                style={{ width: w }}
              />
            ))}
          </div>

          <div className="mt-5 flex items-baseline justify-between border-b-2 border-ink pb-2">
            <Skeleton className="h-[22px] w-[160px]" />
            <Skeleton className="h-[11px] w-[220px]" />
          </div>

          <div className="bureau-table-scroll">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[110px_1fr_60px_60px_140px_80px_80px_100px_50px] gap-[10px] border-b-2 border-ink px-[10px] py-[14px]">
                {TABLE_ROWS.concat([6, 7, 8]).map((i) => (
                  <Skeleton key={`hdr-${i}`} className="h-[10px]" />
                ))}
              </div>
              {TABLE_ROWS.map((i) => (
                <div
                  key={`row-${i}`}
                  className={`grid grid-cols-[110px_1fr_60px_60px_140px_80px_80px_100px_50px] items-center gap-[10px] border-t border-rule px-[10px] py-[18px] ${i % 2 === 0 ? "" : "bg-black/[0.015]"}`}
                >
                  <Skeleton className="h-[10px]" />
                  <div>
                    <Skeleton className="mb-1 h-[15px]" />
                    <Skeleton className="h-[10px] w-[60%]" />
                  </div>
                  <Skeleton className="h-[15px]" />
                  <Skeleton className="h-[15px]" />
                  <Skeleton className="h-[28px]" />
                  <Skeleton className="h-[13px]" />
                  <Skeleton className="h-[13px]" />
                  <Skeleton className="h-[11px]" />
                  <Skeleton className="h-[16px]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="border border-ink p-4">
            <div className="flex items-baseline justify-between border-b border-rule pb-2">
              <Skeleton className="h-[18px] w-[60px]" />
              <Skeleton className="h-[10px] w-[40px]" />
            </div>
            {WIRE_ROWS.map((i) => (
              <div
                key={`wire-${i}`}
                className={`py-3 ${i === WIRE_ROWS.length - 1 ? "" : "border-b border-dotted border-rule"}`}
              >
                <Skeleton className="mb-[5px] h-[9px] w-[120px]" />
                <Skeleton className="mb-1 h-[13px]" />
                <Skeleton className="mb-[5px] h-[13px] w-4/5" />
                <Skeleton className="h-[10px] w-[100px]" />
              </div>
            ))}
          </section>

          <section className="border border-black bg-[#0a0a0a] p-4">
            <div className="mb-3 flex justify-between border-b border-[#2b2a26] pb-2">
              <Skeleton
                className="h-[11px] w-[80px]"
                style={{ background: "rgba(184,132,42,0.35)" }}
              />
              <Skeleton
                className="h-[9px] w-[70px]"
                style={{ background: "rgba(232,228,216,0.2)" }}
              />
            </div>
            {SOLAR_ROWS.map((i) => (
              <div key={`solar-${i}`} className="flex justify-between py-1">
                <Skeleton
                  className="h-[11px] w-[110px]"
                  style={{ background: "rgba(232,228,216,0.1)" }}
                />
                <Skeleton
                  className="h-[11px] w-[32px]"
                  style={{ background: "rgba(232,228,216,0.18)" }}
                />
              </div>
            ))}
          </section>
        </aside>
      </div>

      <Disclaimer />
    </div>
  );
}
