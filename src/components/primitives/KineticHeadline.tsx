"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * A03 — the hero's final word cycles on a ~3s loop with a per-glyph blur swap
 * (frames 013 → 019 → 027). The outgoing word is taken out of flow during the
 * crossfade so the preceding words never reflow.
 */
export function KineticHeadline({
  prefix,
  words,
  className,
}: {
  prefix: string;
  words: readonly string[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const slot = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), 3000);
    return () => window.clearInterval(id);
  }, [reduced, words.length]);

  useEffect(() => {
    const el = slot.current;
    if (!el || reduced) return;
    const chars = el.querySelectorAll(".blur-char");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0, filter: "blur(12px)", y: 6 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 0.5,
          ease: "expo.out",
          stagger: { each: 0.025, from: "random" },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [index, reduced]);

  return (
    <h1 className={cn("text-hero track-display", className)}>
      <span className="block">{prefix}</span>
      <span ref={slot} key={index} className="block">
        {Array.from(words[index]).map((ch, i) => (
          <span key={`${ch}-${i}`} className="blur-char">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </h1>
  );
}
