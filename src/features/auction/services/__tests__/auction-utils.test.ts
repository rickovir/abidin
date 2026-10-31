import { describe, expect, it } from "vitest";
import {
  deriveAuctionStatus,
  formatIDR,
  formatRemaining,
  getMinimumNextBid,
  isValidBidAmount,
  msRemaining,
} from "../../utils/auction-utils";
import type { Auction } from "../../types/auction.types";

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  return {
    id: "test-auction",
    slug: "test-auction",
    title: "Test",
    description: "Test",
    category: "Test",
    condition: "New",
    imageUrl: "/x.svg",
    startingPrice: 1_000_000,
    currentPrice: 1_500_000,
    minimumIncrement: 100_000,
    currency: "IDR",
    status: "live",
    startsAt: "2026-01-01T00:00:00.000Z",
    endsAt: "2026-01-02T00:00:00.000Z",
    bidCount: 3,
    highestBidderId: "sim-x",
    ...overrides,
  };
}

describe("getMinimumNextBid", () => {
  it("returns currentPrice + minimumIncrement", () => {
    expect(getMinimumNextBid(makeAuction())).toBe(1_600_000);
  });

  it("handles zero-increment auctions", () => {
    expect(
      getMinimumNextBid(makeAuction({ minimumIncrement: 0 }))
    ).toBe(1_500_000);
  });
});

describe("deriveAuctionStatus", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");

  it("is upcoming before startsAt", () => {
    const a = makeAuction({ startsAt: "2026-01-01T13:00:00.000Z" });
    expect(deriveAuctionStatus(a, now)).toBe("upcoming");
  });

  it("is live between startsAt and endsAt", () => {
    const a = makeAuction();
    expect(deriveAuctionStatus(a, now)).toBe("live");
  });

  it("is ended at/after endsAt", () => {
    const a = makeAuction({ endsAt: "2026-01-01T11:59:00.000Z" });
    expect(deriveAuctionStatus(a, now)).toBe("ended");
  });

  it("falls back to stored status on invalid timestamps", () => {
    const a = makeAuction({ startsAt: "not-a-date", status: "upcoming" });
    expect(deriveAuctionStatus(a, now)).toBe("upcoming");
  });
});

describe("isValidBidAmount", () => {
  it("accepts whole positive integers", () => {
    expect(isValidBidAmount(150_000)).toBe(true);
    expect(isValidBidAmount(1)).toBe(true);
  });

  it("rejects zero, negatives, floats, NaN, Infinity", () => {
    expect(isValidBidAmount(0)).toBe(false);
    expect(isValidBidAmount(-5)).toBe(false);
    expect(isValidBidAmount(1.5)).toBe(false);
    expect(isValidBidAmount(NaN)).toBe(false);
    expect(isValidBidAmount(Infinity)).toBe(false);
  });
});

describe("formatIDR", () => {
  it("formats with thousand dots", () => {
    expect(formatIDR(1_250_000)).toBe("Rp 1.250.000");
  });

  it("handles zero", () => {
    expect(formatIDR(0)).toBe("Rp 0");
  });

  it("marks non-finite values", () => {
    expect(formatIDR(NaN)).toBe("Rp —");
  });
});

describe("formatRemaining / msRemaining", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");

  it("formats h:m:s under a day", () => {
    expect(formatRemaining("2026-01-01T14:05:03.000Z", now)).toBe("02:05:03");
  });

  it("includes days when over 24h", () => {
    // 2 days + 2h later → days-prefixed label
    expect(formatRemaining("2026-01-03T14:00:00.000Z", now)).toMatch(/^2h 02m 00s$|^2d/);
  });

  it("returns 00:00:00 when past the end", () => {
    expect(formatRemaining("2026-01-01T11:00:00.000Z", now)).toBe("00:00:00");
  });

  it("msRemaining is negative after end", () => {
    expect(msRemaining("2026-01-01T11:00:00.000Z", now)).toBeLessThan(0);
  });
});
