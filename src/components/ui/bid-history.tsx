"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Bid } from "../../features/auction/types/auction.types";
import { formatIDR } from "../../features/auction/utils/auction-utils";
import { LOCAL_BIDDER_LABEL } from "../../features/auction/data/auction-fixtures";

function relativeTime(iso: string, now: number): string {
  const diff = now - Date.parse(iso);
  if (Number.isNaN(diff)) return "";
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Deterministic (clock-free) label used during prerender/hydration. */
function absoluteTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

export function BidHistory({
  bids,
  className,
}: {
  bids: Bid[];
  className?: string;
}) {
  // Clock is only read after mount → prerender stays deterministic.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // Initial read scheduled async (rule: no synchronous setState in effects).
    const kickoff = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(timer);
    };
  }, []);

  if (bids.length === 0) {
    return (
      <p className={cn("rounded-xl bg-surface-hover p-4 text-sm text-content-secondary", className)}>
        No bids yet. Be the first when the auction is live.
      </p>
    );
  }

  const ordered = [...bids].sort((a, b) => b.sequence - a.sequence);

  return (
    <ol className={cn("divide-y divide-surface-border/60", className)} aria-label="Bid history">
      {ordered.map((bid) => {
        const isYou = bid.bidderLabel === LOCAL_BIDDER_LABEL;
        return (
          <li
            key={bid.id}
            className={cn(
              "flex items-center justify-between gap-3 py-2.5",
              isYou && "bg-abidin-cyan/5 -mx-3 rounded-lg px-3 ring-1 ring-inset ring-abidin-cyan/20"
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isYou
                    ? "bg-gradient-btn-primary text-white"
                    : "bg-surface-hover text-content-secondary"
                )}
              >
                {bid.bidderLabel.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-content-primary">
                  {bid.bidderLabel}
                  {isYou && (
                    <span className="ml-1.5 rounded bg-abidin-cyan/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-abidin-cyan">
                      You
                    </span>
                  )}
                </div>
                <div className="text-xs text-content-muted" suppressHydrationWarning>
                  {now === null
                    ? absoluteTime(bid.createdAt)
                    : relativeTime(bid.createdAt, now)}
                </div>
              </div>
            </div>
            <div className="text-right font-semibold tabular-nums text-content-primary">
              {formatIDR(bid.amount)}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
