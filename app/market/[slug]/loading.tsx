import { FlareTicker } from "@/components/bureau/FlareTicker";
import { GovHeaderStrip } from "@/components/bureau/GovHeaderStrip";
import { Nav } from "@/components/bureau/Nav";
import {
  BettingPanelSkeleton,
  ChartSkeleton,
  Skeleton,
} from "@/components/Skeleton";

export default function MarketLoading() {
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

      <div className="bureau-page" style={{ padding: "20px 32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingBottom: 12,
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <Skeleton style={{ height: 11, width: 260 }} />
          <Skeleton style={{ height: 11, width: 320 }} />
        </div>

        <div
          style={{
            padding: "24px 0 8px",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <Skeleton style={{ height: 20, width: 220 }} />
            <Skeleton style={{ height: 20, width: 90 }} />
            <Skeleton style={{ height: 20, width: 140 }} />
            <Skeleton style={{ height: 20, width: 150, marginLeft: "auto" }} />
          </div>
          <Skeleton style={{ height: 50, width: "80%", marginBottom: 8 }} />
          <Skeleton style={{ height: 50, width: "55%", marginBottom: 18 }} />
          <Skeleton style={{ height: 16, width: "65%", marginBottom: 12 }} />
          <Skeleton style={{ height: 11, width: "55%" }} />
        </div>

        <div
          className="bureau-market-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 36,
            paddingTop: 24,
          }}
        >
          <div>
            <ChartSkeleton />
            <div style={{ marginTop: 18 }}>
              <Skeleton
                style={{
                  height: 36,
                  width: 160,
                  marginBottom: 14,
                }}
              />
              {[1, 2, 3].map((i) => (
                <div key={`p-${i}`} style={{ marginBottom: 12 }}>
                  <Skeleton style={{ height: 14, marginBottom: 6 }} />
                  <Skeleton style={{ height: 14, marginBottom: 6 }} />
                  <Skeleton style={{ height: 14, width: "70%" }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <BettingPanelSkeleton />
            <div style={{ border: "1px solid var(--rule)" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--rule)",
                  background: "var(--paper-2)",
                }}
              >
                <Skeleton style={{ height: 10, width: 140 }} />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={`cp-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderBottom: i === 5 ? "none" : "1px dotted var(--rule)",
                  }}
                >
                  <Skeleton style={{ height: 12, width: 130 }} />
                  <Skeleton style={{ height: 12, width: 60 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
