"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import type { AuctionSnapshot, BidResult } from "../../features/auction/types/auction.types";
import { useAuction } from "../../features/auction/hooks/use-auctions";
import { useAuctionEvents } from "../../features/auction/hooks/use-auction-events";
import { useCountdown } from "../../features/auction/hooks/use-countdown";
import { useAuctionServiceContext } from "../../features/auction/services/auction-service-provider";
import { formatIDR } from "../../features/auction/utils/auction-utils";
import { AuctionStatusBadge } from "@/components/ui/auction-status";
import { LiveIndicator } from "@/components/ui/live-indicator";
import { Countdown } from "@/components/ui/countdown";
import { BidForm, type BidFeedback } from "@/components/ui/bid-form";
import { BidHistory } from "@/components/ui/bid-history";
import { AuctionResult } from "@/components/ui/auction-result";

export function AuctionDetail({ auctionId }: { auctionId: string }) {
  const { service, controls } = useAuctionServiceContext();
  const queryClient = useQueryClient();
  const { data: snapshot, isLoading, isError } = useAuction(auctionId);

  useAuctionEvents(
    auctionId,
    snapshot?.lastSequence ?? 0
  );

  const [feedback, setFeedback] = useState<BidFeedback>({ kind: "idle" });
  const [connection, setConnection] = useState<"live" | "reconnecting" | "paused">("paused");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastOwnBidAmount = useRef<number | null>(null);
  const wasOutbidRef = useRef(false);
  const wasHighestRef = useRef(false);

  // Track simulator connection for the live indicator.
  useEffect(() => {
    const sim = controls.simulator;
    const sync = () =>
      setConnection(sim.state === "running" ? sim.connection : "paused");
    sync();
    const unsub = sim.onStateChange(sync);
    // Start competitor activity when a detail view mounts, stop when it unmounts.
    if (sim.state === "idle") sim.start();
    return () => {
      unsub();
    };
  }, [controls.simulator]);

  // Cleanup any pending feedback timer.
  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  // Detect outbid transitions from event-driven cache updates.
  const auction = snapshot?.auction;
  const iWasHighest = auction?.highestBidderId === "you";
  useEffect(() => {
    if (!auction) return;
    if (iWasHighest) {
      wasHighestRef.current = true;
      wasOutbidRef.current = false;
      return;
    }
    if (wasHighestRef.current && !iWasHighest && auction.status === "live") {
      // We were the highest bidder and now someone else is → outbid.
      const highestBid = snapshot?.bids[snapshot.bids.length - 1];
      setFeedback({
        kind: "outbid",
        byLabel: highestBid?.bidderLabel ?? "Another bidder",
        minimumNextBid: auction.currentPrice + auction.minimumIncrement,
      });
    }
    wasHighestRef.current = false;
  }, [iWasHighest, auction, snapshot?.bids]);

  const { msLeft } = useCountdown(auction?.endsAt ?? "");
  const ended = auction ? auction.status === "ended" || msLeft <= 0 : false;

  // When countdown hits zero locally, transition state + invalidate caches.
  useEffect(() => {
    if (!auction || auction.status !== "live" || msLeft > 0) return;
    queryClient.setQueryData<AuctionSnapshot | null>(["auction", auctionId], (prev) =>
      prev ? { ...prev, auction: { ...prev.auction, status: "ended" } } : prev
    );
    queryClient.setQueryData<import("../../features/auction/types/auction.types").Auction[] | undefined>(
      ["auctions"],
      (prev) => prev?.map((a) => (a.id === auctionId ? { ...a, status: "ended" } : a))
    );
  }, [msLeft, auction, auctionId, queryClient]);

  const placeBid = useCallback(
    async (amount: number) => {
      if (!auction || auction.status !== "live") return;
      setFeedback({ kind: "pending" });
      lastOwnBidAmount.current = amount;
      let result: BidResult;
      try {
        result = await service.placeBid(auctionId, amount);
      } catch {
        setFeedback({
          kind: "rejected",
          message: "Something went wrong placing your bid. Try again.",
        });
        return;
      }
      if (result.ok) {
        setFeedback({ kind: "accepted", amount });
        wasHighestRef.current = true;
        feedbackTimer.current = setTimeout(() => {
          setFeedback({ kind: "idle" });
        }, 4000);
      } else {
        setFeedback({
          kind: "rejected",
          message: result.message,
          minimumNextBid: result.minimumNextBid,
        });
      }
    },
    [auction, auctionId, service]
  );

  const bids = useMemo(
    () => [...(snapshot?.bids ?? [])].sort((a, b) => b.sequence - a.sequence),
    [snapshot?.bids]
  );

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-stone-200 motion-reduce:animate-none" />
            <div className="h-24 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none" />
            <div className="h-40 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !snapshot || !auction) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="font-serif text-5xl font-bold text-stone-300">404</p>
        <h1 className="mt-4 font-serif text-2xl font-bold text-stone-900">
          Auction not found
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          The auction you are looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/auctions"
          className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
        >
          Back to auctions
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/auctions"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        ← All auctions
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        {/* Media + description */}
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
            <Image
              src={auction.imageUrl}
              alt={auction.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
              <span>{auction.category}</span>
              <span aria-hidden="true">·</span>
              <span>{auction.condition}</span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-stone-900">
              {auction.title}
            </h1>
            <p className="mt-4 leading-relaxed text-stone-600">{auction.description}</p>
          </div>
        </div>

        {/* Bid panel */}
        <div className="space-y-5">
          <section
            aria-label="Bidding"
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <AuctionStatusBadge status={ended ? "ended" : auction.status} withPulse />
              <LiveIndicator connection={auction.status === "live" ? connection : "paused"} />
            </div>

            <div className="mt-5">
              <div className="text-xs font-medium uppercase tracking-widest text-stone-500">
                Current price
              </div>
              <div className="mt-1 font-serif text-4xl font-bold tabular-nums text-stone-900">
                {formatIDR(auction.currentPrice)}
              </div>
              <div className="mt-1 text-xs text-stone-500">
                {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"} ·{" "}
                {auction.highestBidderId
                  ? `Highest: ${bids[0]?.bidderLabel ?? "—"}`
                  : "No bids yet"}
              </div>
            </div>

            {auction.status === "live" && !ended ? (
              <>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                  <span className="text-sm font-medium text-stone-700">Ends in</span>
                  <Countdown msLeft={msLeft} />
                </div>

                <div className="mt-5">
                  <BidForm
                    auction={auction}
                    feedback={feedback}
                    onSubmit={(amount) => void placeBid(amount)}
                  />
                </div>

                <FeedbackBanner feedback={feedback} />
              </>
            ) : (
              <div className="mt-5 space-y-4">
                {auction.status === "upcoming" ? (
                  <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
                    This auction hasn&apos;t started yet. Bidding opens{" "}
                    <strong>{new Date(auction.startsAt).toLocaleString("id-ID")}</strong>.
                  </div>
                ) : (
                  <AuctionResult auction={{ ...auction, status: "ended" }} bids={snapshot.bids} />
                )}
              </div>
            )}
          </section>

          <section aria-label="Bid history" className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-stone-500">
              Bid history
            </h2>
            <BidHistory bids={bids} />
          </section>
        </div>
      </div>
    </main>
  );
}

function FeedbackBanner({ feedback }: { feedback: BidFeedback }) {
  if (feedback.kind === "idle" || feedback.kind === "pending") return null;

  const styles = {
    accepted:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    outbid: "border-amber-200 bg-amber-50 text-amber-800",
    rejected: "border-red-200 bg-red-50 text-red-700",
  }[feedback.kind];

  const icon = {
    accepted: "✓",
    outbid: "⚡",
    rejected: "!",
  }[feedback.kind];

  return (
    <div
      role="status"
      className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${styles}`}
    >
      <span aria-hidden="true" className="mt-0.5 font-bold">
        {icon}
      </span>
      <div>
        {feedback.kind === "accepted" && (
          <p>
            <strong>Bid placed!</strong> You are now the highest bidder at{" "}
            {formatIDR(feedback.amount)}.
          </p>
        )}
        {feedback.kind === "outbid" && (
          <p>
            <strong>You&apos;ve been outbid!</strong> {feedback.byLabel} placed a higher
            bid. New minimum: <strong>{formatIDR(feedback.minimumNextBid)}</strong>.
          </p>
        )}
        {feedback.kind === "rejected" && (
          <p>
            <strong>Bid rejected.</strong> {feedback.message}
            {feedback.minimumNextBid !== undefined && (
              <>
                {" "}
                Minimum next bid:{" "}
                <strong>{formatIDR(feedback.minimumNextBid)}</strong>.
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
