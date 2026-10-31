import type {
  Auction,
  AuctionEvent,
  AuctionService,
  AuctionSnapshot,
  Bid,
  BidResult,
} from "../types/auction.types";
import { createSeedState, LOCAL_BIDDER_ID, LOCAL_BIDDER_LABEL } from "../data/auction-fixtures";
import {
  deriveAuctionStatus,
  getMinimumNextBid,
  isValidBidAmount,
} from "../utils/auction-utils";

export interface MockAuctionServiceOptions {
  /** Simulated network latency in ms (0 disables; tests should use 0). */
  latencyMs?: number;
  /** Deterministic clock for tests. */
  now?: () => Date;
  /** Random source for simulator decisions; defaults to Math.random. */
  random?: () => number;
}

interface Subscription {
  listener: (event: AuctionEvent) => void;
}

/**
 * In-memory, frontend-only implementation of AuctionService.
 * Owns ALL auction/bid state and mutations. No real backend, persistence,
 * authentication, or real network streaming exists in this MVP.
 */
export class MockAuctionService implements AuctionService {
  private auctions: Map<string, Auction> | null = null;
  private bids: Map<string, Bid[]> | null = null;
  private sequences: Map<string, number> | null = null;
  private subscribers: Map<string, Set<Subscription>>;
  private readonly latencyMs: number;
  private readonly now: () => Date;
  private readonly random: () => number;
  private bidCounter = 0;
  private eventLog: AuctionEvent[] = [];

  constructor(options: MockAuctionServiceOptions = {}) {
    this.latencyMs = options.latencyMs ?? 0;
    this.now = options.now ?? (() => new Date());
    this.random = options.random ?? Math.random;
    this.subscribers = new Map();
    // NOTE: seeded state is created lazily on first use so that constructing
    // the service never touches the clock during prerender/SSG.
  }

  /**
   * Seed the in-memory state on first actual use (browser-only in practice,
   * because reads/mutations are only triggered by client queries/effects).
   */
  private ensureSeeded(): void {
    if (this.auctions && this.bids && this.sequences) return;
    const seed = createSeedState(this.now());
    this.auctions = new Map(seed.auctions.map((a) => [a.id, a]));
    this.bids = new Map(
      Object.entries(seed.bids).map(([id, list]) => [id, [...list]])
    );
    this.sequences = new Map(
      seed.auctions.map((a) => {
        const list = seed.bids[a.id] ?? [];
        return [a.id, list.length > 0 ? list[list.length - 1].sequence : 0];
      })
    );
    this.refreshAllStatuses();
  }

  // ---- reads -------------------------------------------------------------

  async listAuctions(): Promise<Auction[]> {
    this.ensureSeeded();
    await this.simulateLatency();
    return this.sortedAuctions().map((a) => ({ ...a }));
  }

  async getAuction(id: string): Promise<AuctionSnapshot | null> {
    this.ensureSeeded();
    await this.simulateLatency();
    const auction = this.auctions!.get(id);
    if (!auction) return null;
    this.syncStatus(auction);
    return this.buildSnapshot(auction);
  }

  // ---- mutations ----------------------------------------------------------

  async placeBid(auctionId: string, amount: number): Promise<BidResult> {
    this.ensureSeeded();
    await this.simulateLatency();
    const auction = this.auctions!.get(auctionId);
    if (!auction) {
      throw new Error(`Unknown auction: ${auctionId}`);
    }
    this.syncStatus(auction);

    const reject = (
      reason: BidResult extends { ok: false }
        ? never
        : Extract<BidResult, { ok: false }>["reason"],
      message: string,
      minimumNextBid?: number
    ): BidResult => {
      const snapshot = this.buildSnapshot(auction)!;
      const result: BidResult = { ok: false, reason, message, snapshot };
      if (minimumNextBid !== undefined) result.minimumNextBid = minimumNextBid;
      return result;
    };

    if (!isValidBidAmount(amount)) {
      return reject(
        "INVALID_AMOUNT",
        "Enter a whole number of rupiah greater than zero."
      );
    }

    if (auction.status !== "live") {
      return reject(
        "AUCTION_NOT_LIVE",
        auction.status === "upcoming"
          ? "This auction has not started yet."
          : "This auction has already ended."
      );
    }

    const minimumNextBid = getMinimumNextBid(auction);
    if (amount < minimumNextBid) {
      return reject(
        "BID_TOO_LOW",
        "Your bid is below the minimum next bid.",
        minimumNextBid
      );
    }

    // Mutate exactly once, then emit.
    this.bidCounter += 1;
    const sequence = this.nextSequence(auctionId);
    const bid: Bid = {
      id: `bid-${Date.now().toString(36)}-${this.bidCounter}`,
      auctionId,
      bidderId: LOCAL_BIDDER_ID,
      bidderLabel: LOCAL_BIDDER_LABEL,
      amount,
      createdAt: this.now().toISOString(),
      sequence,
      isSimulated: false,
    };

    this.appendBid(auction, bid);

    const snapshot = this.buildSnapshot(auction)!;
    this.emit({
      type: "bid.accepted",
      auctionId,
      sequence,
      bid,
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      highestBidderId: auction.highestBidderId ?? LOCAL_BIDDER_ID,
      occurredAt: bid.createdAt,
    });

    return { ok: true, bid, snapshot };
  }

  // ---- events -------------------------------------------------------------

