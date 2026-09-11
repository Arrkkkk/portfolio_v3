"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * A07 — an infinite right→left band at ~90px/s, with a scroll-velocity boost.
 *
 * The track is tiled with identical copies of the word list and translated by
 * exactly one copy's width, which is what makes the wrap invisible.
 *
 * The copy count is measured, not fixed at two. One pass has to be wider than
 * the viewport or the wrap leaves a gap at the right edge, and whether it is
 * depends entirely on how long the words happen to be: "EXPLORE + BUILD +
 * EVOLVE" measures 1691px against a 1710px viewport and tore, where the longer
 * list it replaced did not. Deriving the count from the measured width means
 * the copy can change without anyone having to remember this.
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
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    const el = track.current;
    if (!el) return;

    const pass = el.scrollWidth / copies;
    if (!pass) return;

    // +1 so a full pass can always scroll in behind the one leaving.
    const needed = Math.max(
      2,
      Math.ceil((el.parentElement?.clientWidth ?? window.innerWidth) / pass) + 1,
    );
    if (needed !== copies) {
      setCopies(needed);
      return; // re-measure on the next pass, with the right number rendered
    }

    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tween = gsap.to(el, {
        x: -pass,
        duration: pass / speed,
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
  }, [reduced, speed, words, copies]);

  // A narrower viewport needs more copies to cover it; re-measure on resize.
  useEffect(() => {
    const onResize = () => setCopies(2);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
      {/*
        font-medium is a deliberate exception to CLAUDE.md's "weight 400
        display only" rule. Measured stem:cap ratio against frame 070 (~0.145)
        put Book 400 ~28% too thin (~0.105); Medium 500 (~0.157) overshoots by
        a smaller margin in the other direction and reads far closer. Owner's
        call — logged in REPLICATION-CHECKLIST.md so it isn't mistaken for
        drift the next time someone re-reads the rule.
      */}
      <div
        ref={track}
        className="flex w-max text-marquee font-medium tracking-[-0.035em] text-text-hi"
      >
        {Array.from({ length: copies }, (_, i) => (
          <span key={i} className="flex shrink-0 items-center">
            {content}
          </span>
        ))}
      </div>
    </div>
  );
}
