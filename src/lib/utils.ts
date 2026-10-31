/**
 * Tiny class combiner (no external deps): filters falsy, joins, and lets
 * the last conflicting Tailwind class win.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
