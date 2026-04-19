export function OracleStatus({ sessionHash }: { sessionHash?: string }) {
  const session = sessionHash ?? "0x9f4c8a21…";
  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "var(--bone)",
        padding: 14,
      }}
    >
      <div
        className="bureau-mono"
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          color: "var(--amber)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        ◈ Oracle status
      </div>
      <div
        style={{
          fontFamily: "var(--ff-mono)",
          fontSize: 10,
          lineHeight: 1.7,
          color: "var(--bone-2)",
        }}
      >
        <Row k="SESSION" v={session} />
        <Row k="LAST EVENT" v="FLR M2.1 · AR3947" />
        <Row
          k="ATTESTATION"
          v={<span style={{ color: "var(--pl-pos)" }}>✓ VERIFIED</span>}
        />
        <Row
          k="NEXT WINDOW"
          v={<span style={{ color: "var(--amber)" }}>14:38:22 UTC</span>}
        />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{k}</span>
      <span style={{ color: "var(--bone)" }}>{v}</span>
    </div>
  );
}
