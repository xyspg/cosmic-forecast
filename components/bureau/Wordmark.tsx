import { BrandMark } from "./BrandMark";

export function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <BrandMark size={26} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <div
          className="bureau-serif"
          style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}
        >
          Cosmic Forecast
        </div>
        <div
          className="bureau-mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.18em",
            color: "var(--ink-3)",
            marginTop: 2,
            textTransform: "uppercase",
          }}
        >
          Bureau of Prediction Markets
        </div>
      </div>
    </div>
  );
}
