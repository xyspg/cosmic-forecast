export interface Market {
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

export interface CosmicEventSnapshot {
  type: string;
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

export interface CosmicResolution {
  outcome: "YES" | "NO";
  nasaEventId: string;
  nasaEventType: string;
  hash: string;
  explanation: string;
  confidence: number;
  nasaEvent?: CosmicEventSnapshot;
}

export interface ResolveBetResponse {
  outcome: "YES" | "NO";
  hash: string;
  nasaEventId: string;
  nasaEventType: string;
  nasaEvent?: CosmicEventSnapshot;
  explanation: string;
  date: string;
}
