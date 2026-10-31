"use client";

import { cn } from "@/lib/utils";
import type { AuctionStatus } from "../../features/auction/types/auction.types";

const STATUS_STYLES: Record<AuctionStatus, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-amber-50 text-amber-800 ring-amber-600/20",
  },
  ended: {
    label: "Ended",
    className: "bg-stone-100 text-stone-600 ring-stone-500/20",
  },
};

export function AuctionStatusBadge({
  status,
  withPulse = false,
  className,
}: {
  status: AuctionStatus;
  withPulse?: boolean;
  className?: string;
}) {
  const { label, className: style } = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        style,
        className
      )}
    >
      {status === "live" && withPulse && (
        <span
          aria-hidden="true"
          className="relative flex size-2"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
        </span>
      )}
      {label}
    </span>
  );
}
