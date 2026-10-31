"use client";

import { cn } from "@/lib/utils";

const FALLBACK = "--:--:--";

export function Countdown({
  msLeft,
  className,
}: {
  msLeft: number;
  className?: string;
}) {
  // NaN = clock not mounted yet (SSR/prerender) → neutral placeholder.
  const label = Number.isNaN(msLeft) ? FALLBACK : labelFromMs(msLeft);
  const urgent = !Number.isNaN(msLeft) && msLeft > 0 && msLeft <= 60_000;
  const over = !Number.isNaN(msLeft) && msLeft <= 0;

  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        "text-2xl font-semibold",
        urgent && "text-amber-600",
        over && "text-stone-400",
        className
      )}
      suppressHydrationWarning
    >
      {label}
    </span>
  );
}

function labelFromMs(msLeft: number): string {
  if (msLeft <= 0) return "00:00:00";
  const totalSeconds = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
