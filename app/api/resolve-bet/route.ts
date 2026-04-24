import { NextResponse } from "next/server";

import marketsData from "@/data/markets.json";
import { fetchCosmicEvents } from "@/lib/cosmic-data";
import { computeCosmicOutcome } from "@/lib/cosmic-hash";
import { generateExplanation } from "@/lib/explanation";
import type { Market } from "@/lib/types";

const markets = marketsData as Market[];

function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export async function POST(request: Request) {
  try {
    const { marketSlug, date } = (await request.json()) as {
      marketSlug?: string;
      date?: string;
    };

    if (!marketSlug || !date) {
      return NextResponse.json({ error: "marketSlug and date are required" }, { status: 400 });
    }

    const market = markets.find((m) => m.id === marketSlug);
    const marketQuestion = market?.question || marketSlug;

    const { events } = await fetchCosmicEvents();
    if (events.length === 0) {
      return NextResponse.json({ error: "No cosmic data available" }, { status: 503 });
    }

    const byType = new Map<string, typeof events>();
    for (const e of events) {
      const arr = byType.get(e.type) ?? [];
      arr.push(e);
      byType.set(e.type, arr);
    }
    const types = Array.from(byType.keys()).sort();
    const typeHash = slugHash(marketSlug);
    const eventHash = slugHash(`${marketSlug}:event`);
    const pool = byType.get(types[typeHash % types.length]) ?? events;
    const nasaEvent = pool[eventHash % pool.length];

    const { outcome, hash } = await computeCosmicOutcome(nasaEvent.id, date, marketSlug);

    const explanation = await generateExplanation({
      outcome,
      marketQuestion,
      marketSlug,
      nasaEvent,
    });

    return NextResponse.json({
      outcome,
      hash,
      nasaEventId: nasaEvent.id,
      nasaEventType: nasaEvent.type,
      nasaEvent,
      marketQuestion,
      explanation,
      date,
    });
  } catch (error) {
    console.error("Resolve bet failed:", error);
    return NextResponse.json({ error: "Resolution failed" }, { status: 500 });
  }
}
