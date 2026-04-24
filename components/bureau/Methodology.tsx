export function Methodology() {
  return (
    <div className="border-rule mt-[18px] border-t">
      <div className="border-rule flex border-b">
        <div className="border-rule bg-paper-2 text-ink border-r px-4 py-[10px] font-mono text-[11px] font-semibold tracking-[0.1em] uppercase">
          Methodology
        </div>
      </div>
      <div className="text-ink-2 max-w-[720px] px-1 py-[18px] font-serif text-[15px] leading-[1.6]">
        <p className="mb-3">
          <b className="text-ink">Resolution source.</b> This market resolves upon receipt and
          cryptographic attestation of the next X-class or greater solar event recorded in the NASA
          Space Weather Database Of Notifications, Knowledge, Information (DONKI) subsequent to the
          market&apos;s scheduled settlement window. The event&apos;s observational parameters are
          mapped to outcome via the published resolution table per the oracle specification.
        </p>
        <p className="mb-3">
          <b className="text-ink">Settlement framework.</b> Where no qualifying event occurs within
          the settlement window, resolution proceeds against the highest-class event observed in the
          preceding 72 hours. The methodology is described at length in the Oracle Specification
          (revision 2.1, March 2026) and has been peer-reviewed by the Joint Astronomical Settlement
          Authority.
        </p>
        <p>
          <b className="text-ink">Participation.</b> Trades are accepted in whole-cent increments.
          Orders are matched against a continuous double auction with a 0.1¢ minimum price
          improvement. All positions are fully collateralized; no leverage is extended. Participants
          acknowledge that outcomes reflect the deterministic output of the oracle function and are
          not influenced by subjective prediction.
        </p>
      </div>
    </div>
  );
}
