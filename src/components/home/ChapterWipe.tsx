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

/**
 * One band takes 1 unit to fill; the next starts when it is 30% full, so
 * consecutive bands sit a constant 30 points apart:
 *
 *   band 1 (bottom) 0.0 → 1.0      t=0.3  b1 30%, b2 starts
 *   band 2          0.3 → 1.3      t=0.6  b1 60%, b2 30%, b3 starts
 *   band 3          0.6 → 1.6      t=0.9  b1 90%, b2 60%, b3 30%, b4 starts
 *   band 4          0.9 → 1.9      t=1.2  b1 100%, b2 90%, b3 60%, b4 30%, b5 starts
 *   band 5 (top)    1.2 → 2.2
 */
const BAND_FILL = 1;
const BAND_STEP = 0.3;
/** (e) the headings rise as band 3 passes 90% — it starts at 0.6, so 1.5. */
const HEAD_CUE = 1.5;
const HEAD_RUN = 0.9;
/** (f) the cards begin as band 4 completes. It starts at 0.9, so 1.9. */
const CARD_CUE = 1.9;
/** Cards finish over their own scroll after the cue, per the owner's choice. */
const CARD_RUN = 1.5;
const CARD_STAGGER = 0.198; // same stagger:duration ratio as the tuned 0.145/1.1
const TOTAL = CARD_CUE + CARD_RUN + CARD_STAGGER * 2;

export function ChapterWipe() {
  const anchor = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const a = anchor.current;
    const l = layer.current;
    if (!a || !l || reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    // Bottom band first: the cascade runs up the screen.
    const bands = Array.from(l.querySelectorAll<HTMLElement>(".cw-band")).reverse();
    const headings = document.querySelector<HTMLElement>(".kf-headings");
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".kf-card"));
    // The whole dark run, not just its last section. The mark lives in the
    // sticky canvas layer inside this wrapper, and that layer reaches the end
    // of its container partway through the fill and starts unsticking — so
    // holding the marquee section alone left the symbol sliding out from under
    // frozen words. Key facts moves over the dark chapter; the dark chapter
    // does not move at all.
    const dark = a.previousElementSibling as HTMLElement | null;
    if (!headings || !cards.length || !dark) return;

    const ctx = gsap.context(() => {
      /*
       * The window runs from the marquee sitting centred to the point where the
       * cards have had their own scroll to finish in — measured, not guessed,
       * and recomputed on refresh so a resize does not strand the cues.
       *
       * It adds no scroll distance: this is all scrolling the page already had.
       */
      const start = () => {
        const kf = headings.closest("section") as HTMLElement;
        return kf.getBoundingClientRect().top + window.scrollY - window.innerHeight;
      };
      const end = () => {
        const g = cards[0].parentElement as HTMLElement;
        // Stop while the cards are still comfortably on screen: finishing the
        // rotation above the fold is the bug that made the old rewind invisible.
        return g.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.15;
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: a,
          // Raw scroll positions. Expressed as a "top Xpx" string this was
          // being resolved against the trigger's own offset and landed the
          // whole sequence near the end of the window; a function returning a
          // number is taken as the scroll value itself, which is what we want.
          start,
          end,
          scrub: 0.4,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            l.style.visibility = self.isActive ? "visible" : "hidden";
          },
        },
      });

      /*
       * Hold the marquee still while the bands fill over it.
       *
       * It is counter-translated by exactly the scroll travelled, so it reads
       * as pinned without actually being pinned. ScrollTrigger's `pin` was the
       * obvious tool and the wrong one here: with pinSpacing it inserts a
       * spacer and pushes Key facts down, which is the added scroll distance
       * that was wrong the first time round; without pinSpacing it drops the
       * element out of flow and everything below jumps up by its height. A
       * transform changes no layout at all and unwinds on the way back up.
       *
       * It only has to hold while the fill is visible. Once the last band lands
       * the overlay covers the viewport, so whatever the marquee does
       * underneath after that cannot be seen.
       */
      const fillEnd = BAND_STEP * (BANDS - 1) + BAND_FILL; // 2.2
      tl.to(
        dark,
        {
          y: () => ((end() - start()) * fillEnd) / TOTAL,
          duration: fillEnd,
          ease: "none",
        },
        0,
      );

      /*
       * ...and put it back. The hold has to be undone or the dark chapter stays
       * displaced by the full fill distance for the rest of the page: the
       * overlay hides when the trigger deactivates and exposes it, which is
       * exactly what happened — Key facts drawn over a marquee sitting 667px
       * out of position.
       *
       * It unwinds between the last band landing and the point where Key facts
       * covers the viewport on its own, so the snap back happens underneath a
       * fully opaque overlay and cannot be seen.
       */
      tl.to(dark, { y: 0, duration: 0.4, ease: "none" }, fillEnd);

      bands.forEach((band, i) => {
        tl.fromTo(
          band,
          // inset(100% …) leaves a zero-height sliver at the band's bottom;
          // shrinking the inset grows the fill upward from there.
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: BAND_FILL, ease: "none" },
          i * BAND_STEP,
        );
      });

      /*
       * (e) The headings rise from below the fold. Their natural position at the
       * cue is measured off the live layout rather than assumed, so the travel
       * is exactly "from the bottom edge of the screen" whatever the viewport is.
       */
      // Measured once, here, before anything is transformed. Reading the rect
      // lazily inside the tween is circular — it includes the y this very tween
      // is applying, so the travel solves to zero and the headings never move.
      const headDocTop = headings.getBoundingClientRect().top + window.scrollY;
      const scrollAtCue = start() + ((end() - start()) * HEAD_CUE) / TOTAL;
      const headTravel = Math.max(0, window.innerHeight - (headDocTop - scrollAtCue));
      tl.fromTo(
        headings,
        { y: headTravel },
        { y: 0, duration: HEAD_RUN, ease: "none" },
        HEAD_CUE,
      );

      /*
       * The blur resolve is one beat of this sequence, not a reaction to the
       * heading scrolling into view. Left to its own `top 75%` trigger it fired
       * on the transformed element's position — long after the cue — so the
       * heading rose on time and arrived invisible, which is why the wipe kept
       * looking right with nothing ever appearing in it.
       */
      tl.to(
        headings.querySelectorAll(".blur-char"),
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: HEAD_RUN * 0.6,
          ease: "none",
          stagger: { each: 0.012, from: "random" },
        },
        HEAD_CUE,
      );

      /*
       * (f) The cards, unchanged in geometry — only the cue moved.
       *
       * set + to, not fromTo. Inside a scrubbed timeline a staggered fromTo
       * only holds the from-state for its first target; the others sat upright
       * until their own slot opened and then snapped into the rotation, so two
       * of the three visibly popped. `immediateRender` does not survive the
       * scrub re-render. Setting the start state outright means they are folded
       * from the moment the page lays out, and the `to` simply unfolds them.
       */
      gsap.set(cards, { transformOrigin: "50% 0%", rotateX: -70, opacity: 0 });
      tl.to(
        cards,
        {
          rotateX: 0,
          opacity: 1,
          duration: CARD_RUN,
          ease: "none",
          stagger: CARD_STAGGER,
        },
        CARD_CUE,
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
        /*
         * z-20 sits above the dark chapter (z-10) so the bands paint over it,
         * and below the Key facts headings and cards (z-30) so those show
         * through once their cues fire. At z-50 this sheet covered Key facts
         * outright: the headings rose exactly on time and were invisible
         * underneath it, which is why the wipe looked right and nothing ever
         * arrived. Still under the header at z-60.
         */
        className="pointer-events-none fixed inset-0 z-20"
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
