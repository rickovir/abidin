"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/auctions"
          className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-900 rounded-sm"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-xl bg-stone-900 font-serif text-lg font-bold text-white"
          >
            A
          </span>
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
            ABIDIN
          </span>
          <span className="hidden rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-stone-500 sm:inline">
            Auction &amp; Bid Engine
          </span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/auctions"
            className="rounded-lg px-3 py-2 text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            Auctions
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-stone-500 sm:flex-row sm:px-6">
        <p>
          ABIDIN — frontend-only auction simulator. No real backend, payments, or
          multi-user bidding.
        </p>
        <p>Demo build · Simulated realtime</p>
      </div>
    </footer>
  );
}
