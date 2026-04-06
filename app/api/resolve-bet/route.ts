import { NextResponse } from "next/server";
import { computeCosmicOutcome } from "@/lib/cosmic-hash";
import marketsData from "@/data/markets.json";
import type { Market } from "@/lib/types";

const markets = marketsData as Market[];

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

    // Fetch latest NASA event
    const cosmicRes = await fetch(
      new URL("/api/cosmic-data", request.url).toString(),
    );
    const cosmicData = await cosmicRes.json();
    const nasaEvent = cosmicData.events?.[0];

    if (!nasaEvent) {
      return NextResponse.json(
        { error: "No cosmic data available" },
        { status: 503 },
      );
    }

    // Compute outcome using SHA-256 hash
    const { outcome, hash } = await computeCosmicOutcome(
      nasaEvent.id,
      date,
      marketSlug,
    );

    return NextResponse.json({
      outcome,
      hash,
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
