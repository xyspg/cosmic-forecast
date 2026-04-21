import { FLARE_TICKER, flareClassColor } from "@/lib/flare-ticker-data";

export function FlareTicker() {
  const row = [...FLARE_TICKER, ...FLARE_TICKER, ...FLARE_TICKER];
  return (
    <div className="relative flex h-[26px] items-center overflow-hidden border-b border-black bg-[#0a0a0a] text-[#d4cfbf]">
      <div className="relative z-[2] flex h-full shrink-0 items-center bg-amber px-[10px] font-mono text-[10px] font-semibold tracking-[0.18em] text-black">
        ◈ SOLAR OBS · LIVE
      </div>
      <div
        className="flex gap-7 whitespace-nowrap pl-5 font-mono text-[11px]"
        style={{ animation: "bureau-ticker-scroll 90s linear infinite" }}
      >
        {row.map((it, i) => (
          <div
            key={`${it.t}-${i}`}
            className="flex items-baseline gap-[10px]"
          >
            <span className="text-[#8a8578]">{it.t}</span>
            <span style={{ color: flareClassColor(it.cls) }}>FLR {it.cls}</span>
            <span className="text-[#8a8578]">·</span>
            <span className="text-[#d4cfbf]">{it.region}</span>
            <span className="text-[#8a8578]">·</span>
            <span className="text-[10px] text-[#8a8578]">{it.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
