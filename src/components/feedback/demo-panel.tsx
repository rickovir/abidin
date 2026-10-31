"use client";


import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuctionServiceContext } from "../../features/auction/services/auction-service-provider";
import type { SimulatorState } from "../../features/auction/services/event-simulator";

/**
 * Development/demo-only control panel (spec §14). Hidden from normal UI —
 * toggled via a discreet button. Lets the presenter run a deterministic demo:
 * pause/resume competitor activity, fire one competitor bid, force-end the
 * auction, or reset mock state.
 */
export function DemoPanel({ auctionId }: { auctionId?: string }) {
  const { controls } = useAuctionServiceContext();
  const [open, setOpen] = useState(false);
  const [simState, setSimState] = useState<SimulatorState>(controls.simulator.state);

  useState(() => {
    controls.simulator.onStateChange(setSimState);
    return undefined;
  });

  const btn =
    "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-40";

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      {open ? (
        <div
          role="group"
          aria-label="Demo controls"
          className="mb-2 w-56 rounded-2xl border border-stone-200 bg-white p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Demo controls
            </span>
            <span
              className={cn(
                "size-2 rounded-full",
                simState === "running" ? "bg-emerald-500" : "bg-stone-300"
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
        className="flex size-10 items-center justify-center rounded-full border border-stone-300 bg-white/90 text-xs font-bold text-stone-600 shadow-md backdrop-blur transition hover:bg-white"
        aria-label="Toggle demo controls"
      >
        {open ? "×" : "D"}
      </button>
    </div>
  );
}
