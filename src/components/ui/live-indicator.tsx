"use client";

import { cn } from "@/lib/utils";

export function LiveIndicator({
  connection,
  className,
}: {
  connection: "live" | "reconnecting" | "paused";
  className?: string;
}) {
  const config = {
    live: {
      label: "Live",
      dot: "bg-abidin-cyan",
      text: "text-abidin-cyan",
      ring: "ring-abidin-cyan/30 bg-abidin-cyan/10",
    },
    reconnecting: {
      label: "Reconnecting…",
      dot: "bg-abidin-orange animate-pulse motion-reduce:animate-none",
      text: "text-abidin-orange",
      ring: "ring-abidin-orange/30 bg-abidin-orange/10",
    },
    paused: {
      label: "Paused",
      dot: "bg-content-muted",
      text: "text-content-secondary",
      ring: "ring-surface-border bg-surface-hover",
    },
  }[connection];

  return (
    <span
      role="status"
      aria-label={`Live activity: ${config.label}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset",
        config.ring,
        config.text,
        className
      )}
    >
      <span aria-hidden="true" className={cn("size-2 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
