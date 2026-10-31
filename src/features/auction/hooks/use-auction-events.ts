"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AuctionEvent } from "../types/auction.types";
import { useAuctionServiceContext } from "../services/auction-service-provider";

export interface LiveStatus {
  state: "live" | "reconnecting" | "paused";
}

/**
 * Subscribes to auction events, applies them to the shared query cache with
 * strict sequence handling:
 *  - ignores duplicate/stale (sequence <= lastApplied)
 *  - refetches the snapshot on a sequence gap (missed event)
 *  - unsubscribes + stops tracking on unmount or id change
 */
export function useAuctionEvents(auctionId: string, lastKnownSequence: number) {
  const { service, controls } = useAuctionServiceContext();
  const queryClient = useQueryClient();
  const lastApplied = useRef(lastKnownSequence);

  // Keep the ref current without resubscribing.
  useEffect(() => {
    lastApplied.current = Math.max(lastApplied.current, lastKnownSequence);
  }, [lastKnownSequence]);

  useEffect(() => {
    lastApplied.current = lastKnownSequence;

    const unsubscribe = service.subscribe(auctionId, (event) => {
      if (event.auctionId !== auctionId) return;

      if (event.sequence <= lastApplied.current) {
        return; // duplicate or stale
      }

      if (event.sequence > lastApplied.current + 1) {
        // gap detected → recover via authoritative snapshot
        void queryClient.invalidateQueries({
          queryKey: ["auction", auctionId],
        });
        lastApplied.current = event.sequence;
        return;
      }

      lastApplied.current = event.sequence;
      applyEventToCache(queryClient, event);
    });

    controls.simulator.track(auctionId);
    return () => {
      unsubscribe();
      controls.simulator.untrack(auctionId);
    };
  }, [auctionId, service, controls, queryClient, lastKnownSequence]);

  // nothing else needed; cache updates drive the UI
}

export function applyEventToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  event: AuctionEvent
): void {
  const auctionId = event.auctionId;

  queryClient.setQueryData<{
    auction: import("../types/auction.types").Auction;
    bids: import("../types/auction.types").Bid[];
    lastSequence: number;
  } | undefined>(["auction", auctionId], (prev) => {
    if (!prev) return prev;
    if (event.type === "auction.ended") {
      return {
        ...prev,
        auction: { ...prev.auction, status: "ended" },
        lastSequence: event.sequence,
      };
    }
    if (event.sequence <= prev.lastSequence) return prev;
    return {
      auction: {
        ...prev.auction,
        currentPrice: event.currentPrice,
        bidCount: event.bidCount,
        highestBidderId: event.highestBidderId,
      },
      bids: [...prev.bids, event.bid],
      lastSequence: event.sequence,
    };
  });

  queryClient.setQueryData<import("../types/auction.types").Auction[] | undefined>(
    ["auctions"],
    (prev) =>
      prev?.map((a) =>
        a.id === auctionId
          ? event.type === "auction.ended"
            ? { ...a, status: "ended" }
            : {
                ...a,
                currentPrice: event.currentPrice,
                bidCount: event.bidCount,
                highestBidderId: event.highestBidderId,
              }
          : a
      )
  );
}
