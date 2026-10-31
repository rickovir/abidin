"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "abidin-theme";

/**
 * Light/dark toggle. Dark is default (Dark Mode First per design system).
 * The actual class is applied by <ThemeScript> before paint; this hook keeps
 * the button icon in sync and persists the choice.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Sync with whatever the bootstrap script applied (async per lint rule).
    const kickoff = setTimeout(
      () => setIsDark(document.documentElement.classList.contains("dark")),
      0
    );
    return () => clearTimeout(kickoff);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // storage unavailable — session-only theme
      }
      return next;
    });
  }, []);

  return { isDark, toggle };
}

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex size-9 items-center justify-center rounded-lg text-content-secondary transition hover:bg-surface-hover hover:text-abidin-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-abidin-cyan"
    >
      {/* Sun (shown in dark mode → click goes light) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={`${isDark ? "block" : "hidden"} size-4.5`}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
      </svg>
      {/* Moon (shown in light mode → click goes dark) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${isDark ? "hidden" : "block"} size-4.5`}
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  );
}
