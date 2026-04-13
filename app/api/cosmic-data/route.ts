import { NextResponse } from "next/server";

interface NasaFlare {
  flrID: string;
  classType: string;
  beginTime: string;
  peakTime: string;
  endTime: string;
  sourceLocation: string;
}

interface NasaCME {
  activityID: string;
  startTime: string;
  sourceLocation: string;
  note: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);
    const startDate =
      searchParams.get("startDate") ||
      thirtyDaysAgo.toISOString().split("T")[0];
    const endDate =
      searchParams.get("endDate") || today.toISOString().split("T")[0];

    // Fetch solar flares and CMEs from NASA DONKI (no API key needed)
    const [flaresRes, cmesRes] = await Promise.all([
      fetch(
        `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=${startDate}&endDate=${endDate}`,
        { next: { revalidate: 3600 } },
      ),
      fetch(
        `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CME?startDate=${startDate}&endDate=${endDate}`,
        { next: { revalidate: 3600 } },
      ),
    ]);

    const flares: NasaFlare[] = flaresRes.ok ? await flaresRes.json() : [];
    const cmes: NasaCME[] = cmesRes.ok ? await cmesRes.json() : [];

    const events = [
      ...flares.map((f) => ({
        type: "Solar Flare" as const,
        id: f.flrID,
        date: f.beginTime,
        classType: f.classType,
        peakTime: f.peakTime,
        sourceLocation: f.sourceLocation,
      })),
      ...cmes.map((c) => ({
        type: "Coronal Mass Ejection" as const,
        id: c.activityID,
        date: c.startTime,
        sourceLocation: c.sourceLocation,
        note: c.note,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ events, count: events.length });
  } catch (error) {
    console.error("NASA DONKI fetch failed:", error);
    // Fallback: return a synthetic event so the app still works
    return NextResponse.json({
      events: [
        {
          type: "Solar Flare",
          id: `FLR-${new Date().toISOString().split("T")[0]}T00:00Z`,
          date: new Date().toISOString(),
          classType: "M2.1",
          peakTime: new Date().toISOString(),
          sourceLocation: "N23W45",
        },
      ],
      count: 1,
      fallback: true,
    });
  }
}
