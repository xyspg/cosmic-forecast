/**
 * Generates deterministic fake price history from a slug.
 * Uses a seeded PRNG so the same market always gets the same chart.
 * Produces realistic micro-noise like real trading data.
 */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface PricePoint {
  time: number;
  date: Date;
  yes: number;
  no: number;
}

const BASE_SPAN = 30 * 24 * 60 * 60 * 1000;

export function generatePriceHistory(
  slug: string,
  currentPrice: number,
  points = 200,
  spanMs = BASE_SPAN,
): PricePoint[] {
  const rand = seededRandom(hashString(slug));
  const history: PricePoint[] = [];

  // Start from a different price and walk toward current
  let yesPrice = currentPrice + (rand() - 0.5) * 0.3;
  yesPrice = Math.max(0.03, Math.min(0.97, yesPrice));

  const now = Date.now();
  const volScale = Math.sqrt(spanMs / BASE_SPAN);

  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const date = new Date(now - spanMs * (1 - t));

    history.push({
      time: i,
      date,
      yes: Math.round(yesPrice * 1000) / 1000,
      no: Math.round((1 - yesPrice) * 1000) / 1000,
    });

    // Realistic price movement: mean reversion + noise + occasional jumps
    const drift = (currentPrice - yesPrice) * 0.015;
    const noise = (rand() - 0.5) * 0.025 * volScale;

    // Occasional larger moves (step changes like real prediction markets)
    const jumpChance = rand();
    const jump = jumpChance > 0.95 ? (rand() - 0.5) * 0.08 * volScale : 0;

    // Micro-noise for realistic texture
    const micro = (rand() - 0.5) * 0.005 * volScale;

    yesPrice += drift + noise + jump + micro;
    yesPrice = Math.max(0.02, Math.min(0.98, yesPrice));
  }

  // Ensure last point matches current
  history[history.length - 1].yes = currentPrice;
  history[history.length - 1].no = Math.round((1 - currentPrice) * 100) / 100;

  return history;
}
