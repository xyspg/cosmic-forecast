export function OracleStatus({ sessionHash }: { sessionHash?: string }) {
  const session = sessionHash ?? "0x9f4c8a21…";
  return (
    <div className="text-bone bg-[#0a0a0a] p-[14px]">
      <div className="bureau-mono text-amber mb-2 text-[9px] tracking-[0.18em] uppercase">
        ◈ Oracle status
      </div>
      <div className="text-bone-2 font-mono text-[10px] leading-[1.7]">
        <Row k="SESSION" v={session} />
        <Row k="LAST EVENT" v="FLR M2.1 · AR3947" />
        <Row k="ATTESTATION" v={<span className="text-pl-pos">✓ VERIFIED</span>} />
        <Row k="NEXT WINDOW" v={<span className="text-amber">14:38:22 UTC</span>} />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span>{k}</span>
      <span className="text-bone">{v}</span>
    </div>
  );
}
