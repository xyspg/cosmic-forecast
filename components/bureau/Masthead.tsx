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
    <div className="border-ink flex items-end justify-between border-b-[3px] border-double pb-[14px] max-sm:flex-col max-sm:items-start max-sm:gap-[10px]">
      <div>
        <div className="bureau-eyebrow mb-[6px]">Edition · Sunday, April 19, 2026 · N.Y.</div>
        <h1 className="bureau-serif text-[clamp(26px,6.5vw,44px)] leading-none font-medium tracking-[-0.03em] max-sm:text-[30px] max-sm:break-words">
          The Prediction Record
        </h1>
      </div>
      <div className="text-ink-3 text-right font-mono text-[10px] leading-[1.7] tracking-[0.1em] uppercase max-sm:text-left">
        <div>{activeCount} ACTIVE MARKETS</div>
        <div>{openInterest} OPEN INTEREST</div>
        <div>NEXT SETTLEMENT · {nextSettlement}</div>
      </div>
    </div>
  );
}
