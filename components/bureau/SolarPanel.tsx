export function SolarPanel() {
  return (
    <section className="text-bone border border-black bg-[#0a0a0a] p-[16px]">
      <div className="flex items-baseline justify-between border-b border-[#2b2a26] pb-2">
        <div className="bureau-mono text-amber text-[11px] tracking-[0.18em]">◈ SOLAR OBS</div>
        <div className="bureau-mono tracking-eyebrow text-bone-2 text-[9px]">24H WINDOW</div>
      </div>
      <div className="py-3 font-mono text-[11px] leading-[1.8]">
        <StatRow k="X-class events" v="01" />
        <StatRow k="M-class events" v="03" />
        <StatRow k="C-class events" v="12" />
        <StatRow k="Active regions" v="07" />
        <StatRow k="Kp index" v="4.33" />
        <div className="text-amber mt-2 flex justify-between">
          <span>NEXT SETTLEMENT</span>
          <span>14:38:22</span>
        </div>
      </div>
      <div className="text-bone-2 border-t border-[#2b2a26] pt-[10px] font-mono text-[9px] leading-[1.5] tracking-[0.04em]">
        Data sourced from NASA Space Weather Database Of Notifications, Knowledge, Information
        (DONKI). Settlement proceeds upon cryptographic attestation of the event digest.
      </div>
    </section>
  );
}

function StatRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-bone-2">{k}</span>
      <span>{v}</span>
    </div>
  );
}
