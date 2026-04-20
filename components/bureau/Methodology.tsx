export function Methodology() {
  return (
    <div style={{ marginTop: 18, borderTop: "1px solid var(--rule)" }}>
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            fontFamily: "var(--ff-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderRight: "1px solid var(--rule)",
            background: "var(--paper-2)",
            color: "var(--ink)",
            fontWeight: 600,
          }}
        >
          Methodology
        </div>
      </div>
      <div
        style={{
          padding: "18px 4px",
          maxWidth: 720,
          fontFamily: "var(--ff-serif)",
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--ink-2)",
        }}
      >
        <p style={{ margin: "0 0 12px" }}>
          <b style={{ color: "var(--ink)" }}>Resolution source.</b> This market
          resolves upon receipt and cryptographic attestation of the next
          X-class or greater solar event recorded in the NASA Space Weather
          Database Of Notifications, Knowledge, Information (DONKI) subsequent
          to the market&apos;s scheduled settlement window. The SHA-256 digest
          of the event&apos;s parameter string is computed and its terminal
          nibble mapped to outcome per the oracle specification.
        </p>
        <p style={{ margin: "0 0 12px" }}>
          <b style={{ color: "var(--ink)" }}>Settlement framework.</b> Where no
          qualifying event occurs within the settlement window, resolution
          proceeds against the highest-class event observed in the preceding 72
          hours. The methodology is described at length in the Oracle
          Specification (revision 2.1, March 2026) and has been peer-reviewed by
          the Joint Astronomical Settlement Authority.
        </p>
        <p style={{ margin: 0 }}>
          <b style={{ color: "var(--ink)" }}>Participation.</b> Trades are
          accepted in whole-cent increments. Orders are matched against a
          continuous double auction with a 0.1¢ minimum price improvement. All
          positions are fully collateralized; no leverage is extended.
          Participants acknowledge that outcomes reflect the deterministic
          output of the oracle function and are not influenced by subjective
          prediction.
        </p>
      </div>
    </div>
  );
}
