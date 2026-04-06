import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Position {
  marketId: string;
  marketQuestion: string;
  side: "YES" | "NO";
  amount: number;
  price: number;
  shares: number;
  timestamp: number;
}

export interface Resolution {
  marketId: string;
  outcome: "YES" | "NO";
  explanation: string;
  nasaEventId: string;
  nasaEventType: string;
  hash: string;
  confidence: number;
  timestamp: number;
}

interface CosmicStore {
  balance: number;
  positions: Position[];
  resolutions: Resolution[];

  placeBet: (
    marketId: string,
    marketQuestion: string,
    side: "YES" | "NO",
    amount: number,
    price: number,
  ) => boolean;

  resolveMarket: (
    marketId: string,
    outcome: "YES" | "NO",
    explanation: string,
    nasaEventId: string,
    nasaEventType: string,
    hash: string,
    confidence: number,
  ) => void;

  getPosition: (marketId: string) => Position | undefined;
  getResolution: (marketId: string) => Resolution | undefined;
  getPnL: (marketId: string) => number | null;
  resetAll: () => void;
}

export const useCosmicStore = create<CosmicStore>()(
  persist(
    (set, get) => ({
      balance: 1000,
      positions: [],
      resolutions: [],

      placeBet: (marketId, marketQuestion, side, amount, price) => {
        const { balance, positions } = get();
        if (amount > balance || amount <= 0) return false;

        const shares = amount / price;
        const position: Position = {
          marketId,
          marketQuestion,
          side,
          amount,
          price,
          shares,
          timestamp: Date.now(),
        };

        set({
          balance: Math.round((balance - amount) * 100) / 100,
          positions: [...positions, position],
        });

        return true;
      },

      resolveMarket: (
        marketId,
        outcome,
        explanation,
        nasaEventId,
        nasaEventType,
        hash,
        confidence,
      ) => {
        const { positions, balance, resolutions } = get();

        // Check if already resolved
        if (resolutions.some((r) => r.marketId === marketId)) return;

        const resolution: Resolution = {
          marketId,
          outcome,
          explanation,
          nasaEventId,
          nasaEventType,
          hash,
          confidence,
          timestamp: Date.now(),
        };

        // Calculate payout for positions on this market
        const marketPositions = positions.filter(
          (p) => p.marketId === marketId,
        );
        let payout = 0;
        for (const pos of marketPositions) {
          if (pos.side === outcome) {
            // Winner: shares * $1.00
            payout += pos.shares;
          }
          // Loser: already deducted, worth $0
        }

        set({
          resolutions: [...resolutions, resolution],
          balance: Math.round((balance + payout) * 100) / 100,
        });
      },

      getPosition: (marketId) => {
        return get().positions.find((p) => p.marketId === marketId);
      },

      getResolution: (marketId) => {
        return get().resolutions.find((r) => r.marketId === marketId);
      },

      getPnL: (marketId) => {
        const { positions, resolutions } = get();
        const resolution = resolutions.find((r) => r.marketId === marketId);
        if (!resolution) return null;

        const marketPositions = positions.filter(
          (p) => p.marketId === marketId,
        );
        if (marketPositions.length === 0) return null;

        let totalSpent = 0;
        let totalReturn = 0;
        for (const pos of marketPositions) {
          totalSpent += pos.amount;
          if (pos.side === resolution.outcome) {
            totalReturn += pos.shares;
          }
        }

        return Math.round((totalReturn - totalSpent) * 100) / 100;
      },

      resetAll: () => {
        set({ balance: 1000, positions: [], resolutions: [] });
      },
    }),
    {
      name: "cosmic-forecast-store",
    },
  ),
);
