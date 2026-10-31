# Product Specification --- Real-Time Auction Engine (FE MVP)

-   **Status:** Draft baseline for implementation
-   **Product type:** Frontend-only auction experience / interactive
    simulator
-   **Primary audience:** Hackathon judges and demo users
-   **UI direction:** Premium marketplace --- modern, polished, minimal
-   **Realtime approach:** Mock SSE-style event simulator (no network
    stream)
-   **Bidding mode:** Single local user with simulated competing bidders
-   **Backend:** Mock service and in-memory state only
-   **Authentication:** Out of scope

------------------------------------------------------------------------

## 1. Product Overview

Build a polished auction marketplace experience where a visitor can
discover active auctions, inspect an item, place a bid, and see auction
activity update in near real time.

The MVP is intentionally frontend-only. It demonstrates the user
experience and client-side behavior of an auction product; it does
**not** claim to provide production-grade auction integrity,
persistence, authentication, or real multi-user concurrency.

The mock service is the single interface between UI and data. A future
backend can replace the mock implementation without requiring the UI to
be rewritten.

## 2. Problem and Opportunity

A convincing auction demo needs more than a product card and a bid
button. Users should understand: - what is being auctioned; - the
current highest bid and the next valid bid; - how much time remains; -
whether their bid was accepted or they have been outbid; - what happened
recently in the auction.

The MVP focuses on making this core journey clear, responsive, and
demo-friendly.

## 3. Product Goal

Enable a visitor to complete this journey:

1.  Browse available auctions.
2.  Open an auction detail page.
3.  Understand the current price, minimum next bid, and remaining time.
4.  Place a valid bid.
5.  Receive clear accepted/rejected feedback.
6.  See the bid history and simulated live activity update.
7.  Understand when the auction has ended and who won in the simulated
    scenario.

## 4. Non-goals

The MVP will not implement: - real backend APIs or a database; - real
SSE, WebSocket, or network-based streaming; - login, registration, user
profiles, or authorization; - payment, checkout, escrow, or
settlement; - seller/admin management workflows; - real multi-user
sessions or cross-browser synchronization; - production anti-fraud,
anti-sniping, or bot protection; - multi-currency, localization, or
advanced analytics; - guaranteed server-authoritative auction timing or
bid ordering.

These limitations must be documented in the README and must not be
obscured during the demo.

## 5. Target User and Demo Persona

**Visitor / bidder:** a person evaluating an item and deciding whether
to submit a bid.

For the MVP, the visitor is assigned a stable demo identity such as
`You`. Competing bidders are simulated actors with clearly fictional
display names. No personal information is collected.

## 6. Core User Stories

### US-01 --- Browse auctions

As a visitor, I want to see available auctions so that I can choose an
item to inspect.

**Acceptance criteria** - Listing displays seeded auctions with image,
title, category, current price, bid count, and remaining time or
status. - Auctions are distinguishable by `Upcoming`, `Live`, and
`Ended` states. - Selecting a live auction opens its detail page. -
Empty and loading states are implemented even if the mock service
resolves quickly. - Listing layout works at mobile and desktop widths.

### US-02 --- Inspect auction details

As a visitor, I want to understand an auction before bidding.

**Acceptance criteria** - Detail view displays item image, title,
description, condition, current price, minimum increment, next valid
bid, countdown, status, and bid history. - The current user identity is
clearly identified as `You` in their own bid entries. - The UI clearly
communicates when bidding is unavailable. - The detail page handles an
unknown auction ID with a not-found state.

### US-03 --- Place a bid

As a visitor, I want to submit a bid so that I can compete for an item.

**Acceptance criteria** - Bid input is prefilled with the minimum valid
next bid. - User can increase or edit the amount. - Client validates
that the amount is a valid positive monetary amount and is at least the
minimum next bid. - Submission is disabled while a bid is being
processed. - Accepted bids update the current price, bid count, and bid
history. - Rejected bids show a useful, non-technical explanation and
preserve the user's ability to try again. - A bid cannot be submitted
for an upcoming or ended auction. - A successful bid produces a visible
confirmation state. - A bid rejected because the simulated current price
changed displays the latest minimum next bid.

### US-04 --- Observe live activity

As a visitor, I want to see auction activity update without manually
refreshing the page.

