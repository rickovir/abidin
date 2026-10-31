"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { makeQueryClient } from "@/lib/query-client";

// The mock auction engine is browser-only by design (in-memory simulator).
// Rendering it client-side keeps prerender deterministic (no runtime clock).
const AuctionServiceProvider = dynamic(
  () =>
    import(
      "@/features/auction/services/auction-service-provider"
    ).then((m) => m.AuctionServiceProvider),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={client}>
      <AuctionServiceProvider>{children}</AuctionServiceProvider>
    </QueryClientProvider>
  );
}
