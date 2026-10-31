# Implementation Plan --- Real-Time Auction Engine (FE MVP)

-   **Status:** Ready-to-execute baseline
-   **Scope:** Frontend-only MVP
-   **UI:** Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui
-   **State/data:** TanStack Query for async server-like state;
    lightweight local state for transient UI. Zustand is optional, not
    mandatory.
-   **Mock backend:** In-memory `MockAuctionService`
-   **Realtime:** In-process SSE-style event simulator
-   **Testing:** Vitest + React Testing Library + Playwright

------------------------------------------------------------------------

## 1. Execution Principles

1.  Build the smallest end-to-end user journey first.
2.  Agree on domain types and service contracts before parallel UI
    implementation.
3.  Keep mock data and business logic outside React components.
4.  Keep all mutations inside `MockAuctionService`.
5.  Simulate live activity through one event source; do not create
    component-specific timers.
6.  Deliver a working vertical slice early, then polish.
7.  Every phase must pass its acceptance criteria before being
    considered complete.
8.  Do not add login, payment, admin workflows, or a real backend to
    this MVP.

## 2. Recommended Folder Structure

``` text
real-time-auction-engine/
├── public/
│   └── images/
│       └── auctions/
├── docs/
│   ├── PRODUCT_SPEC.md
│   └── IMPLEMENTATION_PLAN.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # redirect or landing
│   │   ├── auctions/
│   │   │   ├── page.tsx             # listing
│   │   │   └── [id]/
│   │   │       └── page.tsx         # detail
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   └── feedback/
│   ├── features/
│   │   └── auction/
│   │       ├── components/
│   │       │   ├── auction-card.tsx
│   │       │   ├── auction-grid.tsx
│   │       │   ├── auction-status.tsx
│   │       │   ├── countdown.tsx
│   │       │   ├── bid-form.tsx
│   │       │   ├── bid-history.tsx
│   │       │   ├── live-indicator.tsx
│   │       │   └── auction-result.tsx
│   │       ├── hooks/
│   │       │   ├── use-auctions.ts
│   │       │   ├── use-auction.ts
│   │       │   ├── use-auction-events.ts
│   │       │   └── use-countdown.ts
│   │       ├── services/
│   │       │   ├── auction-service.ts
│   │       │   ├── mock-auction-service.ts
│   │       │   └── event-simulator.ts
│   │       ├── data/
│   │       │   └── auction-fixtures.ts
│   │       ├── schemas/
│   │       │   └── bid.schema.ts
│   │       ├── types/
│   │       │   └── auction.types.ts
│   │       └── utils/
│   │           ├── format-currency.ts
│   │           └── get-minimum-next-bid.ts
│   ├── lib/
│   │   ├── query-client.ts
│   │   └── utils.ts
│   └── test/
│       ├── setup.ts
│       └── factories/
├── e2e/
│   └── auction-bidding.spec.ts
├── package.json
├── playwright.config.ts
├── vitest.config.ts
└── README.md
```

Adjust names to existing repository conventions if a starter already
exists. Do not introduce extra architectural layers without a concrete
need.

## 3. Phase Overview

  -----------------------------------------------------------------------
  Phase                   Focus                   Exit deliverable
  ----------------------- ----------------------- -----------------------
  0                       Foundation              App boots, tooling and
                                                  routes work

  1                       Domain and contracts    Types, rules, service
                                                  interface agreed

  2                       Mock data and simulator Deterministic mock
                                                  service and event
                                                  stream

  3                       UI foundation and       Premium responsive
                          listing                 listing

  4                       Auction detail and      Complete local bidding
                          bidding                 journey

  5                       Realtime integration    Simulated live activity
                                                  and lifecycle

  6                       QA, accessibility,      Tested, demo-ready MVP
                          polish                  
  -----------------------------------------------------------------------

Recommended order is sequential for Phases 0--2. Phases 3 and 4 can
overlap after the domain types and service contract are stable. Phase 5
integrates the work. Phase 6 is final validation.

------------------------------------------------------------------------

## Phase 0 --- Project Foundation

### Tasks

