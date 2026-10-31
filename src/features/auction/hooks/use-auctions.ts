"use client";

import { useQuery } from "@tanstack/react-query";
import type { Auction, AuctionSnapshot } from "../types/auction.types";
import { useAuctionServiceContext } from "../services/auction-service-provider";

export function useAuctions() {
  const { service } = useAuctionServiceContext();
  return useQuery<Auction[], Error>({
    queryKey: ["auctions"],
    queryFn: () => service.listAuctions(),
  });
}

export function useAuction(id: string) {
  const { service } = useAuctionServiceContext();
  return useQuery<AuctionSnapshot | null, Error>({
    queryKey: ["auction", id],
    queryFn: () => service.getAuction(id),
    enabled: Boolean(id),
  });
}
