import { describe, expect, it } from "vitest";
import { MockAuctionService } from "../mock-auction-service";
import type { AuctionEvent } from "../../types/auction.types";

const LIVE_ID = "auc-classic-omega";      // live, current 11.5jt, inc 250rb
const UPCOMING_ID = "auc-vintage-batik";  // upcoming
const ENDED_ID = "auc-road-bike";         // ended

function makeService() {
  return new MockAuctionService({ latencyMs: 0 });
}

describe("MockAuctionService — listing", () => {
  it("returns all seeded auctions", async () => {
    const service = makeService();
    const auctions = await service.listAuctions();
    expect(auctions.length).toBeGreaterThanOrEqual(6);
  });

  it("does not leak internal fixture objects", async () => {
    const service = makeService();
    const a = await service.listAuctions();
    const again = await service.listAuctions();
    expect(a[0]).not.toBe(again[0]);
  });
});

describe("MockAuctionService — getAuction", () => {
  it("returns a snapshot with bids newest-last and lastSequence", async () => {
    const service = makeService();
    const snap = await service.getAuction(LIVE_ID);
    expect(snap).not.toBeNull();
    expect(snap!.bids.length).toBe(7);
    expect(snap!.bids[snap!.bids.length - 1].sequence).toBe(
      snap!.lastSequence
    );
  });

  it("returns null for unknown ids", async () => {
    const service = makeService();
    expect(await service.getAuction("nope")).toBeNull();
  });
});

describe("MockAuctionService — placeBid validation", () => {
  it("accepts a valid bid and mutates state exactly once", async () => {
    const service = makeService();
    const before = await service.getAuction(LIVE_ID);
    const result = await service.placeBid(LIVE_ID, 11_750_000);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.auction.currentPrice).toBe(11_750_000);
    expect(result.snapshot.auction.bidCount).toBe(before!.auction.bidCount + 1);
    expect(result.snapshot.auction.highestBidderId).toBe("you");
    expect(result.bid.bidderLabel).toBe("You");
    expect(result.bid.isSimulated).toBe(false);
  });

  it("rejects a too-low bid without mutating state", async () => {
    const service = makeService();
    const before = await service.getAuction(LIVE_ID);
    const result = await service.placeBid(LIVE_ID, 11_600_000);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("BID_TOO_LOW");
    expect(result.minimumNextBid).toBe(11_750_000);
    const after = await service.getAuction(LIVE_ID);
    expect(after!.auction.currentPrice).toBe(before!.auction.currentPrice);
    expect(after!.bids.length).toBe(before!.bids.length);
  });

  it("rejects invalid amounts (float / zero / negative)", async () => {
    const service = makeService();
    for (const bad of [11_750_000.5, 0, -1000]) {
      const r = await service.placeBid(LIVE_ID, bad);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("INVALID_AMOUNT");
    }
  });

  it("rejects bids on upcoming auctions", async () => {
    const service = makeService();
    const r = await service.placeBid(UPCOMING_ID, 5_000_000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("AUCTION_NOT_LIVE");
  });

  it("rejects bids on ended auctions", async () => {
    const service = makeService();
    const r = await service.placeBid(ENDED_ID, 30_000_000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("AUCTION_NOT_LIVE");
  });
});

describe("MockAuctionService — events", () => {
  it("emits bid.accepted only after a successful mutation", async () => {
    const service = makeService();
    const events: AuctionEvent[] = [];
    service.subscribe(LIVE_ID, (e) => events.push(e));

    await service.placeBid(LIVE_ID, 11_600_000); // too low → no event
    expect(events).toHaveLength(0);

    await service.placeBid(LIVE_ID, 11_750_000); // valid → event
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("bid.accepted");
  });

  it("sequences increment exactly once per accepted bid", async () => {
    const service = makeService();
    const s0 = await service.getAuction(LIVE_ID);
    await service.placeBid(LIVE_ID, 11_750_000);
    await service.placeBid(LIVE_ID, 12_000_000);
    expect(service.getLastSequence(LIVE_ID)).toBe(s0!.lastSequence + 2);
  });

  it("unsubscribe prevents further callbacks", async () => {
    const service = makeService();
    const seen: AuctionEvent[] = [];
    const unsub = service.subscribe(LIVE_ID, (e) => seen.push(e));
    unsub();
    await service.placeBid(LIVE_ID, 11_750_000);
    expect(seen).toHaveLength(0);
  });

  it("simulated bids follow the same minimum rules", async () => {
    const service = makeService();
    const before = await service.getAuction(LIVE_ID);
    const ok = await service.placeSimulatedBid(LIVE_ID);
    expect(ok).toBe(true);
    const after = await service.getAuction(LIVE_ID);
    expect(after!.auction.currentPrice).toBeGreaterThanOrEqual(
      before!.auction.currentPrice + before!.auction.minimumIncrement
    );
    expect(after!.bids[after!.bids.length - 1].isSimulated).toBe(true);
  });

  it("simulator does not bid after end", async () => {
    const service = makeService();
    service.forceEnd(LIVE_ID);
    const before = await service.getAuction(LIVE_ID);
    const ok = await service.placeSimulatedBid(LIVE_ID);
    expect(ok).toBe(false);
    const after = await service.getAuction(LIVE_ID);
    expect(after!.bids.length).toBe(before!.bids.length);
  });

  it("forceEnd emits auction.ended with the winner", async () => {
    const service = makeService();
    const events: AuctionEvent[] = [];
    service.subscribe(LIVE_ID, (e) => events.push(e));
    await service.placeBid(LIVE_ID, 11_750_000); // you are highest
    service.forceEnd(LIVE_ID);
    const ended = events.find((e) => e.type === "auction.ended");
    expect(ended).toBeDefined();
    if (ended?.type === "auction.ended") {
      expect(ended.winnerId).toBe("you");
    }
  });
});

describe("MockAuctionService — determinism", () => {
  it("reset() restores seeded state", async () => {
    const service = makeService();
    await service.placeBid(LIVE_ID, 11_750_000);
    service.reset();
    const snap = await service.getAuction(LIVE_ID);
    expect(snap!.auction.currentPrice).toBe(11_500_000);
    expect(snap!.bids).toHaveLength(7);
  });
});
