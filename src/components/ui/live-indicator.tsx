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
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      ring: "ring-emerald-600/20 bg-emerald-50",
    },
    reconnecting: {
      label: "Reconnecting…",
      dot: "bg-amber-500 animate-pulse motion-reduce:animate-none",
      text: "text-amber-700",
      ring: "ring-amber-600/20 bg-amber-50",
    },
    paused: {
      label: "Paused",
      dot: "bg-stone-400",
      text: "text-stone-600",
      ring: "ring-stone-500/20 bg-stone-100",
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
