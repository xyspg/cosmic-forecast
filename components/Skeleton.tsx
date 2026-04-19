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
      className={`bureau-skeleton-pulse ${className}`}
      style={{
        background: "var(--rule-2)",
        ...style,
      }}
    />
  );
}

export function FeaturedMarketSkeleton() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
        padding: "18px 0",
        background: "var(--paper)",
      }}
    >
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <Skeleton style={{ height: 18, width: 180 }} />
        <Skeleton style={{ height: 18, width: 90 }} />
        <Skeleton style={{ height: 18, width: 120 }} />
      </div>
      <Skeleton style={{ height: 40, width: "85%", marginBottom: 8 }} />
      <Skeleton style={{ height: 40, width: "60%", marginBottom: 16 }} />
      <Skeleton style={{ height: 12, width: "50%", marginBottom: 20 }} />
      <Skeleton style={{ height: 180, width: "100%" }} />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
        padding: "14px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
          borderBottom: "1px solid var(--rule)",
          paddingBottom: 10,
        }}
      >
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <Skeleton style={{ height: 9, width: 60, marginBottom: 6 }} />
            <Skeleton style={{ height: 28, width: 70 }} />
          </div>
          <div>
            <Skeleton style={{ height: 9, width: 24, marginBottom: 6 }} />
            <Skeleton style={{ height: 20, width: 44 }} />
          </div>
          <div>
            <Skeleton style={{ height: 9, width: 50, marginBottom: 6 }} />
            <Skeleton style={{ height: 18, width: 50 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={`range-${i}`} style={{ height: 22, width: 28 }} />
          ))}
        </div>
      </div>
      <Skeleton style={{ height: 220, width: "100%" }} />
    </div>
  );
}

export function BettingPanelSkeleton() {
  return (
    <div
      style={{
        border: "1px solid var(--ink)",
        background: "var(--paper)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--ink)",
          background: "var(--paper-2)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Skeleton style={{ height: 11, width: 100 }} />
        <Skeleton style={{ height: 10, width: 60 }} />
      </div>
      <div style={{ padding: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
            border: "1px solid var(--ink)",
            marginBottom: 14,
          }}
        >
          <Skeleton style={{ height: 44 }} />
          <Skeleton
            style={{ height: 44, borderLeft: "1px solid var(--ink)" }}
          />
        </div>
        <Skeleton style={{ height: 9, width: 90, marginBottom: 6 }} />
        <Skeleton style={{ height: 44, marginBottom: 10 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 4,
            marginBottom: 10,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={`quick-${i}`} style={{ height: 28 }} />
          ))}
        </div>
        <Skeleton style={{ height: 32, marginBottom: 16 }} />
        <div
          style={{
            borderTop: "1px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
            padding: "10px 0",
            marginBottom: 14,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={`receipt-${i}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0",
                borderBottom: i === 6 ? "none" : "1px dotted var(--rule)",
              }}
            >
              <Skeleton style={{ height: 11, width: 80 }} />
              <Skeleton style={{ height: 11, width: 50 }} />
            </div>
          ))}
        </div>
        <Skeleton style={{ height: 46 }} />
      </div>
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div className="bureau-page">
      <div
        style={{
          paddingBottom: 16,
          borderBottom: "3px double var(--ink)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div>
            <Skeleton style={{ height: 10, width: 320, marginBottom: 8 }} />
            <Skeleton style={{ height: 38, width: 280 }} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              alignItems: "flex-end",
            }}
          >
            <Skeleton style={{ height: 10, width: 140 }} />
            <Skeleton style={{ height: 10, width: 100 }} />
            <Skeleton style={{ height: 10, width: 180 }} />
          </div>
        </div>
      </div>
      <div
        className="bureau-stat-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
          border: "1px solid var(--ink)",
          borderTop: "none",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`stat-${i}`}
            style={{
              padding: "22px 24px",
              borderRight: i === 4 ? "none" : "1px solid var(--ink)",
            }}
          >
            <Skeleton style={{ height: 10, width: 130, marginBottom: 12 }} />
            <Skeleton style={{ height: 32, width: i === 1 ? 170 : 80 }} />
            <Skeleton style={{ height: 10, width: 100, marginTop: 8 }} />
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "2px solid var(--ink)",
          marginTop: 32,
        }}
      >
        {[160, 200, 140, 160].map((w, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholder row, order static
            key={`tab-${i}`}
            style={{ height: 38, width: w }}
          />
        ))}
      </div>
      <div className="bureau-table-scroll">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1.5fr 80px 80px 80px 100px 120px 100px",
            minWidth: 920,
            gap: 14,
            padding: "14px 12px",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={`hdr-${i}`} style={{ height: 10 }} />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`row-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns:
                "140px 1.5fr 80px 80px 80px 100px 120px 100px",
              minWidth: 920,
              gap: 14,
              padding: "16px 12px",
              borderBottom: "1px solid var(--rule)",
              alignItems: "center",
            }}
          >
            <Skeleton style={{ height: 10 }} />
            <Skeleton style={{ height: 18 }} />
            <Skeleton style={{ height: 20 }} />
            <Skeleton style={{ height: 14 }} />
            <Skeleton style={{ height: 14 }} />
            <Skeleton style={{ height: 14 }} />
            <Skeleton style={{ height: 18 }} />
            <Skeleton style={{ height: 20 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
