# ABIDIN — Auction & Bid Engine

A polished, **frontend-only** auction marketplace simulator. Browse seeded
auctions, inspect an item, place bids as `You`, watch simulated competing
bidders raise the price in near real time, and see the auction end with a
winner.

> ⚠️ **This is a simulation.** There is no real backend, database,
> authentication, payment, or actual network streaming (no SSE/WebSocket).
> Competing bidders are simulated actors. Refreshing the page resets the
> seeded mock state. Nothing here implies a real transaction.

## Stack

- **Next.js** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** — premium marketplace visual direction
- **TanStack Query** — async server-like state
- **Vitest + React Testing Library** — unit/component tests
- **Playwright** — end-to-end journey tests

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000 → redirects to /auctions
```

### Commands

```bash
npm run dev        # dev server
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run test       # vitest (unit + component)
npm run test:e2e   # playwright (builds + starts prod server first)
npm run build      # production build
```

## How it works

- `AuctionService` is the **only** data boundary between UI and data
  (`src/features/auction/types/auction.types.ts`).
- `MockAuctionService` owns all in-memory auction/bid state. Every bid
  mutation flows through `placeBid()`: validate against latest state →
  mutate once → emit `bid.accepted`.
- `EventSimulator` is an explicit controller (start/pause/resume/trigger)
  that generates simulated competitor bids and emits SSE-shaped events with
  monotonically increasing per-auction sequence numbers.
- The detail view subscribes via `subscribe(auctionId, listener)`;
  duplicate/stale sequences are ignored, gaps trigger a snapshot refetch,
  and all subscriptions/timers are cleaned up on unmount.
- Countdown is always **derived from `endsAt`** — never decremented.
- Money is **integer IDR** — no floating-point arithmetic.

## Demo controls

A discreet floating button (bottom-right, labelled **D**) opens the
demo-only control panel:

- Pause / resume competitor simulator
- Trigger one competitor bid (deterministic outbid demo)
- Force auction end
- Reset mock state

Suggested 2-minute demo script:

1. Open `/auctions` → note Live / Upcoming / Ended cards.
2. Open a Live auction (e.g. *Classic Omega Constellation ’68*).
3. Point out current price, minimum next bid, countdown.
4. Place a valid bid → accepted feedback, history updates.
5. Open demo panel → *Trigger one competitor bid* → outbid feedback.
6. *Force auction end* → winner state, bidding disabled.

## Architecture

```
src/
├── app/                     # routes: /auctions, /auctions/[id]
├── components/
│   ├── layout/              # header/footer shell
│   ├── ui/                  # cards, bid form, history, countdown, ...
│   └── feedback/            # demo control panel
├── features/auction/
│   ├── components/          # (reserved for feature-local UI)
│   ├── hooks/               # use-auctions, use-auction-events, use-countdown
│   ├── services/            # AuctionService provider, mock service, simulator
│   ├── data/                # seeded fixtures
│   ├── schemas/             # bid input parsing/validation
│   ├── types/               # domain types (no React imports)
│   └── utils/               # IDR formatting, min-next-bid, status derivation
└── lib/                     # query client factory
```

## Future backend migration

Keep the `AuctionService` interface; add an `HttpAuctionService` (REST) and
an `EventSource`-based streaming adapter implementing the same subscription
contract. Move all validation, timing, ordering, and winner calculation to
the server. See `docs/PRODUCT_SPEC.md` §17.

## Limitations (by design)

- No real backend APIs, database, or persistence.
- No real SSE/WebSocket — events are in-process.
- No login, registration, or user profiles.
- No payment, checkout, escrow, or settlement.
- No real multi-user sessions or cross-browser sync.
- No production anti-fraud, anti-sniping, or bot protection.
- Client-side validation is UX, not a security boundary.
