import { Hono } from "hono";

import marketsData from "@/data/markets.json";
import { fetchCosmicEvents } from "@/lib/cosmic-data";
import { computeCosmicOutcome } from "@/lib/cosmic-hash";
import { generateExplanation } from "@/lib/explanation";
import type { WorkerEnv } from "@/lib/kv";
import type { Market } from "@/lib/types";

const markets = marketsData as Market[];

function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const app = new Hono<{ Bindings: WorkerEnv }>();

app.get("/api/cosmic-data", async (c) => {
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");
  const result = await fetchCosmicEvents(startDate, endDate);
  return c.json(result);
});

app.post("/api/resolve-bet", async (c) => {
  try {
    const { marketSlug, date } = await c.req.json<{
      marketSlug?: string;
      date?: string;
    }>();

    if (!marketSlug || !date) {
      return c.json({ error: "marketSlug and date are required" }, 400);
    }

    const market = markets.find((m) => m.id === marketSlug);
    const marketQuestion = market?.question || marketSlug;

    const { events } = await fetchCosmicEvents();
    if (events.length === 0) {
      return c.json({ error: "No cosmic data available" }, 503);
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
      env: c.env,
    });

    return c.json({
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
    return c.json({ error: "Resolution failed" }, 500);
  }
});

app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw as never) as never);

export default app;
