export const CHART_RANGES = ["1H", "1D", "1W", "1M", "ALL"] as const;
export type ChartRange = (typeof CHART_RANGES)[number];

export const REFERENCE_NOW = new Date("2026-04-19T14:22:00Z");

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const MIN = 60_000;
const HR = 3_600_000;
const DAY = 86_400_000;

export function rangeConfig(r: ChartRange): { spanMs: number; points: number } {
  switch (r) {
    case "1H":
      return { spanMs: 60 * MIN, points: 60 };
    case "1D":
      return { spanMs: 24 * HR, points: 96 };
    case "1W":
      return { spanMs: 7 * DAY, points: 168 };
    case "1M":
      return { spanMs: 30 * DAY, points: 180 };
    case "ALL":
      return { spanMs: 90 * DAY, points: 270 };
  }
}

function fmtTime(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

function fmtDate(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}`;
}

function isTimeRange(r: ChartRange): boolean {
  return r === "1H" || r === "1D";
}

export function labelForIndex(r: ChartRange, i: number, n: number): string {
  if (n <= 1) return "";
  const { spanMs } = rangeConfig(r);
  const msAgo = (1 - i / (n - 1)) * spanMs;
  const d = new Date(REFERENCE_NOW.getTime() - msAgo);
  return isTimeRange(r) ? fmtTime(d) : fmtDate(d);
}

export function axisTicks(r: ChartRange): string[] {
  const { spanMs } = rangeConfig(r);
  const useTimes = isTimeRange(r);
  return Array.from({ length: 5 }, (_, i) => {
    const msAgo = (1 - i / 4) * spanMs;
    const d = new Date(REFERENCE_NOW.getTime() - msAgo);
    return useTimes ? fmtTime(d) : fmtDate(d);
  });
}
