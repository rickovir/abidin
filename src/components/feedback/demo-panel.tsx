"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuctionServiceContext } from "../../features/auction/services/auction-service-provider";
import type { SimulatorState } from "../../features/auction/services/event-simulator";

/**
 * Development/demo-only control panel (spec §14). Hidden from normal UI —
 * toggled via a discreet button. Lets the presenter run a deterministic demo:
 * pause/resume competitor activity, fire one competitor bid, force-end the
 * auction, or reset mock state.
 */
export function DemoPanel() {
  const { controls } = useAuctionServiceContext();
  const [open, setOpen] = useState(false);
  const [simState, setSimState] = useState<SimulatorState>(controls.simulator.state);
  const pathname = usePathname();

  // /auctions/<id> → <id>; controls are auction-scoped elsewhere.
  const match = pathname?.match(/^\/auctions\/([^/]+)$/);
  const auctionId = match ? decodeURIComponent(match[1]) : undefined;

  useState(() => {
    controls.simulator.onStateChange(setSimState);
    return undefined;
  });

  const btn =
    "rounded-lg border border-surface-border bg-surface-hover px-3 py-1.5 text-xs font-medium text-content-secondary transition hover:bg-surface-border hover:text-content-primary disabled:opacity-40";

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      {open ? (
        <div
          role="group"
          aria-label="Demo controls"
          className="mb-2 w-56 rounded-2xl border border-surface-border bg-surface-card p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-content-muted">
              Demo controls
            </span>
            <span
              className={cn(
                "size-2 rounded-full",
                simState === "running" ? "bg-abidin-cyan" : "bg-content-muted"
              )}
              aria-label={`Simulator ${simState}`}
            />
          </div>
          <div className="grid gap-1.5">
            <button
              className={btn}
              onClick={() => {
                if (simState === "running") {
                  controls.simulator.pause();
                } else if (simState === "paused") {
                  controls.simulator.resume();
                } else {
                  controls.simulator.start();
                }
              }}
            >
              {simState === "running" ? "Pause competitors" : "Resume competitors"}
            </button>
            <button
              className={btn}
              disabled={!auctionId}
              onClick={() => auctionId && void controls.simulator.triggerBid(auctionId)}
            >
              Trigger one competitor bid
            </button>
            <button
              className={btn}
              disabled={!auctionId}
              onClick={() => auctionId && controls.simulator.forceEnd(auctionId)}
            >
              Force auction end
            </button>
            <button
              className={btn}
              onClick={() => {
                controls.simulator.resetState();
                window.location.reload();
              }}
            >
              Reset mock state
            </button>
          </div>
        </div>
      ) : null}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex size-10 items-center justify-center rounded-full border border-surface-border bg-surface-card/90 text-xs font-bold text-content-secondary shadow-md backdrop-blur transition hover:text-abidin-cyan"
        aria-label="Toggle demo controls"
      >
        {open ? "×" : "D"}
      </button>
    </div>
  );
}