  subscribe(
    auctionId: string,
    listener: (event: AuctionEvent) => void
  ): () => void {
    const entry: Subscription = { listener };
    let set = this.subscribers.get(auctionId);
    if (!set) {
      set = new Set();
      this.subscribers.set(auctionId, set);
    }
    set.add(entry);
    return () => {
      set!.delete(entry);
      if (set!.size === 0) this.subscribers.delete(auctionId);
    };
  }

  // ---- simulator hooks (explicit controller API, not React lifecycle) -----

  /** Place a simulated competitor bid (respects the same rules). */
  async placeSimulatedBid(auctionId: string): Promise<boolean> {
    this.ensureSeeded();
    const auction = this.auctions!.get(auctionId);
    if (!auction || this.syncStatus(auction) !== "live") return false;

    const bidders = SIMULATED_BIDDER_POOL;
    const bidder = bidders[Math.floor(this.random() * bidders.length)];
    const minimumNextBid = getMinimumNextBid(auction);
    // Occasionally jump one extra increment to feel less robotic.
    const extra = this.random() < 0.25 ? auction.minimumIncrement : 0;
    const amount = minimumNextBid + extra;

    this.bidCounter += 1;
    const sequence = this.nextSequence(auctionId);
    const bid: Bid = {
      id: `sim-${Date.now().toString(36)}-${this.bidCounter}`,
      auctionId,
      bidderId: bidder.id,
      bidderLabel: bidder.label,
      amount,
      createdAt: this.now().toISOString(),
      sequence,
      isSimulated: true,
    };

    this.appendBid(auction, bid);
    this.emit({
      type: "bid.accepted",
      auctionId,
      sequence,
      bid,
      currentPrice: auction.currentPrice,
      bidCount: auction.bidCount,
      highestBidderId: auction.highestBidderId ?? bidder.id,
      occurredAt: bid.createdAt,
    });
    return true;
  }

  /** Force-end an auction now (demo control). */
  forceEnd(auctionId: string): boolean {
    this.ensureSeeded();
    const auction = this.auctions!.get(auctionId);
    if (!auction || auction.status === "ended") return false;
    auction.endsAt = this.now().toISOString();
    auction.status = "ended";
    const sequence = this.nextSequence(auctionId);
    const winnerId = auction.highestBidderId;
    this.emit({
      type: "auction.ended",
      auctionId,
      sequence,
      winnerId,
      occurredAt: this.now().toISOString(),
    });
    return true;
  }

  /** Reset to seeded state (demo/testing). */
  reset(): void {
    this.auctions = null;
    this.bids = null;
    this.sequences = null;
    this.eventLog = [];
    this.bidCounter = 0;
    this.ensureSeeded();
  }

  /** Latest sequence issued for an auction (test hook). */
  getLastSequence(auctionId: string): number {
    return this.sequences?.get(auctionId) ?? 0;
  }

  /** Recent events for inspection (test/demo hook). */
  getRecentEvents(limit = 20): AuctionEvent[] {
    return this.eventLog.slice(-limit);
  }

  // ---- internals ----------------------------------------------------------

  private appendBid(auction: Auction, bid: Bid): void {
    const list = this.bids!.get(auction.id) ?? [];
    list.push(bid);
    this.bids!.set(auction.id, list);
    auction.currentPrice = bid.amount;
    auction.bidCount = list.length;
    auction.highestBidderId = bid.bidderId;
  }

  private nextSequence(auctionId: string): number {
    const next = (this.sequences!.get(auctionId) ?? 0) + 1;
    this.sequences!.set(auctionId, next);
    return next;
  }

  private emit(event: AuctionEvent): void {
    this.eventLog.push(event);
    const set = this.subscribers.get(event.auctionId);
    if (!set) return;
    for (const { listener } of Array.from(set)) {
      try {
        listener(event);
      } catch {
        // a broken listener must not break the store
      }
    }
  }

  private syncStatus(auction: Auction): string {
    const derived = deriveAuctionStatus(auction, this.now());
    if (derived !== auction.status) {
      auction.status = derived;
    }
    return auction.status;
  }

  private refreshAllStatuses(): void {
    for (const auction of Array.from(this.auctions!.values())) {
      this.syncStatus(auction);
    }
  }

  private buildSnapshot(auction: Auction): AuctionSnapshot {
    const bids = [...(this.bids!.get(auction.id) ?? [])];
    return {
      auction: { ...auction },
      bids,
      lastSequence: this.sequences!.get(auction.id) ?? 0,
    };
  }

  private sortedAuctions(): Auction[] {
    return Array.from(this.auctions!.values())
      .map((a) => {
        this.syncStatus(a);
        return a;
      })
      .sort((a, b) => {
        const rank = (s: string) => (s === "live" ? 0 : s === "upcoming" ? 1 : 2);
        const byRank = rank(a.status) - rank(b.status);
        if (byRank !== 0) return byRank;
        return Date.parse(a.endsAt) - Date.parse(b.endsAt);
      });
  }

  private simulateLatency(): Promise<void> {
    if (this.latencyMs <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, this.latencyMs));
  }
}

const SIMULATED_BIDDER_POOL = [
  { id: "sim-budi", label: "Budi S." },
  { id: "sim-ratna", label: "Ratna P." },
  { id: "sim-agus", label: "Agus W." },
  { id: "sim-ayu", label: "Ayu L." },
  { id: "sim-dewi", label: "Dewi A." },
  { id: "sim-fajar", label: "Fajar R." },
  { id: "sim-hasan", label: "Hasan T." },
] as const;
