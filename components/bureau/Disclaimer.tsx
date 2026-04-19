import { BrandMark } from "./BrandMark";

export function Disclaimer() {
  return (
    <footer
      style={{
        marginTop: 64,
        padding: "40px 32px 60px",
        borderTop: "1px solid var(--rule)",
        background: "var(--paper-2)",
        fontFamily: "var(--ff-sans)",
        fontSize: 11,
        color: "var(--ink-3)",
        lineHeight: 1.55,
      }}
    >
      <div
        className="bureau-footer-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
          gap: 32,
        }}
      >
        <div>
          <div style={{ color: "var(--ink)", marginBottom: 8 }}>
            <BrandMark size={20} />
          </div>
          <div
            className="bureau-serif"
            style={{
              color: "var(--ink)",
              fontSize: 13,
              marginBottom: 6,
            }}
          >
            Cosmic Forecast · Bureau of Prediction Markets
          </div>
          <div style={{ maxWidth: 320 }}>
            An instrumented venue for the expression of probabilistic belief
            regarding future events of public interest. Established 2024 under
            the provisional charter of the Joint Astronomical Settlement
            Authority.
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow" style={{ marginBottom: 8 }}>
            Markets
          </div>
          <div>All markets</div>
          <div>Resolution archive</div>
          <div>Settlement schedule</div>
          <div>Market proposal</div>
        </div>
        <div>
          <div className="bureau-eyebrow" style={{ marginBottom: 8 }}>
            Methodology
          </div>
          <div>Resolution framework (v2.1)</div>
          <div>Oracle specification</div>
          <div>DONKI data-reference manual</div>
          <div>Cryptographic attestation</div>
        </div>
        <div>
          <div className="bureau-eyebrow" style={{ marginBottom: 8 }}>
            Compliance
          </div>
          <div>Terms of use</div>
          <div>Risk disclosure (Form PM-4)</div>
          <div>Anti-manipulation policy</div>
          <div>Responsible participation</div>
        </div>
      </div>
      <div
        className="bureau-footer-meta"
        style={{
          maxWidth: 1280,
          margin: "40px auto 0",
          paddingTop: 20,
          borderTop: "1px solid var(--rule)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--ff-mono)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-4)",
          gap: 32,
        }}
      >
        <div>© 2026 History of Universe · HOU-UF 101 002</div>
        <div style={{ maxWidth: 700, textAlign: "right" }}>
          This platform references publicly available NASA DONKI data · Outcomes
          are algorithmically determined · Participation constitutes acceptance
          of settlement methodology
        </div>
      </div>
    </footer>
  );
}
