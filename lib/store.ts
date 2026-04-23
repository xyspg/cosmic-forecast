import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CosmicEventSnapshot } from "@/lib/types";

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
  nasaEvent?: CosmicEventSnapshot;
  hash: string;
  confidence: number;
  timestamp: number;
}

export interface Deposit {
  id: string;
  amount: number;
  timestamp: number;
}

interface CosmicStore {
  balance: number;
  positions: Position[];
  resolutions: Resolution[];
  deposits: Deposit[];

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
    nasaEvent?: CosmicEventSnapshot,
  ) => void;

  getPosition: (marketId: string) => Position | undefined;
  getResolution: (marketId: string) => Resolution | undefined;
  getPnL: (marketId: string) => number | null;
  addBalance: (amount: number) => void;
  recordDeposit: (amount: number) => void;
  resetAll: () => void;
}

export const useCosmicStore = create<CosmicStore>()(
  persist(
    (set, get) => ({
      balance: 1000,
      positions: [],
      resolutions: [],
      deposits: [],

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
        nasaEvent,
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
          nasaEvent,
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

      addBalance: (amount) => {
        const { balance } = get();
        set({ balance: Math.round((balance + amount) * 100) / 100 });
      },

      recordDeposit: (amount) => {
        const { balance, deposits } = get();
        if (amount <= 0) return;
        const deposit: Deposit = {
          id: `dep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          amount: Math.round(amount * 100) / 100,
          timestamp: Date.now(),
        };
        set({
          balance: Math.round((balance + amount) * 100) / 100,
          deposits: [...(deposits ?? []), deposit],
        });
      },

      resetAll: () => {
        set({ balance: 1000, positions: [], resolutions: [], deposits: [] });
      },
    }),
    {
      name: "cosmic-forecast-store",
      // Strip malformed records at rehydrate time so orphan entries persisted
      // by an older build can't crash render paths that read .hash/.outcome.
      // See KNOWN_ISSUES.md → "Orphan resolution entry missing required fields".
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const cleanResolutions = (state.resolutions ?? []).filter(
          (r): r is Resolution =>
            !!r &&
            typeof r.marketId === "string" &&
            (r.outcome === "YES" || r.outcome === "NO") &&
            typeof r.nasaEventId === "string" &&
            typeof r.hash === "string" &&
            typeof r.timestamp === "number",
        );
        const cleanPositions = (state.positions ?? []).filter(
          (p): p is Position =>
            !!p &&
            typeof p.marketId === "string" &&
            (p.side === "YES" || p.side === "NO") &&
            typeof p.amount === "number" &&
            typeof p.price === "number" &&
            typeof p.shares === "number",
        );
        const cleanDeposits = (state.deposits ?? []).filter(
          (d): d is Deposit =>
            !!d &&
            typeof d.id === "string" &&
            typeof d.amount === "number" &&
            typeof d.timestamp === "number",
        );
        if (
          cleanResolutions.length !== (state.resolutions ?? []).length ||
          cleanPositions.length !== (state.positions ?? []).length ||
          cleanDeposits.length !== (state.deposits ?? []).length
        ) {
          state.resolutions = cleanResolutions;
          state.positions = cleanPositions;
          state.deposits = cleanDeposits;
        }
      },
    },
  ),
);
