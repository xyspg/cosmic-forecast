"use client";

import { BrandMark } from "./BrandMark";

export function Disclaimer() {
  const handleClearStorage = () => {
    if (typeof window === "undefined") return;
    window.localStorage.clear();
    window.location.reload();
  };
  return (
    <footer className="border-rule bg-paper-2 text-ink-3 mt-16 border-t px-[32px] pt-[40px] pb-[60px] font-sans text-[11px] leading-[1.55] max-sm:px-3">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[1.2fr_1fr_1fr_1fr] gap-8 max-[960px]:grid-cols-2 max-[960px]:gap-6 max-sm:grid-cols-1">
        <div>
          <div className="text-ink mb-2">
            <BrandMark size={20} />
          </div>
          <div className="bureau-serif text-ink mb-[6px] text-[13px]">
            Cosmic Forecast · Bureau of Prediction Markets
          </div>
          <div className="max-w-[320px]">
            An instrumented venue for the expression of probabilistic belief regarding future events
            of public interest. Established 2024 under the provisional charter of the Joint
            Astronomical Settlement Authority.
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
          <button
            type="button"
            onClick={handleClearStorage}
            className="text-ink-3 mt-1 cursor-pointer border-0 bg-transparent p-0 text-left font-sans text-[11px] leading-[1.55] underline underline-offset-2"
          >
            Purge local ledger data
          </button>
        </div>
      </div>
      <div className="border-rule text-ink-4 mx-auto mt-10 flex max-w-[1280px] justify-between gap-8 border-t pt-5 font-mono text-[10px] tracking-[0.1em] uppercase max-sm:flex-col max-sm:gap-[10px] max-sm:text-left">
        <div>© 2026 History of Universe · HOU-UF 101 002</div>
        <div className="max-w-[700px] text-right max-sm:max-w-full max-sm:text-left">
          This platform references publicly available NASA DONKI data · Outcomes are algorithmically
          determined · Participation constitutes acceptance of settlement methodology
        </div>
      </div>
    </footer>
  );
}