**Acceptance criteria** - A mock event simulator emits events for the
currently viewed live auction. - Simulated competing bidders can place
valid bids and update price/history. - UI updates from the same event
subscription used by the feature, not from components independently
mutating auction state. - Events have monotonically increasing sequence
numbers per auction. - Duplicate or stale sequence numbers are
ignored. - A visible `Live` / `Reconnecting` / `Paused` indicator
reflects simulator state. - Simulator can be paused/resumed for a
deterministic demo. - Simulator activity stops when an auction is ended
or the user leaves the active detail view (subscription cleanup).

### US-05 --- Track auction time and ending

As a visitor, I want to know how much time remains and what happens when
time expires.

**Acceptance criteria** - Countdown is derived from auction `endsAt`,
not decremented as the source of truth. - UI updates the displayed
countdown at least once per second. - When the countdown reaches zero,
the local auction state transitions to `Ended`. - Bidding is disabled
after the auction ends. - Winner is the highest valid bid in the mock
state; no-bid auctions display `No winner`. - The end-state UI is clear
and does not imply a real transaction or payment.

### US-06 --- Review bid history

As a visitor, I want to understand how the price changed.

**Acceptance criteria** - Bid history is ordered newest first. - Each
entry displays bidder label, amount, and time. - The user's own bid is
visually distinguishable. - New accepted bids appear without a page
refresh. - The history has a sensible empty state.

## 7. MVP Screens

### 7.1 Auction listing (`/auctions`)

-   Premium marketplace header and navigation.
-   Page title and concise explanatory copy.
-   Optional category/status filter only if it does not delay core flow.
-   Auction cards with strong product imagery and clear price/status
    hierarchy.
-   Responsive grid and loading/empty/error states.

### 7.2 Auction detail (`/auctions/[id]`)

-   Product media and descriptive information.
-   Bid panel with current price, minimum increment, next valid bid,
    amount input, and primary action.
-   Countdown and auction status.
-   Bid activity/history.
-   Live activity status.
-   Clear feedback for accepted, rejected, and outbid states.

### 7.3 Not-found / unavailable states

-   Unknown auction ID.
-   Upcoming auction.
-   Ended auction.
-   No bids yet.

## 8. Business Rules and Client-side Validation

All rules below are simulated in the frontend and are not security
boundaries.

1.  **Minimum next bid:** `currentPrice + minimumIncrement`.
2.  **Bid amount:** must be a finite positive integer in the currency's
    smallest supported unit. For the MVP, use whole IDR amounts.
3.  **Auction status:** only `Live` auctions accept bids.
4.  **Bid acceptance:** mock service validates against its latest
    in-memory state at submission time.
5.  **Current price:** for this MVP, current price equals the amount of
    the highest accepted bid, or the configured starting price if no
    bids exist.
6.  **Bid history:** accepted bid records are append-only within the
    running browser session.
7.  **Winner:** highest accepted bid at auction end.
8.  **Time:** `endsAt` is the source for countdown display. The browser
    clock is only a demo clock and can be manipulated.
9.  **Simulated competitors:** generated bids must follow the same
    minimum-increment and auction-status rules.
10. **No real concurrency guarantee:** a single local mock store
    serializes its own operations, but this does not model distributed
    locking or real concurrent users.

## 9. Data Model

Use TypeScript domain types. Keep domain types independent of UI
component types.

``` ts
type AuctionStatus = "upcoming" | "live" | "ended";

interface Auction {
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
  endsAt: string;   // ISO-8601
  bidCount: number;
  highestBidderId: string | null;
}

interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderLabel: string;
  amount: number;
  createdAt: string; // ISO-8601
  sequence: number;
  isSimulated: boolean;
}

interface AuctionSnapshot {
  auction: Auction;
  bids: Bid[];
  lastSequence: number;
}

type AuctionEvent =
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

type BidResult =
  | { ok: true; bid: Bid; snapshot: AuctionSnapshot }
  | {
      ok: false;
      reason: "AUCTION_NOT_LIVE" | "BID_TOO_LOW" | "INVALID_AMOUNT";
      message: string;
      minimumNextBid?: number;
      snapshot: AuctionSnapshot;
    };
```

Money values are integer IDR amounts; do not use floating-point
arithmetic for money.

## 10. Mock Service Contract

The UI must depend on an interface, not directly on fixture arrays or
simulator internals.

``` ts
interface AuctionService {
  listAuctions(): Promise<Auction[]>;
  getAuction(id: string): Promise<AuctionSnapshot | null>;
  placeBid(auctionId: string, amount: number): Promise<BidResult>;
  subscribe(
    auctionId: string,
    listener: (event: AuctionEvent) => void
  ): () => void;
}
```

