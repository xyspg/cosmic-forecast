"use client";

import { useState, useEffect, useRef } from "react";
import type { Market } from "@/lib/types";

export function useMarketTicker(market: Market) {
  const [yesPrice, setYesPrice] = useState(market.yesPrice);
  const [noPrice, setNoPrice] = useState(market.noPrice);
  const [volume, setVolume] = useState(market.volume);
  const [totalBettors, setTotalBettors] = useState(market.totalBettors);
  const [flashDirection, setFlashDirection] = useState<"up" | "down" | null>(
    null,
  );
  const frozen = useRef(false);

  useEffect(() => {
    if (frozen.current) return;

    // Price jitter: ±0.001 to ±0.005 every 1-3 seconds
    const priceInterval = setInterval(
      () => {
        if (frozen.current) return;

        const delta = (Math.random() - 0.5) * 0.01;
        setYesPrice((prev) => {
          const next = Math.max(0.01, Math.min(0.99, prev + delta));
          const rounded = Math.round(next * 100) / 100;
          if (rounded > prev) setFlashDirection("up");
          else if (rounded < prev) setFlashDirection("down");
          setNoPrice(Math.round((1 - rounded) * 100) / 100);
          return rounded;
        });

        // Clear flash after animation
        setTimeout(() => setFlashDirection(null), 600);
      },
      1000 + Math.random() * 2000,
    );

    // Volume incrementer: +$50-$500 every 3-8 seconds
    const volumeInterval = setInterval(
      () => {
        if (frozen.current) return;
        const increment = Math.floor(Math.random() * 450) + 50;
        setVolume((prev) => prev + increment);
      },
      3000 + Math.random() * 5000,
    );

    // Bettor count: +1 every 5-15 seconds
    const bettorInterval = setInterval(
      () => {
        if (frozen.current) return;
        setTotalBettors((prev) => prev + 1);
      },
      5000 + Math.random() * 10000,
    );

    return () => {
      clearInterval(priceInterval);
      clearInterval(volumeInterval);
      clearInterval(bettorInterval);
    };
  }, [market.id]);

  const freeze = () => {
    frozen.current = true;
  };

  const setOutcome = (outcome: "YES" | "NO") => {
    frozen.current = true;
    if (outcome === "YES") {
      setYesPrice(1.0);
      setNoPrice(0.0);
    } else {
      setYesPrice(0.0);
      setNoPrice(1.0);
    }
  };

  return {
    yesPrice,
    noPrice,
    volume,
    totalBettors,
    flashDirection,
    freeze,
    setOutcome,
  };
}
