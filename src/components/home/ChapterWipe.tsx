"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The dark → Key facts transition: five horizontal bands filling with the light
 * chapter's colour, bottom band first, each starting as the one below it nears
 * completion. Scrubbed to scroll, so it runs and rewinds under the scrollbar.
 *
 * ── It adds no scroll distance ───────────────────────────────────────────────
 * The first version put a 150svh runway between the marquee and Key facts and
 * ran the wipe inside it. That was wrong twice over: it inserted a stretch of
 * scrolling where the marquee had already left and nothing had arrived, and it
 * made the wipe finish *before* Key facts began to move, so the two read as
 * separate events instead of one.
 *
 * This version owns no layout at all — a zero-height anchor and a `fixed`
 * overlay. It is scrubbed across Key facts' own entry (its top travelling from
 * the bottom of the viewport to the top), which is scroll distance the page
 * already had. So the marquee is still leaving and Key facts is still rising
 * underneath while the bands fill, and the last band lands exactly as Key facts
 * finishes covering the screen.
 *
 * Only the filled bands are painted, so wherever a band has not arrived yet you
 * see the real page behind it — the marquee, the mark, the sky — rather than a
 * flat sheet.
 *
 * ── Where this comes from, honestly ──────────────────────────────────────────
 * An INVENTION, not a reproduction. Frames 076–079 look banded because the
 * screen recording tore during fast scrolling; `FRAME-MAP.md` §07 and the
 * capture-artifact list in `CLAUDE.md` both flag those exact frames. Frame 077
 * settles it: the marquee glyphs are sliced horizontally with their lower halves
 * replaced by flat grey mid-stroke, and `MEASURED EXECUTION.` is cut through at
 * a different height. No animation halves a letter. The reference's actual
 * transition is A06, a hard edge scrolling up. The owner asked for the banded
 * look deliberately. Logged in REPLICATION-CHECKLIST.md — do not "restore" it.
 *
 * The five-band geometry is at least grounded: those tear lines sit at 190 /
 * 380 / 571 / 761 CSS px against a 951px viewport, and exact fifths are 190.2 /
 * 380.4 / 570.6 / 760.8 — all four within a pixel.
 */

const BANDS = 5;

export function ChapterWipe() {
  const anchor = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const a = anchor.current;
    const l = layer.current;
    if (!a || !l || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    // The bands are queried off the overlay, not selected inside a context
    // scoped to the anchor — the anchor is empty, so a ".cw-band" selector
    // there matches nothing and the tween silently does nothing at all.
    const bands = Array.from(l.querySelectorAll<HTMLElement>(".cw-band"));
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bands,
        // inset(100% …) clips the band away from its top edge down, leaving a
        // zero-height sliver at the bottom. Shrinking that inset grows the fill
        // upward from the bottom.
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          /*
           * `from: "end"` starts the cascade at the last element — the bottom
           * band. The ratio to `duration` sets how much dark is left showing
           * between two filling bands, and that gap is what makes this read as
           * bands at all: a band fills from its own bottom edge, so while the
           * band below is only f full, a strip of height (1-f)·190px is still
           * dark between the two. At 0.8 that strip is 38px and the whole thing
           * collapses into one hard edge. 0.55 leaves ~86px, which is close to
           * the gaps in the reference captures and still reads as "the one
           * below is nearly done before the next starts".
           */
          stagger: { each: 0.55, from: "end" },
          // Scroll-driven, so no easing — a curve would decouple the fill from
          // the scrollbar.
          ease: "none",
          scrollTrigger: {
            trigger: a,
            // The anchor sits exactly at the dark/light boundary, so this is
            // Key facts' own entry: top of the viewport to the bottom of it,
            // one screen of scrolling the page already had.
            start: "top bottom",
            end: "top top",
            scrub: 0.4,
            // Outside the window the overlay must not be on screen at all:
            // past the end every band is full, which would leave a sheet of
            // #dadada sitting over the rest of the page.
            onToggle: (self) => {
              l.style.visibility = self.isActive ? "visible" : "hidden";
            },
          },
        },
      );
    }, a);

    return () => ctx.revert();
  }, [reduced]);

  if (reduced) return null;

  return (
    <>
      {/* Zero height — this marks the boundary, it does not occupy it. */}
      <div ref={anchor} aria-hidden className="h-0" />

      <div
        ref={layer}
        aria-hidden
        // z-50 keeps it under the header (z-60), which stays legible
        // throughout and inverts on Key facts' own chapter registration.
        className="pointer-events-none fixed inset-0 z-50"
        style={{ visibility: "hidden" }}
      >
        {Array.from({ length: BANDS }, (_, i) => (
          <div
            key={i}
            className="cw-band absolute inset-x-0"
            style={{
              top: `${(i * 100) / BANDS}%`,
              // +1px so adjacent bands overlap. At percentage heights the
              // boundaries land on fractional pixels and leave hairline seams
              // between two already-filled bands; same flat colour, so the
              // overlap is invisible where the seam was not.
              height: `calc(${100 / BANDS}% + 1px)`,
              // The first stop of the Key facts gradient. The wipe completes
              // exactly as that section finishes covering the screen, so
              // matching its top colour is what makes the handoff invisible.
              background: "#dadada",
            }}
          />
        ))}
      </div>
    </>
  );
}
