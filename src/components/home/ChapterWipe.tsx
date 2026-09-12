"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChapterMarker } from "@/components/chrome/ChapterTheme";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The dark → Key facts chapter transition: five horizontal bands that fill with
 * the light chapter's colour, bottom band first, each starting as the one below
 * it nears completion. Scrubbed to scroll, so it runs and rewinds under the
 * scrollbar.
 *
 * ── Where this comes from, honestly ──────────────────────────────────────────
 * This is an INVENTION, not a reproduction. Frames 076–079 look banded because
 * the screen recording tore during fast scrolling — `FRAME-MAP.md` §07 and the
 * capture-artifact list in `CLAUDE.md` both flag those exact frames. Frame 077
 * settles it: the marquee glyphs are sliced horizontally, their lower halves
 * replaced by flat grey mid-stroke, and `MEASURED EXECUTION.` is cut through at
 * a different height. No animation halves a letter and substitutes the next
 * section's background for the bottom. The reference's actual transition is
 * A06 — a hard edge scrolling up.
 *
 * The owner asked for the banded look as a deliberate effect anyway. Logged in
 * REPLICATION-CHECKLIST.md as a departure. Do not "restore" it to A06.
 *
 * One thing the frames did give us: the tear lines sit at fixed screen
 * positions, and converted to CSS px they are 190 / 380 / 571 / 761 against a
 * 951px viewport. Exact fifths are 190.2 / 380.4 / 570.6 / 760.8 — all four
 * within a pixel. So five equal bands is the observed geometry, even if the
 * cause was an artifact.
 */

const BANDS = 5;

/**
 * Scroll runway. It is taller than the sticky layer by exactly the distance the
 * wipe is scrubbed over — 150svh of runway against a 100svh layer gives 50svh
 * of travel, which keeps the whole transition inside half a screen of scrolling
 * rather than stretching a set-piece across a page and a half.
 */
const RUNWAY = "150svh";

export function ChapterWipe() {
  const runway = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = runway.current;
    if (!el || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cw-band",
        // inset(100% …) clips the whole band away from the top edge down, so
        // what is left is a zero-height sliver at the band's bottom. Shrinking
        // that inset grows the fill upward from the bottom.
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          // `from: "end"` starts the cascade at the last element — the bottom
          // band. 0.8 against a duration of 1 means each band begins as the one
          // below it is 80% full, which is the overlap described: nearly
          // finished, not finished.
          stagger: { each: 0.8, from: "end" },
          // Scroll-driven, so no easing: any curve would decouple the fill from
          // the scrollbar.
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  // No runway at all under reduced motion — the chapters simply meet, which is
  // the A06 behaviour anyway.
  if (reduced) return null;

  return (
    <div
      ref={runway}
      className="pointer-events-none relative"
      style={{ height: RUNWAY }}
    >
      {/*
        Flips the header to its light treatment once the bands have actually
        covered the top of the screen, rather than at some point that merely
        looks about right. The probe line is y=46; the top band spans 0..190 and
        covers y=46 once it is 75.8% full, which on this stagger is progress
        0.942 — i.e. scroll runwayTop + 448px, so the marker has to begin
        448+46 = 494px down a 1427px runway. Hence 35%. At 30% the chrome
        inverted while the top of the screen was still dark.
      */}
      <ChapterMarker
        theme="light"
        className="absolute bottom-0 left-0 top-[35%] w-px"
      />

      <div className="sticky top-0 h-svh overflow-hidden">
        {Array.from({ length: BANDS }, (_, i) => (
          <div
            key={i}
            className="cw-band absolute inset-x-0"
            style={{
              top: `${(i * 100) / BANDS}%`,
              // +1px so adjacent bands overlap. At percentage heights the
              // boundaries land on fractional pixels and leave hairline seams
              // between two already-filled bands; they are the same flat
              // colour, so the overlap is invisible and the seam is not.
              height: `calc(${100 / BANDS}% + 1px)`,
              /*
               * Flat, and specifically the first stop of the Key facts
               * gradient. The wipe ends where that section begins, so matching
               * its top colour is what keeps the handoff seamless — a gradient
               * of its own would meet #dadada with a visible seam.
               */
              background: "#dadada",
            }}
          />
        ))}
      </div>
    </div>
  );
}
