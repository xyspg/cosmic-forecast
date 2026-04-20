import { BrandMark } from "./BrandMark";

export function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark size={40} />
      <div className="flex flex-col leading-none">
        <div className="bureau-serif text-[18px] font-medium tracking-[-0.02em]">
          Cosmic Forecast
        </div>
        <div className="bureau-mono mt-[2px] text-[9px] uppercase tracking-[0.18em] text-ink-3">
          Bureau of Prediction Markets
        </div>
      </div>
    </div>
  );
}
