export function OracleStatus({ sessionHash }: { sessionHash?: string }) {
  const session = sessionHash ?? "0x9f4c8a21…";
  return (
    <div className="bg-[#0a0a0a] p-[14px] text-bone">
      <div className="bureau-mono mb-2 text-[9px] uppercase tracking-[0.18em] text-amber">
        ◈ Oracle status
      </div>
      <div className="font-mono text-[10px] leading-[1.7] text-bone-2">
        <Row k="SESSION" v={session} />
        <Row k="LAST EVENT" v="FLR M2.1 · AR3947" />
        <Row
          k="ATTESTATION"
          v={<span className="text-pl-pos">✓ VERIFIED</span>}
        />
        <Row
          k="NEXT WINDOW"
          v={<span className="text-amber">14:38:22 UTC</span>}
        />
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
