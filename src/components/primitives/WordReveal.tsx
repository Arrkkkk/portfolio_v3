"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
  as?: "h2" | "p" | "div";
  from?: string;
  to?: string;
};

/**
 * A05 — scrubbed word-by-word colour reveal.
 *
 * Critically this is *scrubbed*, not timed: frames 038–039 show the reveal front
 * halting the moment scrolling pauses. Colour is the only property that changes —
 * no y-offset, no opacity, no clip.
 *
 * The start colour is `--text-lo`, not the `--text-mid` (#AAAAAA) measured off
 * the reference. Against the #F2F2F2 end that measured pair is only 2.08:1
 * apart, and the reveal was genuinely hard to see while scrolling; #6E6E6E
 * gives 4.55:1, a bit over double the swing. It is the existing third step of
 * the text ramp rather than a one-off grey, and it holds 3.79:1 against the
 * background — still clear of the 3:1 WCAG AA floor for large text, which is
 * what every WordReveal is. Logged as a deliberate delta in
 * REPLICATION-CHECKLIST.md. Changing `--color-text-mid` itself would have
 * dragged every mono caption, badge and footer line down with it.
 */
export function WordReveal({
  text,
  className,
  as: Tag = "p",
  from = "var(--color-text-lo)",
  to = "var(--color-text-hi)",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>(".reveal-word"));
    if (!words.length) return;

    if (reduced) {
      gsap.set(words, { color: to });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { color: from },
        {
          color: to,
          ease: "none",
          stagger: 1,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced, from, to, text]);

  return (
    <Tag ref={ref as never} className={cn(className)} style={{ color: from }}>
      {text.split(" ").map((word, i, all) => (
        <span key={`${word}-${i}`} className="reveal-word">
          {word}
          {i < all.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
