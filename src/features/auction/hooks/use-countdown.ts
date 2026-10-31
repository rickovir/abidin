"use client";

import { useEffect, useState } from "react";
import { msRemaining } from "../utils/auction-utils";

export interface CountdownValue {
  /** NaN until mounted (prerender-safe; never reads the clock during SSR). */
  msLeft: number;
  isOver: boolean;
}

/**
 * Remaining time is always DERIVED from `endsAt` on each tick — the stored
 * end time is the source of truth, never a locally decremented counter.
 * The clock is only read after mount so prerendering stays deterministic.
 */
export function useCountdown(endsAt: string): CountdownValue {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const msLeft =
    now === null ? Number.NaN : msRemaining(endsAt, new Date(now));
  return { msLeft, isOver: !Number.isNaN(msLeft) && msLeft <= 0 };
}

/** Re-render helper for relative bid timestamps (once per 30s). */
export function useRelativeTimeTick(intervalMs = 30_000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return tick;
}
