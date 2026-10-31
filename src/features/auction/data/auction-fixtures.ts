import type { Auction, Bid } from "../types/auction.types";

/**
 * Seeded demo fixtures. Cloned by MockAuctionService before mutation so
 * fixture arrays are never polluted across sessions/tests.
 *
 * Timestamps are generated relative to "now" so the demo always has
 * live/upcoming/ended auctions regardless of when it runs.
 */

export const LOCAL_BIDDER_ID = "you";
export const LOCAL_BIDDER_LABEL = "You";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

interface FixtureBidSeed {
  bidderId: string;
  bidderLabel: string;
  amount: number;
  minutesAgo: number;
  isSimulated: boolean;
}

interface AuctionFixture {
  auction: Omit<Auction, "startsAt" | "endsAt"> & {
    startsInMs: number;
    endsInMs: number;
  };
  bids: FixtureBidSeed[];
}

const AUCTION_FIXTURES: AuctionFixture[] = [
  {
    auction: {
      id: "auc-classic-omega",
      slug: "classic-omega-constellation-1968",
      title: "Classic Omega Constellation ’68",
      description:
        "Vintage 1968 Omega Constellation in gold-capped steel. Recently serviced, keeping excellent time. Original box included, papers absent. A collector-grade piece with clean dial and sharp case lines.",
      category: "Watches",
      condition: "Used — Excellent",
      imageUrl: "/images/auctions/omega-constellation.svg",
      startingPrice: 8_000_000,
      currentPrice: 11_500_000,
      minimumIncrement: 250_000,
      currency: "IDR",
      status: "live",
      startsInMs: -3 * DAY,
      endsInMs: 47 * MINUTE,
      bidCount: 7,
      highestBidderId: "sim-ayu",
    },
    bids: [
      { bidderId: "sim-budi", bidderLabel: "Budi S.", amount: 8_000_000, minutesAgo: 160, isSimulated: true },
      { bidderId: "sim-ratna", bidderLabel: "Ratna P.", amount: 8_750_000, minutesAgo: 128, isSimulated: true },
      { bidderId: "sim-agus", bidderLabel: "Agus W.", amount: 9_500_000, minutesAgo: 95, isSimulated: true },
      { bidderId: "sim-ayu", bidderLabel: "Ayu L.", amount: 10_250_000, minutesAgo: 61, isSimulated: true },
      { bidderId: "sim-budi", bidderLabel: "Budi S.", amount: 10_750_000, minutesAgo: 34, isSimulated: true },
      { bidderId: "sim-ratna", bidderLabel: "Ratna P.", amount: 11_000_000, minutesAgo: 16, isSimulated: true },
      { bidderId: "sim-ayu", bidderLabel: "Ayu L.", amount: 11_500_000, minutesAgo: 5, isSimulated: true },
    ],
  },
  {
    auction: {
      id: "auc-sony-wh1000",
      slug: "sony-wh-1000xm5-sealed",
      title: "Sony WH-1000XM5 — Sealed",
      description:
        "Brand-new, factory-sealed Sony WH-1000XM5 wireless noise-cancelling headphones in black. Full warranty, purchased from an authorized retailer.",
      category: "Audio",
      condition: "New — Sealed",
      imageUrl: "/images/auctions/sony-wh1000xm5.svg",
      startingPrice: 2_500_000,
      currentPrice: 3_100_000,
      minimumIncrement: 50_000,
      currency: "IDR",
      status: "live",
      startsInMs: -2 * DAY,
      endsInMs: 2 * HOUR + 12 * MINUTE,
      bidCount: 5,
      highestBidderId: "sim-dewi",
    },
    bids: [
      { bidderId: "sim-fajar", bidderLabel: "Fajar R.", amount: 2_500_000, minutesAgo: 200, isSimulated: true },
      { bidderId: "sim-dewi", bidderLabel: "Dewi A.", amount: 2_700_000, minutesAgo: 150, isSimulated: true },
      { bidderId: "sim-hasan", bidderLabel: "Hasan T.", amount: 2_850_000, minutesAgo: 90, isSimulated: true },
      { bidderId: "sim-fajar", bidderLabel: "Fajar R.", amount: 3_000_000, minutesAgo: 44, isSimulated: true },
      { bidderId: "sim-dewi", bidderLabel: "Dewi A.", amount: 3_100_000, minutesAgo: 12, isSimulated: true },
    ],
  },
  {
    auction: {
      id: "auc-leica-q2",
      slug: "leica-q2-reporter",
      title: "Leica Q2 Reporter Edition",
      description:
        "Limited-production Leica Q2 Reporter with 47.3MP full-frame sensor and Summilux 28mm f/1.7. Shutter count under 4,000. Includes original accessories and documentation.",
      category: "Cameras",
      condition: "Used — Like New",
      imageUrl: "/images/auctions/leica-q2.svg",
      startingPrice: 42_000_000,
      currentPrice: 55_500_000,
      minimumIncrement: 500_000,
      currency: "IDR",
      status: "live",
      startsInMs: -5 * DAY,
      endsInMs: 26 * MINUTE,
      bidCount: 6,
      highestBidderId: "sim-ratna",
    },
    bids: [
      { bidderId: "sim-agus", bidderLabel: "Agus W.", amount: 42_000_000, minutesAgo: 300, isSimulated: true },
      { bidderId: "sim-ratna", bidderLabel: "Ratna P.", amount: 46_500_000, minutesAgo: 240, isSimulated: true },
      { bidderId: "sim-budi", bidderLabel: "Budi S.", amount: 50_000_000, minutesAgo: 180, isSimulated: true },
      { bidderId: "sim-agus", bidderLabel: "Agus W.", amount: 52_500_000, minutesAgo: 120, isSimulated: true },
      { bidderId: "sim-ratna", bidderLabel: "Ratna P.", amount: 54_000_000, minutesAgo: 70, isSimulated: true },
      { bidderId: "sim-ratna", bidderLabel: "Ratna P.", amount: 55_500_000, minutesAgo: 25, isSimulated: true },
    ],
  },
  {
    auction: {
      id: "auc-vintage-batik",
      slug: "vintage-batik-tulis-pekalongan",
      title: "Vintage Batik Tulis Pekalongan",
      description:
        "Hand-drawn batik tulis from Pekalongan, circa 1970s. Natural dyes on primissima cotton. Framed and preserved, no stains or tears. Certificate of authenticity included.",
      category: "Art & Collectibles",
      condition: "Used — Excellent",
      imageUrl: "/images/auctions/batik-pekalongan.svg",
      startingPrice: 1_200_000,
      currentPrice: 1_200_000,
      minimumIncrement: 100_000,
      currency: "IDR",
      status: "upcoming",
      startsInMs: 5 * HOUR,
      endsInMs: 3 * DAY,
      bidCount: 0,
      highestBidderId: null,
    },
    bids: [],
  },
  {
    auction: {
      id: "auc-road-bike",
      slug: "pinarello-gan-rs",
      title: "Pinarello Gan RS Disk",
      description:
        "Carbon road bike, size 54, Shimano Ultegra Di2 groupset, disc brakes. Approximately 1,800 km ridden. Recently tuned with new tires and bar tape.",
      category: "Sports",
      condition: "Used — Very Good",
      imageUrl: "/images/auctions/pinarello-gan.svg",
      startingPrice: 18_000_000,
      currentPrice: 27_500_000,
      minimumIncrement: 250_000,
      currency: "IDR",
      status: "ended",
      startsInMs: -7 * DAY,
      endsInMs: -2 * HOUR,
      bidCount: 8,
      highestBidderId: "sim-hasan",
    },
    bids: [
      { bidderId: "sim-fajar", bidderLabel: "Fajar R.", amount: 18_000_000, minutesAgo: 480, isSimulated: true },
      { bidderId: "sim-dewi", bidderLabel: "Dewi A.", amount: 20_000_000, minutesAgo: 420, isSimulated: true },
      { bidderId: "sim-hasan", bidderLabel: "Hasan T.", amount: 22_000_000, minutesAgo: 350, isSimulated: true },
      { bidderId: "sim-fajar", bidderLabel: "Fajar R.", amount: 23_500_000, minutesAgo: 280, isSimulated: true },
      { bidderId: "sim-dewi", bidderLabel: "Dewi A.", amount: 25_000_000, minutesAgo: 200, isSimulated: true },
      { bidderId: "sim-hasan", bidderLabel: "Hasan T.", amount: 26_000_000, minutesAgo: 130, isSimulated: true },
      { bidderId: "sim-dewi", bidderLabel: "Dewi A.", amount: 27_000_000, minutesAgo: 90, isSimulated: true },
      { bidderId: "sim-hasan", bidderLabel: "Hasan T.", amount: 27_500_000, minutesAgo: 40, isSimulated: true },
    ],
  },
  {
    auction: {
      id: "auc-mid-century-chair",
      slug: "mid-century-teak-lounge-chair",
      title: "Mid-Century Teak Lounge Chair",
      description:
        "Indonesian mid-century teak lounge chair, professionally restored with new rattan weaving. 1960s production, sturdy joinery, beautiful patina.",
      category: "Furniture",
      condition: "Restored",
      imageUrl: "/images/auctions/teak-lounge.svg",
      startingPrice: 4_500_000,
      currentPrice: 6_100_000,
      minimumIncrement: 150_000,
      currency: "IDR",
      status: "ended",
      startsInMs: -10 * DAY,
      endsInMs: -1 * DAY,
      bidCount: 4,
      highestBidderId: "sim-ayu",
    },
    bids: [
      { bidderId: "sim-budi", bidderLabel: "Budi S.", amount: 4_500_000, minutesAgo: 2_000, isSimulated: true },
      { bidderId: "sim-ayu", bidderLabel: "Ayu L.", amount: 5_000_000, minutesAgo: 1_600, isSimulated: true },
      { bidderId: "sim-ratna", bidderLabel: "Ratna P.", amount: 5_600_000, minutesAgo: 1_100, isSimulated: true },
      { bidderId: "sim-ayu", bidderLabel: "Ayu L.", amount: 6_100_000, minutesAgo: 500, isSimulated: true },
    ],
  },
];

