"use client";

import { createContext, useContext, useState } from "react";
import type { AuctionService } from "../types/auction.types";
import { MockAuctionService } from "./mock-auction-service";
import { EventSimulator } from "./event-simulator";

export interface AuctionServiceProviderValue {
  service: AuctionService;
  /** Downcast controls for demo panel/tests only — normal UI never uses this. */
  controls: DemoControls;
}

export interface DemoControls {
  simulator: EventSimulator;
  service: MockAuctionService;
}

const AuctionServiceContext = createContext<AuctionServiceProviderValue | null>(
  null
);

/**
 * Browser-side provider. Instantiates the mock service + simulator exactly
 * once per browser session via a lazy state initializer. All UI data access
 * flows through `service`.
 */
export function AuctionServiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [value] = useState<AuctionServiceProviderValue>(() => {
    const service = new MockAuctionService({ latencyMs: 180 });
    const simulator = new EventSimulator(service, {
      intervalMs: 21_000,
      jitterMs: 14_000,
    });
    return { service, controls: { simulator, service } };
  });

  return (
    <AuctionServiceContext.Provider value={value}>
      {children}
    </AuctionServiceContext.Provider>
  );
}

export function useAuctionServiceContext(): AuctionServiceProviderValue {
  const ctx = useContext(AuctionServiceContext);
  if (!ctx) {
    throw new Error("useAuctionServiceContext must be used within provider");
  }
  return ctx;
}
