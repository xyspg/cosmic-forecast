import { FLARE_TICKER, flareClassColor } from "@/lib/flare-ticker-data";

export function FlareTicker() {
  const row = [...FLARE_TICKER, ...FLARE_TICKER, ...FLARE_TICKER];
  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#d4cfbf",
        height: 26,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        borderBottom: "1px solid #000",
      }}
    >
      <div
        style={{
          background: "var(--amber)",
          color: "#000",
          padding: "0 10px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          fontFamily: "var(--ff-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          fontWeight: 600,
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        ◈ SOLAR OBS · LIVE
      </div>
      <div
        style={{
          display: "flex",
          gap: 28,
          whiteSpace: "nowrap",
          animation: "bureau-ticker-scroll 90s linear infinite",
          paddingLeft: 20,
          fontFamily: "var(--ff-mono)",
          fontSize: 11,
        }}
      >
        {row.map((it, i) => (
          <div
            key={`${it.t}-${i}`}
            style={{ display: "flex", gap: 10, alignItems: "baseline" }}
          >
            <span style={{ color: "#8a8578" }}>{it.t}</span>
            <span style={{ color: flareClassColor(it.cls) }}>FLR {it.cls}</span>
            <span style={{ color: "#8a8578" }}>·</span>
            <span style={{ color: "#d4cfbf" }}>{it.region}</span>
            <span style={{ color: "#8a8578" }}>·</span>
            <span style={{ color: "#8a8578", fontSize: 10 }}>{it.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