-   [ ] Create or inspect Next.js App Router project.
-   [ ] Configure TypeScript strict mode.
-   [ ] Configure Tailwind CSS and shadcn/ui.
-   [ ] Configure ESLint and formatting conventions.
-   [ ] Add Vitest, React Testing Library, and Playwright.
-   [ ] Create global layout, font setup, and base styles.
-   [ ] Add route placeholders for `/auctions` and `/auctions/[id]`.
-   [ ] Add environment example only if needed; no secrets are required
    for mock MVP.

### Acceptance criteria

-   [ ] `npm run dev` starts successfully.
-   [ ] Production build succeeds.
-   [ ] Lint and typecheck commands pass.
-   [ ] `/auctions` renders.
-   [ ] `/auctions/[id]` renders a placeholder.
-   [ ] Test runner executes a sample test.
-   [ ] No unnecessary backend/database/auth dependencies are installed.

### Exit gate

A clean, runnable FE project with working routes and test tooling.

------------------------------------------------------------------------

## Phase 1 --- Domain Model and Service Contract

### Tasks

-   [ ] Define `Auction`, `Bid`, `AuctionSnapshot`, `AuctionEvent`,
    `BidResult`, and `AuctionStatus`.
-   [ ] Define `AuctionService` interface.
-   [ ] Define bid validation error codes.
-   [ ] Define IDR money formatting and integer amount convention.
-   [ ] Implement pure utility for minimum next bid.
-   [ ] Implement pure utility for auction status from start/end
    timestamps.
-   [ ] Write unit tests for domain utilities.

### Acceptance criteria

-   [ ] Domain types do not import React or UI modules.
-   [ ] Money is represented as integer IDR amounts.
-   [ ] Minimum next bid is `currentPrice + minimumIncrement`.
-   [ ] Upcoming and ended auctions cannot accept bids.
-   [ ] Error codes are stable and UI-independent.
-   [ ] Unit tests cover valid, invalid, too-low, upcoming, and ended
    cases.

### Exit gate

The UI and mock service can be developed against a stable contract.

------------------------------------------------------------------------

## Phase 2 --- Mock Data, Mock Service, and Event Simulator

### Tasks

-   [ ] Create realistic auction fixtures (at least 4--6 items).
-   [ ] Include live, upcoming, and ended examples.
-   [ ] Include initial bid histories for live/ended auctions.
-   [ ] Implement `MockAuctionService` with in-memory state.
-   [ ] Implement `listAuctions` and `getAuction`.
-   [ ] Implement `placeBid` with validation against current service
    state.
-   [ ] Append accepted bids and update current price/count/highest
    bidder.
-   [ ] Implement subscription registry by auction ID.
-   [ ] Implement event sequence numbers.
-   [ ] Implement simulator controller: start, stop, pause, resume,
    trigger one competitor bid.
-   [ ] Ensure simulator does not start during render.
-   [ ] Ensure subscriptions and timers can be cleaned up.
-   [ ] Add deterministic reset support for tests.

### Acceptance criteria

-   [ ] UI can use the service without importing fixture data.
-   [ ] Accepted bid mutates service state exactly once.
-   [ ] Invalid bid does not mutate state or emit accepted event.
-   [ ] Every accepted event has a monotonically increasing sequence.
-   [ ] Duplicate/stale event handling can be tested.
-   [ ] Simulator only generates bids for live auctions.
-   [ ] Simulator stops at auction end.
-   [ ] Tests can disable random behavior and trigger deterministic
    events.
-   [ ] Test runs do not leak state between cases.

### Exit gate

A fully testable mock domain layer exists independently of the UI.

------------------------------------------------------------------------

## Phase 3 --- UI Foundation and Auction Listing

### Tasks

-   [ ] Define visual tokens: colors, spacing, radius, shadows,
    typography.
-   [ ] Build responsive application shell and navigation.
-   [ ] Build auction card and status badge.
-   [ ] Build listing header and optional simple status filters.
-   [ ] Connect listing to `AuctionService.listAuctions`.
-   [ ] Add loading, empty, and error states.
-   [ ] Add responsive grid behavior.
-   [ ] Add accessible labels and keyboard focus styles.

### Acceptance criteria

-   [ ] Listing renders all seeded auctions.
-   [ ] Each card displays image, title, current price, bid count, and
    status/time.
