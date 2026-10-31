"use client";

import { cn } from "@/lib/utils";
import type { Auction, Bid } from "../../features/auction/types/auction.types";
import { formatIDR } from "../../features/auction/utils/auction-utils";
import { LOCAL_BIDDER_LABEL } from "../../features/auction/data/auction-fixtures";

export function AuctionResult({ auction, bids }: { auction: Auction; bids: Bid[] }) {
  const highest = bids[bids.length - 1];
  const youWon = auction.highestBidderId === "you";

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 text-center",
        youWon
          ? "border-emerald-200 bg-emerald-50"
          : "border-stone-200 bg-stone-50"
      )}
      role="status"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
        Auction ended
      </p>
      {highest ? (
        <>
          <p className="mt-2 text-lg font-semibold text-stone-900">
            {youWon ? "You won this auction! 🎉" : `Won by ${highest.bidderLabel}`}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Final price{" "}
            <strong className="tabular-nums">{formatIDR(auction.currentPrice)}</strong>
            {" "}· {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"}
          </p>
          {youWon && (
            <p className="mt-2 text-xs text-emerald-800">
              This is a simulated demo — no payment or transaction occurred.
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-lg font-semibold text-stone-900">No winner</p>
      )}
    </div>
  );
}
