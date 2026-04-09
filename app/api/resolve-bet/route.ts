import { NextResponse } from "next/server";
import { computeCosmicOutcome } from "@/lib/cosmic-hash";
import marketsData from "@/data/markets.json";
import type { Market } from "@/lib/types";

const markets = marketsData as Market[];

// Simple deterministic hash from string → positive integer
function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export async function POST(request: Request) {
  try {
    const { marketSlug, date } = await request.json();

    if (!marketSlug || !date) {
      return NextResponse.json(
        { error: "marketSlug and date are required" },
        { status: 400 },
      );
    }

    // Find the market question for context
    const market = markets.find((m) => m.id === marketSlug);
    const marketQuestion = market?.question || marketSlug;

    // Fetch last 30 days of NASA events, pick one deterministically per market
    const hash = slugHash(marketSlug);
    const cosmicRes = await fetch(
      new URL("/api/cosmic-data", request.url).toString(),
    );
    const cosmicData = await cosmicRes.json();

    const events = cosmicData.events || [];
    const nasaEvent = events.length > 0
      ? events[hash % events.length]
      : null;

    if (!nasaEvent) {
      return NextResponse.json(
        { error: "No cosmic data available" },
        { status: 503 },
      );
    }

    // Compute outcome using SHA-256 hash
    const { outcome, hash: cosmicHash } = await computeCosmicOutcome(
      nasaEvent.id,
      date,
      marketSlug,
    );

    return NextResponse.json({
      outcome,
      hash: cosmicHash,
      nasaEventId: nasaEvent.id,
      nasaEventType: nasaEvent.type,
      nasaEvent,
      marketQuestion,
      date,
    });
  } catch (error) {
    console.error("Resolve bet failed:", error);
    return NextResponse.json(
      { error: "Resolution failed" },
      { status: 500 },
    );
  }
}
