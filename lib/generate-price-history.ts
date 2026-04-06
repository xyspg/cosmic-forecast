/**
 * Generates deterministic fake price history from a slug.
 * Uses a seeded PRNG so the same market always gets the same chart.
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
  time: number; // index
  price: number;
}

export function generatePriceHistory(
  slug: string,
  currentPrice: number,
  points = 100,
): PricePoint[] {
  const rand = seededRandom(hashString(slug));
  const history: PricePoint[] = [];

  // Start from a slightly different price and random-walk to current
  let price = currentPrice + (rand() - 0.5) * 0.3;
  price = Math.max(0.02, Math.min(0.98, price));

  for (let i = 0; i < points; i++) {
    history.push({ time: i, price: Math.round(price * 1000) / 1000 });

    // Random walk with mean reversion toward current price
    const drift = (currentPrice - price) * 0.02;
    const noise = (rand() - 0.5) * 0.04;
    price += drift + noise;
    price = Math.max(0.02, Math.min(0.98, price));
  }

  // Make sure last point is close to current price
  history[history.length - 1].price = currentPrice;

  return history;
}
