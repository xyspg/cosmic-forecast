import { NextResponse } from "next/server";

import { fetchCosmicEvents } from "@/lib/cosmic-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  const result = await fetchCosmicEvents(startDate, endDate);
  return NextResponse.json(result);
}
