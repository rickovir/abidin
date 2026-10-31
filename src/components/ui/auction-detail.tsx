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

  useAuctionEvents(auctionId, snapshot?.lastSequence ?? 0);

  const [feedback, setFeedback] = useState<BidFeedback>({ kind: "idle" });
  const [connection, setConnection] = useState<"live" | "reconnecting" | "paused">("paused");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const ended = auction ? auction.status === "ended" || (!Number.isNaN(msLeft) && msLeft <= 0) : false;

  // When countdown hits zero locally, transition state + invalidate caches.
  useEffect(() => {
    if (!auction || auction.status !== "live" || Number.isNaN(msLeft) || msLeft > 0) return;
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
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-surface-hover motion-reduce:animate-none" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-surface-hover motion-reduce:animate-none" />
            <div className="h-24 animate-pulse rounded-2xl bg-surface-hover motion-reduce:animate-none" />
            <div className="h-40 animate-pulse rounded-2xl bg-surface-hover motion-reduce:animate-none" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !snapshot || !auction) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-5xl font-bold text-gradient-hero">404</p>
        <h1 className="mt-4 text-2xl font-bold text-content-primary">
          Auction not found
        </h1>
        <p className="mt-2 text-sm text-content-secondary">
          The auction you are looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/auctions"
          className="mt-6 inline-flex rounded-xl bg-gradient-btn-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
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
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-content-secondary hover:text-abidin-cyan"
      >
        ← All auctions
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        {/* Media + description */}
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-hover ring-1 ring-inset ring-surface-border">
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
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-content-secondary">
              <span>{auction.category}</span>
              <span aria-hidden="true">·</span>
              <span>{auction.condition}</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-content-primary">
              {auction.title}
            </h1>
            <p className="mt-4 leading-relaxed text-content-secondary">{auction.description}</p>
          </div>
        </div>

        {/* Bid panel */}
        <div className="space-y-5">
          <section
            aria-label="Bidding"
            className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <AuctionStatusBadge status={ended ? "ended" : auction.status} withPulse />
              {/* Connection indicator only surfaces when NOT live
                  (Paused / Reconnecting) — avoids duplicate "Live" badges
                  while keeping the spec's activity-status requirement. */}
              {auction.status === "live" && connection !== "live" ? (
                <LiveIndicator connection={connection} />
              ) : null}
            </div>

            <div className="mt-5">
              <div className="text-xs font-medium uppercase tracking-widest text-content-secondary">
                Current price
              </div>
              <div className="mt-1 text-4xl font-bold tabular-nums text-gradient-hero">
                {formatIDR(auction.currentPrice)}
              </div>
              <div className="mt-1 text-xs text-content-muted">
                {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"} ·{" "}
                {auction.highestBidderId
                  ? `Highest: ${bids[0]?.bidderLabel ?? "—"}`
                  : "No bids yet"}
              </div>
            </div>

            {auction.status === "live" && !ended ? (
              <>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-bg px-4 py-3 ring-1 ring-inset ring-surface-border">
                  <span className="text-sm font-medium text-content-secondary">Ends in</span>
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
                  <div className="rounded-xl bg-abidin-purple/10 p-4 text-sm text-abidin-purple ring-1 ring-inset ring-abidin-purple/30">
                    This auction hasn&apos;t started yet. Bidding opens{" "}
                    <strong>{new Date(auction.startsAt).toLocaleString("id-ID")}</strong>.
                  </div>
                ) : (
                  <AuctionResult auction={{ ...auction, status: "ended" }} bids={snapshot.bids} />
                )}
              </div>
            )}
          </section>

          <section aria-label="Bid history" className="rounded-2xl border border-surface-border bg-surface-card p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-content-secondary">
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
    accepted: "border-abidin-cyan/40 bg-abidin-cyan/10 text-abidin-cyan",
    outbid: "border-abidin-orange/40 bg-abidin-orange/10 text-abidin-orange",
    rejected: "border-abidin-orange/40 bg-abidin-orange/10 text-abidin-orange",
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
