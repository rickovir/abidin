"use client";

import { cn } from "@/lib/utils";
import type { AuctionStatus } from "../../features/auction/types/auction.types";

const STATUS_STYLES: Record<AuctionStatus, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "bg-abidin-cyan/10 text-abidin-cyan ring-abidin-cyan/30",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-abidin-purple/10 text-abidin-purple ring-abidin-purple/30",
  },
  ended: {
    label: "Ended",
    className: "bg-surface-hover text-content-secondary ring-surface-border",
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
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-abidin-cyan opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-abidin-cyan" />
        </span>
      )}
      {label}
    </span>
  );
}
