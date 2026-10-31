"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuctions } from "../../features/auction/hooks/use-auctions";
import { AuctionCard } from "@/components/ui/auction-card";
import { cn } from "@/lib/utils";
import type { AuctionStatus } from "../../features/auction/types/auction.types";

type Filter = "all" | AuctionStatus;

export function AuctionListing() {
  const { data, isLoading, isError, error, refetch } = useAuctions();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data;
    return data.filter((a) => a.status === filter);
  }, [data, filter]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Live auctions
          </h1>
          <p className="mt-2 max-w-xl text-sm text-stone-600">
            Curated items on the block right now. Watch the price move in real
            time and place your bid before the clock runs out.
          </p>
        </div>
        <div role="group" aria-label="Filter auctions" className="flex gap-1.5 self-start">
          {(["all", "live", "upcoming", "ended"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition",
                filter === f
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 ring-1 ring-inset ring-stone-200 hover:bg-stone-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading auctions">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse motion-reduce:animate-none">
              <div className="aspect-[4/3] rounded-2xl bg-stone-200" />
              <div className="mt-3 h-4 w-2/3 rounded bg-stone-200" />
              <div className="mt-2 h-4 w-1/3 rounded bg-stone-200" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
          <p className="font-semibold text-red-800">Couldn&apos;t load auctions</p>
          <p className="mt-1 text-sm text-red-700">
            {(error as Error | undefined)?.message ?? "Something went wrong."}
          </p>
          <button
            onClick={() => void refetch()}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-12 text-center">
          <p className="font-semibold text-stone-700">
            {filter === "all" ? "No auctions yet" : `No ${filter} auctions right now`}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Check back soon — new items go on the block regularly.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Auction list">
          {filtered.map((auction) => (
            <li key={auction.id}>
              <AuctionCard auction={auction} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
