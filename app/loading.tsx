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
    <div
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        minHeight: "100vh",
      }}
    >
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="markets" />

      <div className="bureau-page" style={{ padding: "28px 32px 0" }}>
        <div
          className="bureau-masthead"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingBottom: 14,
            borderBottom: "3px double var(--ink)",
          }}
        >
          <div>
            <Skeleton style={{ height: 10, width: 280, marginBottom: 10 }} />
            <Skeleton style={{ height: 38, width: 360 }} />
          </div>
          <div
            className="bureau-masthead__meta"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <Skeleton style={{ height: 10, width: 140 }} />
            <Skeleton style={{ height: 10, width: 160 }} />
            <Skeleton style={{ height: 10, width: 180 }} />
          </div>
        </div>
      </div>

      <div
        className="bureau-page bureau-main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 32,
        }}
      >
        <div>
          <FeaturedMarketSkeleton />

          <div
            className="bureau-category-bar"
            style={{
              marginTop: 28,
              display: "flex",
              gap: 22,
              padding: "10px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {CATEGORY_PILLS.map((w, i) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholder row, order static
                key={`cat-${i}`}
                style={{ height: 12, width: w }}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingBottom: 8,
              borderBottom: "2px solid var(--ink)",
            }}
          >
            <Skeleton style={{ height: 22, width: 160 }} />
            <Skeleton style={{ height: 11, width: 220 }} />
          </div>

          <div className="bureau-table-scroll">
            <div style={{ minWidth: 760 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "110px 1fr 60px 60px 140px 80px 80px 100px 50px",
                  gap: 10,
                  padding: "14px 10px",
                  borderBottom: "2px solid var(--ink)",
                }}
              >
                {TABLE_ROWS.concat([6, 7, 8]).map((i) => (
                  <Skeleton key={`hdr-${i}`} style={{ height: 10 }} />
                ))}
              </div>
              {TABLE_ROWS.map((i) => (
                <div
                  key={`row-${i}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "110px 1fr 60px 60px 140px 80px 80px 100px 50px",
                    gap: 10,
                    padding: "18px 10px",
                    borderTop: "1px solid var(--rule)",
                    alignItems: "center",
                    background:
                      i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)",
                  }}
                >
                  <Skeleton style={{ height: 10 }} />
                  <div>
                    <Skeleton style={{ height: 15, marginBottom: 4 }} />
                    <Skeleton style={{ height: 10, width: "60%" }} />
                  </div>
                  <Skeleton style={{ height: 15 }} />
                  <Skeleton style={{ height: 15 }} />
                  <Skeleton style={{ height: 28 }} />
                  <Skeleton style={{ height: 13 }} />
                  <Skeleton style={{ height: 13 }} />
                  <Skeleton style={{ height: 11 }} />
                  <Skeleton style={{ height: 16 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section style={{ border: "1px solid var(--ink)", padding: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                paddingBottom: 8,
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <Skeleton style={{ height: 18, width: 60 }} />
              <Skeleton style={{ height: 10, width: 40 }} />
            </div>
            {WIRE_ROWS.map((i) => (
              <div
                key={`wire-${i}`}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    i === WIRE_ROWS.length - 1
                      ? "none"
                      : "1px dotted var(--rule)",
                }}
              >
                <Skeleton style={{ height: 9, width: 120, marginBottom: 5 }} />
                <Skeleton style={{ height: 13, marginBottom: 4 }} />
                <Skeleton
                  style={{ height: 13, width: "80%", marginBottom: 5 }}
                />
                <Skeleton style={{ height: 10, width: 100 }} />
              </div>
            ))}
          </section>

          <section
            style={{
              background: "#0a0a0a",
              padding: 16,
              border: "1px solid #000",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: 8,
                borderBottom: "1px solid #2b2a26",
                marginBottom: 12,
              }}
            >
              <Skeleton
                style={{
                  height: 11,
                  width: 80,
                  background: "rgba(184,132,42,0.35)",
                }}
              />
              <Skeleton
                style={{
                  height: 9,
                  width: 70,
                  background: "rgba(232,228,216,0.2)",
                }}
              />
            </div>
            {SOLAR_ROWS.map((i) => (
              <div
                key={`solar-${i}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                }}
              >
                <Skeleton
                  style={{
                    height: 11,
                    width: 110,
                    background: "rgba(232,228,216,0.1)",
                  }}
                />
                <Skeleton
                  style={{
                    height: 11,
                    width: 32,
                    background: "rgba(232,228,216,0.18)",
                  }}
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
