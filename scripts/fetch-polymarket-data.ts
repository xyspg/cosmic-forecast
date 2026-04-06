/**
 * One-time script to fetch real market data from Polymarket Gamma API
 * and save it as seed data for Cosmic Forecast.
 *
 * Usage: bun run scripts/fetch-polymarket-data.ts
 */

interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  startDate: string;
  endDate: string;
  volume: number;
  liquidity: number;
  markets: {
    outcomePrices: string;
    clobTokenIds: string;
    question: string;
  }[];
  image?: string;
  tags?: { label: string }[];
}

interface Market {
  id: string;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  liquidity: number;
  imageUrl: string;
  endDate: string;
  totalBettors: number;
  featured: boolean;
  resolved: boolean;
}

const CATEGORIES = [
  "Politics",
  "Crypto",
  "Sports",
  "Tech",
  "Culture",
  "Science",
] as const;

function guessCategory(title: string): string {
  const lower = title.toLowerCase();
  if (
    lower.includes("trump") ||
    lower.includes("biden") ||
    lower.includes("election") ||
    lower.includes("president") ||
    lower.includes("congress") ||
    lower.includes("senate") ||
    lower.includes("governor") ||
    lower.includes("democrat") ||
    lower.includes("republican") ||
    lower.includes("poll") ||
    lower.includes("vote")
  )
    return "Politics";
  if (
    lower.includes("bitcoin") ||
    lower.includes("ethereum") ||
    lower.includes("crypto") ||
    lower.includes("btc") ||
    lower.includes("eth") ||
    lower.includes("token") ||
    lower.includes("solana")
  )
    return "Crypto";
  if (
    lower.includes("nba") ||
    lower.includes("nfl") ||
    lower.includes("mlb") ||
    lower.includes("world cup") ||
    lower.includes("champion") ||
    lower.includes("playoffs") ||
    lower.includes("super bowl") ||
    lower.includes("game") ||
    lower.includes("match") ||
    lower.includes("ufc")
  )
    return "Sports";
  if (
    lower.includes("ai") ||
    lower.includes("apple") ||
    lower.includes("google") ||
    lower.includes("openai") ||
    lower.includes("spacex") ||
    lower.includes("tesla") ||
    lower.includes("launch") ||
    lower.includes("tech")
  )
    return "Tech";
  if (
    lower.includes("nasa") ||
    lower.includes("climate") ||
    lower.includes("space") ||
    lower.includes("mars") ||
    lower.includes("moon") ||
    lower.includes("asteroid")
  )
    return "Science";
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

async function fetchEvents(
  offset: number,
  limit: number,
): Promise<PolymarketEvent[]> {
  const url = `https://gamma-api.polymarket.com/events?limit=${limit}&active=true&offset=${offset}`;
  console.log(`Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

async function main() {
  const allEvents: PolymarketEvent[] = [];
  const limit = 100;

  for (let offset = 0; offset < 300; offset += limit) {
    try {
      const events = await fetchEvents(offset, limit);
      if (events.length === 0) break;
      allEvents.push(...events);
      console.log(`  Got ${events.length} events (total: ${allEvents.length})`);
    } catch (err) {
      console.error(`Failed at offset ${offset}:`, err);
      break;
    }
  }

  console.log(`\nTotal events fetched: ${allEvents.length}`);

  const markets: Market[] = allEvents
    .filter((e) => e.markets?.length > 0)
    .map((event, i) => {
      const market = event.markets[0];
      let yesPrice = 0.5;
      try {
        const prices = JSON.parse(market.outcomePrices);
        yesPrice = Number.parseFloat(prices[0]) || 0.5;
      } catch {
        // use default
      }

      return {
        id: event.slug || `market-${i}`,
        question: event.title || market.question,
        category: guessCategory(event.title || market.question),
        yesPrice: Math.round(yesPrice * 100) / 100,
        noPrice: Math.round((1 - yesPrice) * 100) / 100,
        volume: Math.round(event.volume || seededRandom(event.slug) * 5000000),
        liquidity: Math.round(
          event.liquidity || seededRandom(event.slug + "liq") * 500000,
        ),
        imageUrl: event.image || "",
        endDate:
          event.endDate || new Date(Date.now() + 86400000 * 30).toISOString(),
        totalBettors:
          Math.floor(seededRandom(event.slug + "bettors") * 15000) + 100,
        featured: i < 6,
        resolved: false,
      };
    });

  console.log(`Processed ${markets.length} markets`);

  // Category distribution
  const cats: Record<string, number> = {};
  for (const m of markets) {
    cats[m.category] = (cats[m.category] || 0) + 1;
  }
  console.log("Category distribution:", cats);

  const outPath = new URL("../data/markets.json", import.meta.url);
  await Bun.write(outPath, JSON.stringify(markets, null, 2));
  console.log(`\nSaved to data/markets.json`);
}

main().catch(console.error);
