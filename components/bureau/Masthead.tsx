export function Masthead({
  activeCount,
  openInterest,
  nextSettlement,
}: {
  activeCount: number;
  openInterest: string;
  nextSettlement: string;
}) {
  return (
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
        <div className="bureau-eyebrow" style={{ marginBottom: 6 }}>
          Edition · Sunday, April 19, 2026 · N.Y.
        </div>
        <div
          className="bureau-serif bureau-masthead__title"
          style={{
            fontSize: "clamp(26px, 6.5vw, 44px)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            fontWeight: 500,
          }}
        >
          The Prediction Record
        </div>
      </div>
      <div
        className="bureau-masthead__meta"
        style={{
          textAlign: "right",
          fontFamily: "var(--ff-mono)",
          fontSize: 10,
          color: "var(--ink-3)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          lineHeight: 1.7,
        }}
      >
        <div>{activeCount} ACTIVE MARKETS</div>
        <div>{openInterest} OPEN INTEREST</div>
        <div>NEXT SETTLEMENT · {nextSettlement}</div>
      </div>
    </div>
  );
}
