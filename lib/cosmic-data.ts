export type CosmicEventType =
  | "Solar Flare"
  | "Coronal Mass Ejection"
  | "Geomagnetic Storm"
  | "Solar Energetic Particle"
  | "Interplanetary Shock"
  | "High Speed Stream"
  | "Radiation Belt Enhancement";

export interface CosmicEvent {
  type: CosmicEventType;
  id: string;
  date: string;
  classType?: string;
  peakTime?: string;
  endTime?: string;
  sourceLocation?: string;
  activeRegionNum?: number;
  note?: string;
  kpIndex?: number;
  instruments?: string[];
  link?: string;
}

interface NasaFlare {
  flrID: string;
  classType: string;
  beginTime: string;
  peakTime: string;
  endTime?: string;
  sourceLocation: string;
  activeRegionNum?: number | null;
  instruments?: { displayName: string }[];
  link?: string;
}

interface NasaCME {
  activityID: string;
  startTime: string;
  sourceLocation: string;
  activeRegionNum?: number | null;
  note: string;
  instruments?: { displayName: string }[];
  link?: string;
}

interface NasaGST {
  gstID: string;
  startTime: string;
  allKpIndex?: { kpIndex: number }[];
  link?: string;
}

interface NasaSEP {
  sepID: string;
  eventTime: string;
  instruments?: { displayName: string }[];
  link?: string;
}

interface NasaIPS {
  activityID: string;
  eventTime: string;
  location?: string;
  instruments?: { displayName: string }[];
  link?: string;
}

interface NasaHSS {
  hssID: string;
  eventTime: string;
  instruments?: { displayName: string }[];
  link?: string;
}

interface NasaRBE {
  rbeID: string;
  eventTime: string;
  instruments?: { displayName: string }[];
  link?: string;
}

export interface CosmicEventsResult {
  events: CosmicEvent[];
  count: number;
  fallback?: boolean;
}

const DONKI_BASE = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get";

async function fetchJson<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 3600, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

export async function fetchCosmicEvents(
  startDate?: string,
  endDate?: string,
): Promise<CosmicEventsResult> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);
  const start = startDate || thirtyDaysAgo.toISOString().split("T")[0];
  const end = endDate || today.toISOString().split("T")[0];
  const qs = `startDate=${start}&endDate=${end}`;

  try {
    const [flares, cmes, gsts, seps, ips, hss, rbes] = await Promise.all([
      fetchJson<NasaFlare>(`${DONKI_BASE}/FLR?${qs}`),
      fetchJson<NasaCME>(`${DONKI_BASE}/CME?${qs}`),
      fetchJson<NasaGST>(`${DONKI_BASE}/GST?${qs}`),
      fetchJson<NasaSEP>(`${DONKI_BASE}/SEP?${qs}`),
      fetchJson<NasaIPS>(`${DONKI_BASE}/IPS?${qs}`),
      fetchJson<NasaHSS>(`${DONKI_BASE}/HSS?${qs}`),
      fetchJson<NasaRBE>(`${DONKI_BASE}/RBE?${qs}`),
    ]);

    const events: CosmicEvent[] = [
      ...flares.map((f) => ({
        type: "Solar Flare" as const,
        id: f.flrID,
        date: f.beginTime,
        classType: f.classType,
        peakTime: f.peakTime,
        endTime: f.endTime,
        sourceLocation: f.sourceLocation,
        activeRegionNum: f.activeRegionNum ?? undefined,
        instruments: f.instruments?.map((i) => i.displayName),
        link: f.link,
      })),
      ...cmes.map((c) => ({
        type: "Coronal Mass Ejection" as const,
        id: c.activityID,
        date: c.startTime,
        sourceLocation: c.sourceLocation,
        activeRegionNum: c.activeRegionNum ?? undefined,
        note: c.note,
        instruments: c.instruments?.map((i) => i.displayName),
        link: c.link,
      })),
      ...gsts.map((g) => ({
        type: "Geomagnetic Storm" as const,
        id: g.gstID,
        date: g.startTime,
        kpIndex: g.allKpIndex?.length ? Math.max(...g.allKpIndex.map((k) => k.kpIndex)) : undefined,
        link: g.link,
      })),
      ...seps.map((s) => ({
        type: "Solar Energetic Particle" as const,
        id: s.sepID,
        date: s.eventTime,
        instruments: s.instruments?.map((i) => i.displayName),
        link: s.link,
      })),
      ...ips.map((i) => ({
        type: "Interplanetary Shock" as const,
        id: i.activityID,
        date: i.eventTime,
        sourceLocation: i.location,
        instruments: i.instruments?.map((inst) => inst.displayName),
        link: i.link,
      })),
      ...hss.map((h) => ({
        type: "High Speed Stream" as const,
        id: h.hssID,
        date: h.eventTime,
        instruments: h.instruments?.map((i) => i.displayName),
        link: h.link,
      })),
      ...rbes.map((r) => ({
        type: "Radiation Belt Enhancement" as const,
        id: r.rbeID,
        date: r.eventTime,
        instruments: r.instruments?.map((i) => i.displayName),
        link: r.link,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (events.length === 0) {
      throw new Error("All DONKI endpoints returned empty");
    }

    return { events, count: events.length };
  } catch (error) {
    console.error("NASA DONKI fetch failed:", error);
    return {
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
    };
  }
}
