export function SolarPanel() {
  return (
    <section
      style={{
        background: "#0a0a0a",
        color: "var(--bone)",
        padding: 16,
        border: "1px solid #000",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: 8,
          borderBottom: "1px solid #2b2a26",
        }}
      >
        <div
          className="bureau-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "var(--amber)",
          }}
        >
          ◈ SOLAR OBS
        </div>
        <div
          className="bureau-mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.14em",
            color: "var(--bone-2)",
          }}
        >
          24H WINDOW
        </div>
      </div>
      <div
        style={{
          padding: "12px 0",
          fontFamily: "var(--ff-mono)",
          fontSize: 11,
          lineHeight: 1.8,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--bone-2)" }}>X-class events</span>
          <span>01</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--bone-2)" }}>M-class events</span>
          <span>03</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--bone-2)" }}>C-class events</span>
          <span>12</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--bone-2)" }}>Active regions</span>
          <span>07</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--bone-2)" }}>Kp index</span>
          <span>4.33</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            color: "var(--amber)",
          }}
        >
          <span>NEXT SETTLEMENT</span>
          <span>14:38:22</span>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid #2b2a26",
          paddingTop: 10,
          fontFamily: "var(--ff-mono)",
          fontSize: 9,
          lineHeight: 1.5,
          color: "var(--bone-2)",
          letterSpacing: "0.04em",
        }}
      >
        Data sourced from NASA Space Weather Database Of Notifications,
        Knowledge, Information (DONKI). Settlement proceeds upon cryptographic
        attestation of the event digest.
      </div>
    </section>
  );
}