-   [ ] Clicking a live auction opens its detail route.
-   [ ] Upcoming/ended cards communicate that bidding is unavailable.
-   [ ] Layout works at mobile and desktop viewport sizes.
-   [ ] Images have meaningful alt text.
-   [ ] Loading, empty, and error states are implemented.

### Exit gate

A polished, responsive listing is connected to the service.

------------------------------------------------------------------------

## Phase 4 --- Auction Detail and Bidding Journey

### Tasks

-   [ ] Build auction detail layout and product media section.
-   [ ] Build current price and next valid bid presentation.
-   [ ] Build countdown hook derived from `endsAt`.
-   [ ] Build bid form with amount input and validation.
-   [ ] Connect submit action to `AuctionService.placeBid`.
-   [ ] Add pending, accepted, rejected, and outbid feedback.
-   [ ] Build bid history component.
-   [ ] Build ended/winner state.
-   [ ] Handle unknown auction ID and unavailable auction states.

### Acceptance criteria

-   [ ] Visitor can navigate from listing to a live auction.
-   [ ] Minimum next bid is visible before submission.
-   [ ] Bid below minimum is rejected.
-   [ ] Valid bid is accepted and updates detail UI.
-   [ ] Submit button cannot be double-submitted while pending.
-   [ ] Bid history shows newest entry first.
-   [ ] Own bid is labeled `You`.
-   [ ] Upcoming/ended auction cannot be bid on.
-   [ ] Countdown reaches zero and shows ended state.
-   [ ] Winner/no-winner is displayed accurately for mock state.

### Exit gate

The complete single-user bidding journey works without realtime
competitors.

------------------------------------------------------------------------

## Phase 5 --- Realtime Simulation Integration

### Tasks

-   [ ] Connect detail view to `subscribe(auctionId, listener)`.
-   [ ] Apply events to the shared query cache or chosen shared state.
-   [ ] Ignore stale and duplicate sequence numbers.
-   [ ] Refetch snapshot if a sequence gap is detected.
-   [ ] Add live activity indicator.
-   [ ] Start/stop competitor simulator at an explicit lifecycle
    boundary.
-   [ ] Add pause/resume and manual trigger controls for demo/testing.
-   [ ] Ensure simulator stops when auction ends.
-   [ ] Ensure subscriptions and timers are cleaned up on navigation.
-   [ ] Handle visitor being outbid by a simulated competitor.

### Acceptance criteria

-   [ ] A simulated competitor bid updates price and bid history without
    refresh.
-   [ ] Event updates are applied once and in sequence.
-   [ ] Stale/duplicate events do not regress the UI.
-   [ ] Sequence gap causes snapshot recovery.
-   [ ] Live indicator reflects simulator state.
-   [ ] Leaving the page stops its subscription.
-   [ ] No timer or listener leaks after repeated navigation.
-   [ ] User sees clear outbid feedback when a competitor surpasses
    their bid.

### Exit gate

The auction feels live and remains deterministic enough for a controlled
demo.

------------------------------------------------------------------------

## Phase 6 --- QA, Accessibility, and Demo Polish

### Tasks

-   [ ] Unit-test domain rules and utilities.
-   [ ] Integration-test mock service mutations and event delivery.
-   [ ] Component-test bid form and key states.
-   [ ] Add Playwright test for listing → detail → bid → competitor
    outbid → ended.
-   [ ] Test mobile and desktop layouts.
-   [ ] Test keyboard-only navigation and visible focus.
-   [ ] Test reduced-motion preference.
-   [ ] Check image loading and fallback behavior.
-   [ ] Verify no console errors or unhandled promise rejections.
-   [ ] Prepare deterministic demo seed and script.
-   [ ] Document limitations and run commands in README.

### Acceptance criteria

-   [ ] All unit and integration tests pass.
-   [ ] Critical E2E journey passes.
-   [ ] No critical accessibility blocker in core bidding flow.
-   [ ] No horizontal overflow at target mobile viewport.
-   [ ] No console errors during normal demo.
-   [ ] Demo can be reset to a known state.
-   [ ] README states no real backend, persistence, authentication, or
    actual SSE is implemented.
-   [ ] Production build succeeds.

### Exit gate

The MVP is stable, understandable, and ready to present.

------------------------------------------------------------------------

## 4. Parallel Work Breakdown

