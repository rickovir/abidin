"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/auctions"
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-abidin-cyan"
        >
          {/* Logo variants: neon untuk dark, deep-tone untuk light */}
          <Image
            src="/images/logo.png"
            alt="abidin — Auction & Bid Index"
            width={132}
            height={33}
            priority
            className="h-8 w-auto dark:block hidden"
          />
          <Image
            src="/images/logo-light.png"
            alt="abidin — Auction & Bid Index"
            width={132}
            height={33}
            priority
            className="h-8 w-auto dark:hidden block"
          />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/auctions"
            className="rounded-lg px-3 py-2 text-content-secondary transition hover:bg-surface-hover hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-abidin-cyan"
          >
            Auctions
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-border bg-surface-bg">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-content-muted sm:flex-row sm:px-6">
        <p>
          abidin — frontend-only auction simulator. No real backend, payments, or
          multi-user bidding.
        </p>
        <p>Demo build · Simulated realtime</p>
      </div>
    </footer>
  );
}
