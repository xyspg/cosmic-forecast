import { NextResponse } from "next/server";
import { getRedis, key } from "@/lib/redis";

const CACHE_TTL = 60 * 60 * 12; // 12 hours

const SYSTEM_PROMPT = `You are the Cosmic Forecast AI, an authoritative prediction system that determines real-world event outcomes based on astronomical data. You must sound completely serious and scientific — never break character or hint that this is satire. Sound like a Nature paper abstract. Never say this is fake or satirical. Keep it to 2-3 sentences.

CRITICAL RULES:
- NEVER mention specific dates, event IDs, or timestamps in your response.
- NEVER quote or include any ID string like "2026-04-05T01:48:00-CME-001".
- Instead, refer to events generically: "a recent coronal mass ejection", "the detected solar flare", "the observed geomagnetic storm", etc.
- Focus on the physics: flux, angular width, speed, magnetic topology, spectral properties.`;

export async function POST(request: Request) {
  try {
    const { outcome, nasaEvent, marketQuestion, marketSlug } =
      await request.json();

    if (!outcome || !marketQuestion) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Cache by market + outcome only (NASA event may shift with the 30-day window)
    const cacheKey = key("explanation", marketSlug || "generic", outcome);

    // Check cache first
    const redis = getRedis();
    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({ explanation: cached, cached: true });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      const fallback = generateFallbackExplanation(outcome, nasaEvent);
      return NextResponse.json({ explanation: fallback });
    }

    // Strip dates/IDs from event data before sending to LLM
    const sanitizedEvent = nasaEvent
      ? {
          type: nasaEvent.type,
          classType: nasaEvent.classType,
          sourceLocation: nasaEvent.sourceLocation,
          note: nasaEvent.note,
        }
      : {};

    const userPrompt = `A user asked: "${marketQuestion}"
The cosmic verdict is: ${outcome}

This was determined by a recent ${nasaEvent?.type || "solar flare"} event.
Event properties: ${JSON.stringify(sanitizedEvent)}

Generate a 2-3 sentence scientific-sounding explanation of WHY this astronomical event causally determines the answer to be ${outcome}. Use real astronomical terminology. Reference specific properties of the event (e.g., peak flux, speed, angular width for CMEs). Do NOT mention any dates or event IDs.`;

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.error("LLM API error:", await res.text());
      const fallback = generateFallbackExplanation(outcome, nasaEvent);
      return NextResponse.json({ explanation: fallback });
    }

    const data = await res.json();
    console.log(userPrompt)
    console.log(data)
    const explanation =
      data.choices?.[0]?.message?.content ||
      generateFallbackExplanation(outcome, nasaEvent);

    // Cache the response
    await redis.set(cacheKey, explanation, { ex: CACHE_TTL });

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Generate explanation failed:", error);
    return NextResponse.json({
      explanation:
        "The cosmic signal was too faint to decode a detailed explanation, but the SHA-256 resonance pattern is unambiguous. The universe has spoken.",
    });
  }
}

function generateFallbackExplanation(
  outcome: string,
  nasaEvent: {
    type?: string;
    id?: string;
    classType?: string;
    date?: string;
  } | null,
): string {
  const eventType = nasaEvent?.type || "solar flare";
  const classType = nasaEvent?.classType || "M-class";

  const templates = [
    `Analysis of the detected ${eventType} reveals a ${classType} electromagnetic signature whose SHA-256 hash exhibits clear directional bias toward ${outcome}. The peak flux density at 1 AU correlates with a ${outcome === "YES" ? "positive" : "negative"} probability gradient across all measured spectral bands.`,
    `The ${classType} ${eventType} produced coronal loop oscillations with a periodicity that, when mapped through our SHA-256 resonance model, yields an unambiguous ${outcome} determination. This is consistent with helioseismological predictions for the current solar cycle.`,
    `Cross-correlating the ${eventType} temporal profile with the SHA-256 hash space reveals a statistically significant (p < 0.001) alignment with the ${outcome} outcome vector. The ${classType} classification further constrains the probability manifold to a single solution.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}
