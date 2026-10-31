"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Auction } from "../../features/auction/types/auction.types";
import { formatIDR, getMinimumNextBid } from "../../features/auction/utils/auction-utils";
import { parseBidAmount, validateBidAmount } from "../../features/auction/schemas/bid.schema";

export type BidFeedback =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "accepted"; amount: number }
  | { kind: "outbid"; byLabel: string; minimumNextBid: number }
  | { kind: "rejected"; message: string; minimumNextBid?: number };

export function BidForm({
  auction,
  feedback,
  onSubmit,
  disabled,
}: {
  auction: Auction;
  feedback: BidFeedback;
  onSubmit: (amount: number) => void;
  disabled?: boolean;
}) {
  const minimumNextBid = getMinimumNextBid(auction);
  const [raw, setRaw] = useState<string | null>(null); // null = untouched

  // While untouched, always display the current minimum next bid.
  const display = raw ?? String(minimumNextBid);

  const amount = parseBidAmount(display);
  const validation = useMemo(
    () => validateBidAmount(amount, minimumNextBid),
    [amount, minimumNextBid]
  );

  const pending = feedback.kind === "pending";
  const submitDisabled =
    disabled || pending || !validation.valid || auction.status !== "live";

  const showFieldError = !validation.valid && display !== "" && !pending;

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (amount === null || submitDisabled) return;
        onSubmit(amount);
      }}
    >
      <div>
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="bid-amount"
            className="text-sm font-medium text-stone-700"
          >
            Your bid
          </label>
          <span className="text-xs text-stone-500">
            Min. next bid{" "}
            <strong className="font-semibold text-stone-800 tabular-nums">
              {formatIDR(minimumNextBid)}
            </strong>
          </span>
        </div>
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-stone-500">
              Rp
            </span>
            <input
              id="bid-amount"
              name="bid-amount"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              disabled={disabled || auction.status !== "live"}
              value={display}
              onChange={(e) => setRaw(e.target.value)}
              aria-invalid={showFieldError}
              aria-describedby={showFieldError ? "bid-amount-error" : undefined}
              className={cn(
                "w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-right font-semibold tabular-nums text-stone-900 shadow-sm",
                "focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10",
                "disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400",
                showFieldError && "border-red-400 focus:border-red-500 focus:ring-red-100"
              )}
            />
          </div>
          <button
            type="submit"
            disabled={submitDisabled}
            className={cn(
              "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition",
              "bg-stone-900 hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
              "disabled:cursor-not-allowed disabled:bg-stone-300 disabled:hover:bg-stone-300",
              pending && "cursor-wait"
            )}
          >
            {pending ? "Placing…" : "Place bid"}
          </button>
        </div>
        {showFieldError && (
          <p id="bid-amount-error" role="alert" className="mt-1.5 text-xs text-red-600">
            {validation.message}
          </p>
        )}
      </div>

      {auction.status !== "live" && (
        <p className="rounded-xl bg-stone-50 p-3 text-xs text-stone-600">
          {auction.status === "upcoming"
            ? "Bidding opens when the auction starts."
            : "This auction has ended — bidding is closed."}
        </p>
      )}
    </form>
  );
}
