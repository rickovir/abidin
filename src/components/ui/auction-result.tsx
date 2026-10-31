"use client";

import { cn } from "@/lib/utils";
import type { Auction, Bid } from "../../features/auction/types/auction.types";
import { formatIDR } from "../../features/auction/utils/auction-utils";

export function AuctionResult({ auction, bids }: { auction: Auction; bids: Bid[] }) {
  const highest = bids[bids.length - 1];
  const youWon = auction.highestBidderId === "you";

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 text-center",
        youWon
          ? "border-abidin-cyan/40 bg-abidin-cyan/10"
          : "border-surface-border bg-surface-hover"
      )}
      role="status"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-content-secondary">
        Auction ended
      </p>
      {highest ? (
        <>
          <p className="mt-2 text-lg font-semibold text-content-primary">
            {youWon ? "You won this auction! 🎉" : `Won by ${highest.bidderLabel}`}
          </p>
          <p className="mt-1 text-sm text-content-secondary">
            Final price{" "}
            <strong className="tabular-nums text-content-primary">{formatIDR(auction.currentPrice)}</strong>
            {" "}· {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"}
          </p>
          {youWon && (
            <p className="mt-2 text-xs text-abidin-cyan">
              This is a simulated demo — no payment or transaction occurred.
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-lg font-semibold text-content-primary">No winner</p>
      )}
    </div>
  );
}
