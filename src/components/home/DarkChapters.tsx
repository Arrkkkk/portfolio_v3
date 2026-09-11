"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSceneEnabled } from "@/components/three/SceneGate";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const HeroMonogram = dynamic(
  () => import("@/components/three/HeroMonogram").then((m) => m.HeroMonogram),
  { ssr: false },
);

/**
 * The dark chapter run — Hero, About and Marquee — over one continuous canvas.
 *
 * PAGES §01: "the canvas persists; the About chapter's text scrolls up over
 * it", §02: "the hero canvas is still faintly visible behind", §03: "the 3D
 * cluster is still drifting behind". Frame 045 shows it plainly: the cluster,
 * the light streaks and the embers all read through the About statement.
 *
 * The canvas was previously clipped inside the Hero section, which left About
 * and Marquee as flat black. It now sits in a sticky layer spanning all three,
 * so it holds still while the chapters scroll over it — and unsticks exactly
 * where the wrapper ends, which is the Key Facts boundary A06 describes as
 * "the next chapter's background scrolls over the previous one".
 *
 * Paint order is wrapper background → canvas → chapter content.
 */

/** Opacity the band settles to once the hero has scrolled away. */
const HELD_OPACITY = 0.22;

export function DarkChapters({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const sceneOn = useSceneEnabled();
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = layer.current;
    const w = wrap.current;
    if (!el || !w || !sceneOn || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 1 },
        {
          opacity: HELD_OPACITY,
          ease: "none",
          scrollTrigger: {
            trigger: w,
            start: "top top",
            end: () => `+=${window.innerHeight * 0.9}`,
            scrub: true,
            /*
             * The layer spans all three chapters, so left interactive it would
             * keep taking pointer events through the gaps between About's
             * columns — hold-to-blast firing on a mark nobody can see. It stays
             * live only while the hero still owns the viewport.
             */
            onUpdate: (self) => {
              el.style.pointerEvents = self.progress < 0.6 ? "auto" : "none";
            },
          },
        },
      );
    }, w);

    return () => ctx.revert();
  }, [sceneOn, reduced]);

  return (
    <div ref={wrap} className="relative bg-dark">
      <div ref={layer} className="sticky top-0 z-0 h-svh w-full">
        {sceneOn ? <HeroMonogram /> : null}
      </div>

      {/*
        Pulled back over the sticky layer; the layer's own 100svh of flow would
        otherwise show up as a blank screen before the hero.

        pointer-events-none is load-bearing: this wrapper covers the canvas for
        the full height of all three chapters, so left interactive it swallows
        every event the scene needs and the parallax, hold-to-blast and
        constellation reveals all go dead — silently, since the mark keeps
        animating either way. The hero deliberately stays transparent to
        events; About and Marquee opt back in on their own sections.
      */}
      <div className="pointer-events-none relative z-10 -mt-[100svh]">
        {children}
      </div>
    </div>
  );
}
