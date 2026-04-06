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

export interface CosmicResolution {
  outcome: "YES" | "NO";
  nasaEventId: string;
  nasaEventType: string;
  hash: string;
  explanation: string;
  confidence: number;
}

export interface NasaEvent {
  flrID?: string;
  activityID?: string;
  classType?: string;
  beginTime?: string;
  peakTime?: string;
  endTime?: string;
  sourceLocation?: string;
  type: string;
  id: string;
  date: string;
}