Parallelize only after Phase 1 contracts are merged.

  --------------------------------------------------------------------------
  Workstream           Ownership         Scope             Dependency
  -------------------- ----------------- ----------------- -----------------
  A --- Domain/mock    FE engineer A     Types, fixtures,  Phase 1
  service                                mock service,     
                                         simulator         

  B --- UI             FE engineer B     Tokens, layout,   Phase 1 types
  foundation/listing                     listing, cards    

  C --- Detail/bidding FE engineer C     Detail, bid form, Phase 1 types;
  UI                                     history,          mock service
                                         countdown         contract

  D --- QA/integration FE engineer D or  Test plan, test   Contracts and
                       shared            harness, E2E,     feature branches
                                         integration       
  --------------------------------------------------------------------------

If the team is smaller: - 1 developer: execute phases sequentially. - 2
developers: A owns service/domain; B owns UI. Agree on contracts
first. - 3 developers: A service/domain, B listing/layout, C
detail/bidding. One owner integrates SSE simulator and E2E. - 4
developers: use the four workstreams above.

### Integration rules

-   Merge domain types and service interface first.
-   UI developers use the interface and deterministic fixtures; do not
    create their own mock data stores.
-   Only one owner modifies the mock service/event simulator.
-   Avoid simultaneous edits to global layout, package configuration,
    and shared tokens.
-   Integrate to main at least once per phase; do not wait until the
    end.

------------------------------------------------------------------------

## 5. Suggested Commands

Adapt to package manager and project scripts.

``` bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:watch
npm run test:e2e
npm run build
```

Suggested `package.json` scripts: - `dev`: `next dev` - `build`:
`next build` - `start`: `next start` - `lint`: `next lint` or configured
ESLint command - `typecheck`: `tsc --noEmit` - `test`: `vitest run` -
`test:watch`: `vitest` - `test:e2e`: `playwright test`

Confirm the correct Next.js version and lint command before adopting
scripts.

------------------------------------------------------------------------

## 6. Testing Strategy

### Unit tests

-   minimum next bid calculation;
-   bid amount validation;
-   auction status derivation;
-   currency formatting;
-   countdown formatting.

### Mock service integration tests

-   accepted bid updates price/count/highest bidder;
-   too-low bid is rejected without mutation;
-   ended/upcoming auction rejects bid;
-   event emitted only after successful mutation;
-   sequence increments exactly once;
-   unsubscribe prevents further callbacks;
-   simulator does not bid after end.

### Component tests

-   bid form default amount;
-   invalid amount message;
-   pending button state;
-   accepted/rejected feedback;
-   ended auction disables form;
-   bid history ordering and own-bid label.

### E2E scenarios

1.  Browse listing and open a live auction.
2.  Submit a valid bid and see it in history.
3.  Submit a too-low bid and see rejection.
4.  Trigger competitor bid and see price update.
5.  Verify outbid feedback.
6.  End auction and verify bidding is disabled and result appears.

Do not use random timers in tests. Use fake timers or explicit simulator
controls.

------------------------------------------------------------------------

## 7. AI Coding Agent Instructions

Use the following as repository-level instructions for Copilot, Cursor,
or another coding agent.

### Role

Act as a senior frontend engineer implementing a frontend-only auction
MVP. Prioritize correctness, clear UX, maintainability, and a reliable
demo over unnecessary abstraction.

### Product constraints

-   This is a frontend-only MVP.
-   Do not create a real backend, database, authentication, payment, or
    admin system.
-   Do not implement actual HTTP SSE or WebSocket in this phase.
-   Use an in-process mock event simulator that mirrors the future event
    contract.
-   There is one local human bidder (`You`) and simulated competing
    bidders.
-   Use the premium marketplace visual direction.
-   Do not claim the mock is production-ready or supports real
    multi-user concurrency.

### Architecture constraints

-   Use Next.js App Router, TypeScript strict mode, and Tailwind CSS.
-   Use the `AuctionService` interface as the UI's only data access
    boundary.
-   Keep fixtures, mock state, validation, and event simulation outside
    React components.
-   All bid mutations must pass through `MockAuctionService.placeBid`.
-   Components must not mutate auction state directly.
-   Keep domain types independent from UI components.
-   Use integer IDR values; avoid floating-point money arithmetic.
-   Keep event sequence handling explicit and deterministic.
-   Clean up every subscription and timer.
-   Prefer existing project conventions and installed dependencies over
    adding new libraries.