/** Build a fresh, deep-cloned seed state (auctions + bid history). */
export function createSeedState(now: Date = new Date()): {
  auctions: Auction[];
  bids: Record<string, Bid[]>;
} {
  const auctions: Auction[] = [];
  const bids: Record<string, Bid[]> = {};

  for (const fixture of AUCTION_FIXTURES) {
    const { startsInMs, endsInMs, ...rest } = fixture.auction;
    const auction: Auction = {
      ...structuredClone(rest),
      startsAt: new Date(now.getTime() + startsInMs).toISOString(),
      endsAt: new Date(now.getTime() + endsInMs).toISOString(),
    };
    auctions.push(auction);

    bids[auction.id] = fixture.bids.map((seed, index) => ({
      id: `${auction.id}-seed-${index + 1}`,
      auctionId: auction.id,
      bidderId: seed.bidderId,
      bidderLabel: seed.bidderLabel,
      amount: seed.amount,
      createdAt: new Date(now.getTime() - seed.minutesAgo * MINUTE).toISOString(),
      sequence: index + 1,
      isSimulated: seed.isSimulated,
    }));
  }

  return { auctions, bids };
}

export const SIMULATED_BIDDERS = [
  { id: "sim-budi", label: "Budi S." },
  { id: "sim-ratna", label: "Ratna P." },
  { id: "sim-agus", label: "Agus W." },
  { id: "sim-ayu", label: "Ayu L." },
  { id: "sim-dewi", label: "Dewi A." },
  { id: "sim-fajar", label: "Fajar R." },
  { id: "sim-hasan", label: "Hasan T." },
] as const;
