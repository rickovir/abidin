"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Auction } from "../../features/auction/types/auction.types";
import { formatIDR } from "../../features/auction/utils/auction-utils";
import { AuctionStatusBadge } from "@/components/ui/auction-status";
import { Countdown } from "@/components/ui/countdown";
import { useCountdown } from "../../features/auction/hooks/use-countdown";

export function AuctionCard({ auction }: { auction: Auction }) {
  const { msLeft } = useCountdown(auction.endsAt);

  const timeLabel =
    auction.status === "live"
      ? Number.isNaN(msLeft)
        ? "--:--"
        : formatCardTime(msLeft)
      : auction.status === "upcoming"
        ? "Starts soon"
        : "Closed";

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200",
        "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
        auction.status === "ended" && "opacity-80"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <Image
          src={auction.imageUrl}
          alt={auction.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute left-3 top-3">
          <AuctionStatusBadge status={auction.status} withPulse={auction.status === "live"} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
          {auction.category} · {auction.condition}
        </div>
        <h3 className="line-clamp-1 font-semibold text-stone-900 group-hover:underline">
          {auction.title}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <div className="text-xs text-stone-500">Current bid</div>
            <div className="text-lg font-bold tabular-nums text-stone-900">
              {formatIDR(auction.currentPrice)}
            </div>
            <div className="text-xs text-stone-500">
              {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-500">
              {auction.status === "live" ? "Ends in" : auction.status === "ended" ? "Ended" : "Starts"}
            </div>
            <div
              className={cn(
                "font-mono text-sm tabular-nums",
                auction.status === "live" && msLeft <= 60_000 && msLeft > 0
                  ? "text-amber-600"
                  : "text-stone-700"
              )}
            >
              {timeLabel}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatCardTime(msLeft: number): string {
  if (msLeft <= 0) return "00:00:00";
  const totalSeconds = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}h`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
