export interface FlareTick {
  t: string;
  cls: string;
  region: string;
  note: string;
}

export const FLARE_TICKER: FlareTick[] = [
  { t: "2026-04-19T14:22Z", cls: "M2.1", region: "AR3947", note: "OBSERVED" },
  { t: "2026-04-19T11:04Z", cls: "C4.6", region: "AR3948", note: "OBSERVED" },
  { t: "2026-04-19T09:51Z", cls: "C1.2", region: "AR3945", note: "OBSERVED" },
  { t: "2026-04-19T06:33Z", cls: "M5.4", region: "AR3947", note: "OBSERVED" },
  { t: "2026-04-19T02:17Z", cls: "B9.8", region: "AR3942", note: "OBSERVED" },
  { t: "2026-04-18T23:02Z", cls: "X1.1", region: "AR3947", note: "OBSERVED" },
  { t: "2026-04-18T19:41Z", cls: "C8.3", region: "AR3944", note: "OBSERVED" },
  { t: "2026-04-18T15:28Z", cls: "M1.7", region: "AR3946", note: "OBSERVED" },
];

export function flareClassColor(c: string): string {
  if (c.startsWith("X")) return "#d4a04a";
  if (c.startsWith("M")) return "#b8842a";
  if (c.startsWith("C")) return "#8a8578";
  return "#6a6558";
}
