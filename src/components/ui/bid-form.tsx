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
            className="text-sm font-medium text-content-secondary"
          >
            Your bid
          </label>
          <span className="text-xs text-content-secondary">
            Min. next bid{" "}
            <strong className="font-semibold text-abidin-cyan tabular-nums">
              {formatIDR(minimumNextBid)}
            </strong>
          </span>
        </div>
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-content-muted">
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
                "w-full rounded-xl border border-surface-border bg-surface-bg py-2.5 pl-10 pr-3 text-right font-semibold tabular-nums text-content-primary shadow-sm",
                "focus:border-abidin-cyan focus:outline-none focus:ring-2 focus:ring-abidin-cyan/25",
                "disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-content-muted",
                showFieldError && "border-abidin-orange focus:border-abidin-orange focus:ring-abidin-orange/25"
              )}
            />
          </div>
          <button
            type="submit"
            disabled={submitDisabled}
            className={cn(
              "inline-flex items-center justify-center rounded-xl bg-gradient-bid-action px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition",
              "hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-abidin-cyan",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40",
              pending && "cursor-wait"
            )}
          >
            {pending ? "Placing…" : "Place bid"}
          </button>
        </div>
        {showFieldError && (
          <p id="bid-amount-error" role="alert" className="mt-1.5 text-xs text-abidin-orange">
            {validation.message}
          </p>
        )}
      </div>

      {auction.status !== "live" && (
        <p className="rounded-xl bg-surface-hover p-3 text-xs text-content-secondary">
          {auction.status === "upcoming"
            ? "Bidding opens when the auction starts."
            : "This auction has ended — bidding is closed."}
        </p>
      )}
    </form>
  );
}
