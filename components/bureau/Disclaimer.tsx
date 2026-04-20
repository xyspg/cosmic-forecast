import { BrandMark } from "./BrandMark";

export function Disclaimer() {
  return (
    <footer className="mt-16 border-t border-rule bg-paper-2 px-[32px] pb-[60px] pt-[40px] font-sans text-[11px] leading-[1.55] text-ink-3 max-sm:px-3">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[1.2fr_1fr_1fr_1fr] gap-8 max-[960px]:grid-cols-2 max-[960px]:gap-6 max-sm:grid-cols-1">
        <div>
          <div className="mb-2 text-ink">
            <BrandMark size={20} />
          </div>
          <div className="bureau-serif mb-[6px] text-[13px] text-ink">
            Cosmic Forecast · Bureau of Prediction Markets
          </div>
          <div className="max-w-[320px]">
            An instrumented venue for the expression of probabilistic belief
            regarding future events of public interest. Established 2024 under
            the provisional charter of the Joint Astronomical Settlement
            Authority.
          </div>
        </div>
        <div>
          <div className="bureau-eyebrow mb-2">Markets</div>
          <div>All markets</div>
          <div>Resolution archive</div>
          <div>Settlement schedule</div>
          <div>Market proposal</div>
        </div>
        <div>
          <div className="bureau-eyebrow mb-2">Methodology</div>
          <div>Resolution framework (v2.1)</div>
          <div>Oracle specification</div>
          <div>DONKI data-reference manual</div>
          <div>Cryptographic attestation</div>
        </div>
        <div>
          <div className="bureau-eyebrow mb-2">Compliance</div>
          <div>Terms of use</div>
          <div>Risk disclosure (Form PM-4)</div>
          <div>Anti-manipulation policy</div>
          <div>Responsible participation</div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1280px] justify-between gap-8 border-t border-rule pt-5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-4 max-sm:flex-col max-sm:gap-[10px] max-sm:text-left">
        <div>© 2026 History of Universe · HOU-UF 101 002</div>
        <div className="max-w-[700px] text-right max-sm:max-w-full max-sm:text-left">
          This platform references publicly available NASA DONKI data · Outcomes
          are algorithmically determined · Participation constitutes acceptance
          of settlement methodology
        </div>
      </div>
    </footer>
  );
}
