"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * A07 — an infinite right→left band at ~90px/s, with a scroll-velocity boost.
 * Two copies of the track are translated so the loop is seamless.
 */
export function Marquee({
  words,
  className,
  speed = 90,
}: {
  words: readonly string[];
  className?: string;
  speed?: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = track.current;
    if (!el || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const half = el.scrollWidth / 2;
    const ctx = gsap.context(() => {
      const tween = gsap.to(el, {
        x: -half,
        duration: half / speed,
        ease: "none",
        repeat: -1,
      });

      // Scroll velocity nudges the loop forward, as in frames 062–078.
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 2200, 2.6);
          gsap.to(tween, { timeScale: boost, duration: 0.4, overwrite: true });
        },
      });

      return () => {
        st.kill();
        tween.kill();
      };
    }, el);

    return () => ctx.revert();
  }, [reduced, speed, words]);

  const content = (
    <span className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span className="whitespace-nowrap">{w}</span>
          <span aria-hidden className="mx-[54px] text-[0.45em] opacity-70">
            +
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={cn("w-full overflow-hidden", className)} aria-hidden>
      <div ref={track} className="flex w-max text-marquee text-white/30">
        {content}
        {content}
      </div>
    </div>
  );
}