Implementation requirements: - `MockAuctionService` owns the in-memory
auction and bid state. - Seed data is cloned before mutation to avoid
fixture pollution across tests. - All bid mutations go through one
service method. - The service validates using the latest state, then
mutates state, then emits the accepted event. - Subscription returns an
unsubscribe function. - Simulated competitor activity is started/stopped
through an explicit simulator controller, not hidden inside a React
render. - Provide deterministic controls for tests and demo mode (pause,
resume, trigger one competitor bid). - Add small configurable mock
latency only where it improves perceived realism; tests should be able
to disable it.

## 11. Realtime Simulation Contract

This MVP uses an in-process event simulator. It is **not actual HTTP
streaming or SSE**.

The simulator should mimic the client-facing event shape expected from a
future SSE adapter: - event type; - auction ID; - monotonically
increasing per-auction sequence; - event payload; - event timestamp.

Client event handling: 1. Verify the event belongs to the currently
selected auction. 2. Ignore event sequence values less than or equal to
the last applied sequence. 3. Apply accepted bid data to the shared
client cache/store. 4. Do not optimistically invent competitor bids in
the UI. 5. On a sequence gap, refetch the auction snapshot from the
service. 6. Clean up listeners and timers on unmount or when auction ID
changes.

## 12. UX and Visual Requirements

**Visual direction:** premium marketplace, editorial product
photography, restrained colors, generous whitespace, clear typography,
subtle borders/shadows, and purposeful motion.

Requirements: - Product imagery is prominent and consistently cropped. -
Current price is the strongest numeric element on the detail page. -
Next valid bid is explicit and easy to understand. - Primary bid action
is visually dominant. - Countdown is readable but not excessively
alarming. - Live status is visible and accessible. - Feedback uses clear
text, not color alone. - Focus states, keyboard navigation, labels, and
sufficient contrast are required. - Respect `prefers-reduced-motion`. -
Layout supports narrow mobile screens and desktop. - Avoid decorative
complexity that competes with the bid action.

## 13. Error and Edge States

Implement and verify: - listing loading, empty, and error; - auction not
found; - upcoming auction cannot be bid on; - ended auction cannot be
bid on; - invalid or too-low bid; - bid submission in progress; -
accepted bid; - user gets outbid by simulated competitor; - simulator
paused; - simulator reconnecting/recovery state (simulated); - auction
ends while detail page is open; - event duplicate/stale sequence; -
subscription cleanup when navigating away.

## 14. Analytics / Demo Instrumentation

No external analytics are required. For demo observability, optionally
expose a small development-only control panel: - pause/resume competitor
simulator; - trigger a competitor bid; - force auction end; - reset mock
state.

Do not expose these controls as normal user-facing product features in
the polished demo unless intentionally presented as a demo mode.

## 15. Quality Attributes

-   TypeScript strict mode.
-   No `any` in domain/service code.
-   No direct fixture access from UI components.
-   No business logic duplicated between components.
-   All intervals and subscriptions cleaned up.
-   Core interactions keyboard accessible.
-   Core business rules covered by unit tests.
-   Main journey covered by Playwright.
-   No console errors during the demo.
-   No fake claim of real multi-user or production realtime behavior.

## 16. Definition of Done

The MVP is complete when: - A visitor can browse seeded auctions. - A
visitor can open a live auction. - A visitor can place a valid bid. -
Invalid and too-low bids are rejected with clear feedback. - A simulated
competing bidder can outbid the visitor. - Price and bid history update
through the event subscription. - Countdown reaches zero and transitions
to ended state. - Bidding is disabled after the auction ends. -
Winner/no-winner state is shown. - Refreshing the page reloads the
seeded mock state (persistence is not required). - Responsive and
accessibility basics are validated. - Unit, integration, and critical
E2E tests pass. - README clearly states this is a frontend-only
simulation.

## 17. Future Backend Migration

When a real backend becomes available: - Keep the `AuctionService`
interface. - Add `HttpAuctionService` for REST calls. - Add an
`EventSource`-based streaming adapter implementing the same subscription
contract. - Replace mock fixtures with API responses. - Move all bid
validation, auction timing, ordering, and winner calculation to the
server. - Treat server snapshots/events as authoritative. - Add
authentication/authorization and persistence only when required by
product scope.

Do not design the MVP as if client-side validation can enforce real
auction integrity.
