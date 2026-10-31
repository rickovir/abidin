/**
 * ABIDIN — Auction & Bid Engine
 * Domain types. Must stay independent of React/UI modules.
 */

export type AuctionStatus = "upcoming" | "live" | "ended";

export interface Auction {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  imageUrl: string;
  startingPrice: number;
  currentPrice: number;
  minimumIncrement: number;
  currency: "IDR";
  status: AuctionStatus;
  startsAt: string; // ISO-8601
  endsAt: string; // ISO-8601
  bidCount: number;
  highestBidderId: string | null;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderLabel: string;
  amount: number;
  createdAt: string; // ISO-8601
  sequence: number;
  isSimulated: boolean;
}

export interface AuctionSnapshot {
  auction: Auction;
  bids: Bid[];
  lastSequence: number;
}

export type AuctionEvent =
  | {
      type: "bid.accepted";
      auctionId: string;
      sequence: number;
      bid: Bid;
      currentPrice: number;
      bidCount: number;
      highestBidderId: string;
      occurredAt: string;
    }
  | {
      type: "auction.ended";
      auctionId: string;
      sequence: number;
      winnerId: string | null;
      occurredAt: string;
    };

export type BidRejectionReason =
  | "AUCTION_NOT_LIVE"
  | "BID_TOO_LOW"
  | "INVALID_AMOUNT";

export type BidResult =
  | { ok: true; bid: Bid; snapshot: AuctionSnapshot }
  | {
      ok: false;
      reason: BidRejectionReason;
      message: string;
      minimumNextBid?: number;
      snapshot: AuctionSnapshot;
    };

/**
 * The only data access boundary between the UI and (mock) data.
 * A future HttpAuctionService can implement the same contract.
 */
export interface AuctionService {
  listAuctions(): Promise<Auction[]>;
  getAuction(id: string): Promise<AuctionSnapshot | null>;
  placeBid(auctionId: string, amount: number): Promise<BidResult>;
  subscribe(
    auctionId: string,
    listener: (event: AuctionEvent) => void
  ): () => void;
}
