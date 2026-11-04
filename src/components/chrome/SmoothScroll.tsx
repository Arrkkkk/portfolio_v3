"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Inertial scrolling (BLUEPRINT §12). The reference's scroll decays smoothly
 * after a burst rather than stopping dead, and every pinned scene is scrubbed —
 * so Lenis must drive ScrollTrigger rather than run alongside it.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      /*
       * Default is 1 — a single fast trackpad flick converted 1:1 into
       * scroll distance, which could blow through an entire long pinned
       * scene (e.g. the ~1275svh services section) in one gesture.
       * 0.55 is a global slowdown (every section, not just that one),
       * tried first since it addresses the actual cause — the amount of
       * scroll one gesture produces — rather than any one section's own
       * length.
       */
      wheelMultiplier: 0.55,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
