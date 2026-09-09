"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** COMPONENTS §4 — 28px chip holding a speaker glyph; the site ships muted. */
export function AudioToggle({ dark }: { dark: boolean }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      aria-label={on ? "Mute sound" : "Unmute sound"}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full transition-colors duration-300",
        dark ? "bg-white/12 text-white" : "bg-black/8 text-black",
      )}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M2 5.2h2.2L7.4 2.6v8.8L4.2 8.8H2z" fill="currentColor" />
        {on ? (
          <path
            d="M9.4 4.8a3 3 0 0 1 0 4.4M11 3.2a5.2 5.2 0 0 1 0 7.6"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M9.4 5.4l3.2 3.2M12.6 5.4l-3.2 3.2"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
