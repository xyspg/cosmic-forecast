import type { Market } from "@/lib/types";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function getRaDec(id: string): { ra: string; dec: string } {
  const rng = seededRng(hashString(id));
  const raH = Math.floor(rng() * 24);
  const raM = Math.floor(rng() * 60);
  const raS = (rng() * 60).toFixed(1);
  const sign = rng() > 0.5 ? "+" : "−";
  const decD = Math.floor(rng() * 65);
  const decM = Math.floor(rng() * 60);
  const decS = (rng() * 60).toFixed(1);
  return {
    ra: `${String(raH).padStart(2, "0")}h ${String(raM).padStart(2, "0")}m ${String(raS).padStart(4, "0")}s`,
    dec: `${sign}${String(decD).padStart(2, "0")}° ${String(decM).padStart(2, "0")}′ ${String(decS).padStart(4, "0")}″`,
  };
}

const CAT_PREFIX: Record<string, string> = {
  Politics: "POL",
  Science: "SCI",
  Tech: "TEC",
  Culture: "CUL",
  Macro: "MAC",
  Markets: "MKT",
  Crypto: "MKT",
  Climate: "CLM",
  Sports: "SPO",
};

export function getRef(m: Market, index: number): string {
  const prefix = CAT_PREFIX[m.category] ?? "GEN";
  const seq = String((index + 1) * 7 + (hashString(m.id) % 83)).padStart(
    4,
    "0",
  );
  return `MKT-${seq}-${prefix}`;
}

const RISK_LABELS = ["CAT. I", "CAT. II", "CAT. III", "CAT. IV", "CAT. V"];
export function getRisk(id: string): string {
  return RISK_LABELS[hashString(id) % RISK_LABELS.length];
}

export function daysUntil(endDateIso: string): number {
  const end = new Date(endDateIso).getTime();
  const now = new Date("2026-04-19T14:22:00Z").getTime();
  return Math.max(0, Math.round((end - now) / 86_400_000));
}

export function formatEndDate(endDateIso: string): string {
  const d = new Date(endDateIso);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function getOpenedDate(id: string): string {
  const rng = seededRng(hashString(id));
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[Math.floor(rng() * 12)];
  const day = String(Math.floor(rng() * 27) + 1).padStart(2, "0");
  const year = 2024 + Math.floor(rng() * 2);
  return `${month} ${day}, ${year}`;
}

const KNOWN_SUMMARIES: Record<string, string> = {
  "will-trump-win-2028-presidential-election":
    "Resolves YES if the certified Electoral College vote, as transmitted to the President of the Senate pursuant to 3 U.S.C. § 15, records Donald J. Trump as the winner.",
  "humans-on-mars-before-2035":
    "Resolves YES upon confirmation that at least one human being has made physical contact with the Martian regolith and survived the event.",
  "agi-achieved-before-2030":
    "Resolves YES upon unanimous affirmation by a three-member adjudication panel that a deployed system meets the Morris et al. (2023) criteria for AGI Level 4.",
  "bitcoin-above-200k-by-end-of-2026":
    "Resolves YES if the daily close price of BTC/USD on the reference exchanges, averaged per methodology, exceeds USD 200,000.00 on any date prior to 01 January 2027.",
};

export function getSummary(m: Market): string {
  return (
    KNOWN_SUMMARIES[m.id] ??
    `Resolves YES upon verified fulfillment of the conditions described above, as attested by publicly available reference sources prior to ${formatEndDate(m.endDate)}.`
  );
}

export interface BureauMarket extends Market {
  ra: string;
  dec: string;
  ref: string;
  risk: string;
  daysLeft: number;
  endsLabel: string;
  openedLabel: string;
  summary: string;
}

export function enrich(m: Market, index: number): BureauMarket {
  const { ra, dec } = getRaDec(m.id);
  return {
    ...m,
    ra,
    dec,
    ref: getRef(m, index),
    risk: getRisk(m.id),
    daysLeft: daysUntil(m.endDate),
    endsLabel: formatEndDate(m.endDate),
    openedLabel: getOpenedDate(m.id),
    summary: getSummary(m),
  };
}

export function fmtUSDShort(n: number): string {
  if (Math.abs(n) >= 1e6)
    return `$${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (Math.abs(n) >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${n.toLocaleString("en-US")}`;
}

export function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}
