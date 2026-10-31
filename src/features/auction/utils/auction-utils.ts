import type { Auction, AuctionStatus } from "../types/auction.types";

/** Minimum valid next bid: current price + increment. Integer IDR only. */
export function getMinimumNextBid(auction: Auction): number {
  return auction.currentPrice + auction.minimumIncrement;
}

/**
 * Derive auction status from timestamps (server-style truth),
 * falling back to the stored status when the clock is unknown.
 */
export function deriveAuctionStatus(
  auction: Pick<Auction, "startsAt" | "endsAt" | "status">,
  now: Date = new Date()
): AuctionStatus {
  const nowMs = now.getTime();
  const startMs = Date.parse(auction.startsAt);
  const endMs = Date.parse(auction.endsAt);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return auction.status;
  if (nowMs < startMs) return "upcoming";
  if (nowMs >= endMs) return "ended";
  return "live";
}

/** Whole positive integer IDR amounts only (smallest supported unit). */
export function isValidBidAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0;
}

/** Format integer IDR for display, e.g. 1250000 -> "Rp 1.250.000". */
export function formatIDR(amount: number): string {
  if (!Number.isFinite(amount)) return "Rp —";
  const negative = amount < 0;
  const digits = Math.abs(Math.trunc(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}Rp ${digits}`;
}

/** Compact IDR for tight card layouts, e.g. 1250000 -> "Rp 1,25 jt". */
export function formatIDRCompact(amount: number): string {
  if (!Number.isFinite(amount)) return "Rp —";
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `Rp ${(abs / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    })} M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(abs / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    })} jt`;
  }
  if (abs >= 1_000) {
    return `Rp ${(abs / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 0,
    })} rb`;
  }
  return `Rp ${abs}`;
}

/** "2h 5m 3s" style remaining-time label derived from endsAt on each call. */
export function formatRemaining(endsAt: string, now: Date = new Date()): string {
  const endMs = Date.parse(endsAt);
  if (Number.isNaN(endMs)) return "--";
  const diff = endMs - now.getTime();
  if (diff <= 0) return "00:00:00";
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) return `${days}h ${pad(hours)}m ${pad(minutes)}s`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** ms remaining until endsAt (negative when already ended). */
export function msRemaining(endsAt: string, now: Date = new Date()): number {
  const endMs = Date.parse(endsAt);
  if (Number.isNaN(endMs)) return 0;
  return endMs - now.getTime();
}