### Implementation workflow

Before coding: 1. Inspect the existing repository and report its
framework, package manager, scripts, and conventions. 2. Read
`docs/PRODUCT_SPEC.md` and `docs/IMPLEMENTATION_PLAN.md`. 3. Identify
the current phase and its acceptance criteria. 4. List files expected to
change. 5. Call out ambiguities or conflicts before making architectural
changes.

While coding: 1. Implement only the requested phase/task. 2. Avoid
unrelated refactors. 3. Reuse shared components and utilities. 4. Add or
update tests with behavior changes. 5. Keep components small and
accessible. 6. Handle loading, empty, error, pending, success, and
unavailable states where relevant. 7. Do not add placeholder buttons
that appear functional but do nothing. 8. Do not invent API endpoints or
backend behavior.

After coding: 1. Run relevant tests. 2. Run lint and typecheck where
available. 3. Run production build at integration milestones. 4. Report
files changed, behavior implemented, tests run, results, and known
limitations. 5. Map each acceptance criterion to evidence (test,
screenshot, or manual verification). 6. Do not mark a task complete if
its acceptance criteria have not been verified.

### Definition of done for each task

-   Implementation matches the specification.
-   No TypeScript errors.
-   Relevant tests pass.
-   No obvious accessibility regression.
-   No unrelated files changed.
-   Any limitation is explicitly reported.

### Agent task prompt template

``` text
You are implementing [PHASE / TASK] for the frontend-only Real-Time Auction Engine MVP.

First inspect the repository and the two specification documents.
Do not implement work outside this task.

Task:
[Describe one bounded task.]

Relevant acceptance criteria:
[Paste exact criteria from IMPLEMENTATION_PLAN.md.]

Constraints:
- Next.js App Router + TypeScript + Tailwind.
- Use AuctionService; do not access fixtures from UI.
- Use MockAuctionService only; no real backend or database.
- Use the in-process event simulator; no actual SSE/WebSocket.
- No authentication or payment.
- Preserve premium marketplace design direction.
- Add/update tests.

Before finishing:
- Run relevant tests, lint, typecheck, and build as applicable.
- List changed files.
- Report acceptance criteria as PASS / FAIL / NOT VERIFIED.
- Report remaining risks or follow-up work.
```

------------------------------------------------------------------------

## 8. Demo Runbook

Prepare a deterministic demo rather than relying on random events.

1.  Open `/auctions`.
2.  Select a seeded live auction.
3.  Point out current price, next valid bid, and countdown.
4.  Place a valid bid as `You`.
5.  Trigger one simulated competitor bid.
6.  Show the updated price and outbid feedback.
7.  Place another bid if time allows.
8.  Trigger auction end.
9.  Show winner/result state.
10. Reset simulator before the next demo.

Keep a backup auction fixture with a longer duration in case the live
demo takes longer than expected.

## 9. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Random simulator makes demo         Deterministic trigger and
  unpredictable                       pause/resume controls

  Components duplicate business rules Centralize rules in domain
                                      utilities/mock service

  Timer/subscription leaks            Explicit lifecycle cleanup and
                                      tests

  UI and service drift                Freeze service contract before
                                      parallel work

  Mock appears to be real realtime    Label it as simulated in docs and
                                      demo

  Money formatting/rounding bugs      Integer IDR values only

  Countdown depends on interval drift Derive remaining time from `endsAt`
                                      on each tick

  Scope expands                       Enforce non-goals and phase exit
                                      gates
  -----------------------------------------------------------------------

## 10. Final Release Checklist

-   [ ] Product spec and implementation plan committed.
-   [ ] All MVP acceptance criteria passed.
-   [ ] Listing and detail responsive.
-   [ ] Valid and invalid bid paths work.
-   [ ] Competitor simulation works deterministically.
-   [ ] Countdown and end-state work.
-   [ ] No duplicate/stale event regression.
-   [ ] All subscriptions and timers clean up.
-   [ ] Unit, integration, and E2E tests pass.
-   [ ] Lint, typecheck, and build pass.
-   [ ] README explains mock-only limitations.
-   [ ] Demo runbook rehearsed.
