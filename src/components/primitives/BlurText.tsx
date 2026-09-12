"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE } from "@/animations/easings";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  /** Play immediately instead of waiting for the scroll trigger (hero entrance). */
  immediate?: boolean;
  /**
   * Hold the glyphs blurred and create no trigger of its own, so an outside
   * timeline can resolve them on its own cue. Used where the resolve is one
   * beat of a longer sequence rather than a reaction to the heading scrolling
   * into view — its own trigger would fire on the element's position and land
   * wherever that happens to be.
   */
  manual?: boolean;
  delay?: number;
};

/**
 * A18 — per-glyph blur resolve. This is the reference's motion signature: every
 * major heading resolves out of a heavy blur, glyph by glyph, in a randomised
 * order (frames 011, 079, 180, 244, 269, 309, 316).
 *
 * Words stay as inline-block units so wrapping behaves exactly like plain text.
 */
export function BlurText({
  text,
  as: Tag = "span",
  className,
  immediate = false,
  manual = false,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const chars = Array.from(el.querySelectorAll<HTMLElement>(".blur-char"));
    if (!chars.length) return;

    if (reduced) {
      gsap.set(chars, { opacity: 1, filter: "none", y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const from = { opacity: 0, filter: "blur(10px)", y: 8 };
      const to = {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 0.5,
        ease: EASE.out,
        delay,
        stagger: { each: 0.03, from: "random" as const },
      };

      if (manual) {
        gsap.set(chars, from);
      } else if (immediate) {
        gsap.fromTo(chars, from, to);
      } else {
        gsap.fromTo(chars, from, {
          ...to,
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [reduced, immediate, manual, delay, text]);

  return (
    <Tag ref={ref as never} className={cn(className)}>
      {text.split(" ").map((word, w, all) => (
        <span key={`${word}-${w}`} className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch, i) => (
            <span key={`${ch}-${i}`} className="blur-char">
              {ch}
            </span>
          ))}
          {w < all.length - 1 ? <span className="blur-char">&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
}
