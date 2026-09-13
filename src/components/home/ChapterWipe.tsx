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
 * The Key facts chapter's own background. The bands paint this, aligned to that
 * section, rather than a flat colour: the overlay is what you see while the
 * wipe runs and the section itself is what you see once it hides, so anything
 * other than the same gradient in the same place shows up as a colour jump at
 * the hand-off. Keep in step with the class on that section.
 */
/**
 * Stretches the scroll the sequence is spread across, without altering the
 * sequence itself — every cue keeps its position in the timeline, so the same
 * amount of transition simply takes this much more scrolling to get through.
 * The window's start is cued to the marquee sitting centred, so the extra goes
 * on the end.
 */
const STRETCH = 1.4;

const CHAPTER_BG = "linear-gradient(180deg,#dadada 0%,#fdfdfd 60%,#ffffff 100%)";

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

/**
 * The lock: Key facts rises to its cue, holds still while all three cards
 * rotate, then resumes scrolling.
 *
 * Without it the heading cannot survive its own sequence. The run is 424px of
 * scroll per timeline unit and the card rotation alone spans 1.896 units —
 * 805px — but the heading has only 553px of screen left when the cards start.
 * Measured: it is gone by the time the *first* card finishes, and 540px above
 * the fold by the time the third does. No tuning fixes that; the numbers do
 * not fit.
 *
 * Holding content still while someone scrolls is the same thing as consuming
 * scroll, so the section carries `LOCK_PX` of extra height (a spacer rendered
 * by KeyFacts) that the hold spends. That is what makes the release exact
 * rather than a jump: the transform that pins the block is exactly cancelled
 * by the height it consumed, so at the end of the lock the block is already
 * where the layout would have put it.
 */
export const LOCK_PX = 820;
/**
 * Viewport y the content block holds at; the heading sits 120px below it, so
 * it locks around 280. Higher than this and the lock engages too late — it is
 * also what sets *when* the hold starts, since the hold begins when the block
 * reaches this line. Lower and the card row runs off the bottom: heading 280 +
 * 131 tall + 92 gap puts the grid at 503, and its 407px height ends at 910,
 * just inside a 951 viewport.
 */
const LOCK_Y = 160;

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
      /*
       * Document position from the layout box, never from getBoundingClientRect.
       * offsetTop/offsetParent are layout values and ignore transforms; a rect
       * read does not. The card grid now sits inside the element this timeline
       * translates, so a rect read of it is circular — it includes the offset
       * the timeline is applying, which inflated the window and dragged every
       * cue off its measured position.
       */
      const docTop = (el: HTMLElement) => {
        let y = 0;
        let n: HTMLElement | null = el;
        while (n) {
          y += n.offsetTop;
          n = n.offsetParent as HTMLElement | null;
        }
        return y;
      };

      const end = () => {
        const g = cards[0].parentElement as HTMLElement;
        // Where the cards have had their own scroll to finish in, with the grid
        // still on screen: finishing the rotation above the fold is the bug
        // that made the old rewind invisible.
        // Minus LOCK_PX: the spacer that funds the lock sits above this grid,
        // so its layout position is that much lower. Counting it would inflate
        // the window and stretch every cue apart from the pacing that was set.
        const natural = docTop(g) - LOCK_PX - window.innerHeight * 0.15;
        return start() + (natural - start()) * STRETCH;
      };

      /*
       * The document-absolute top of Key facts, read once rather than every
       * frame. The section itself is never transformed — only its children
       * are — so this is a constant for the life of the page and doesn't need
       * re-reading. Comparing window.scrollY against it is what decides when
       * the overlay is redundant; doing that instead of re-reading the
       * section's rect inside onUpdate removes a live layout read from the
       * hot path, which is one less place a stale value could leave the
       * overlay stuck showing over the next section.
       */
      const kfDocTop = () =>
        (headings.closest("section") as HTMLElement).getBoundingClientRect().top +
        window.scrollY;

      /*
       * The single authority on whether the overlay is on screen.
       *
       * The overlay exists to cover the dark chapter while Key facts arrives,
       * so the only safe rule is: it may let go once the thing it is covering
       * is actually back in place. Not when a *proxy* for that says so.
       *
       * Scroll position alone was that proxy, and it is a different clock from
       * the one the release runs on. The hold is released inside a scrubbed
       * timeline, and `scrub` eases the playhead toward the scroll position
       * rather than snapping to it — so on a fast flick scrollY leaps past the
       * threshold while the playhead is still hundreds of milliseconds behind.
       * Measured mid-flick: scrollY 2863 (120px past the threshold), overlay
       * already hidden, dark chapter still translated 766px and covering 646px
       * of a 951px viewport. That is the split-second flash of the marquee.
       *
       * Widening the gap between the two cannot fix it: in timeline terms they
       * sit ~5px of scroll apart, but scrub lag is measured in time, not
       * pixels, and under a flick it is worth far more than any margin. So the
       * condition reads the dark chapter's *actual* transform instead, which is
       * authoritative whatever the playhead is doing and immune to the scrub
       * value.
       */
      /*
       * Hold the marquee still while the bands fill over it — as a function of
       * scroll, deliberately NOT as a beat in the scrubbed timeline.
       *
       * It is counter-translated by exactly the scroll travelled, so it reads
       * as pinned without being pinned. ScrollTrigger's `pin` was the obvious
       * tool and the wrong one: with pinSpacing it inserts a spacer and pushes
       * Key facts down, which is the added scroll distance that was wrong the
       * first time round; without pinSpacing it drops the element out of flow
       * and everything below jumps up by its height. A transform changes no
       * layout at all.
       *
       * Why it cannot live on the timeline: `scrub` eases the playhead toward
       * the scroll position, so a held-then-released tween lags. On a fast
       * flick that left the chapter displaced hundreds of pixels at a scroll
       * where Key facts already owned the screen — measured at 763px with the
       * top bands only 60% filled, so 95px of marquee showed through the gap
       * the unfilled bands left. Keeping the overlay visible could not fix
       * that, because visible is not the same as opaque. Driven from scroll
       * there is no playhead and no lag: the displacement is the scroll
       * travelled, exactly, on every frame.
       *
       * Released the moment Key facts covers the viewport, which is the moment
       * the dark chapter stops being able to matter — not at a timeline beat
       * that can drift away from it.
       */
      /*
       * Assigned further down, once the rise geometry has been measured, but
       * declared here so the same scroll-driven sync that holds the marquee
       * also positions the Key facts block. One driver, one clock.
       */
      let syncContent: () => void = () => {};

      const syncDark = () => {
        const held = Math.max(0, Math.min(window.scrollY, kfDocTop()) - start());
        gsap.set(dark, { y: window.scrollY >= kfDocTop() ? 0 : held });
      };

      const syncOverlay = (active: boolean) => {
        syncDark();
        syncContent();
        const parked = Math.abs((gsap.getProperty(dark, "y") as number) ?? 0) < 1;
        const covered = window.scrollY >= kfDocTop();
        /*
         * A displaced dark chapter must be covered whatever else is true —
         * `active` is not a gate on that. Flicking clean past the end of the
         * window deactivates the trigger while the scrub is still catching up,
         * and gating on `active` hid the overlay with the marquee still 897px
         * out of place: the same flash, reached by the other door.
         */
        l.style.visibility =
          !parked || (active && !covered) ? "visible" : "hidden";
      };

      const tl = gsap.timeline({
        /*
         * Visibility is decided here, on the timeline's own render, not on the
         * ScrollTrigger's onUpdate. ScrollTrigger only updates on scroll
         * events; the timeline also renders while the scrub is *catching up*
         * after the scrolling stops, and those catch-up frames are exactly
         * where the flash lives. This also covers leaving the range fast,
         * which used to hide the overlay unconditionally via onToggle.
         */
        onUpdate: () => syncOverlay(tl.scrollTrigger?.isActive ?? false),
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
          onToggle: (self) => syncOverlay(self.isActive),
          /*
           * Slide each band's copy of the chapter gradient to wherever that
           * section actually is. The overlay is fixed and the section scrolls,
           * so a background left static drifts out of step and the hand-off
           * when the overlay hides shows up as a colour jump.
           */
          onUpdate: (self) => {
            const kf = headings.closest("section") as HTMLElement;
            const top = kf.getBoundingClientRect().top;
            const h = kf.offsetHeight;
            bands.forEach((band) => {
              band.style.backgroundSize = `100% ${h}px`;
              band.style.backgroundPosition = `0 ${top - band.offsetTop}px`;
            });
            syncOverlay(self.isActive);
          },
        },
      });

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
       *
       * The transform goes on the whole content block, not on the headings
       * alone. Moving only the headings pushed them ~390px below their layout
       * position while the cards stayed at theirs, so for most of the entrance
       * the cards sat *above* the heading — measured at t=1.9, when the tilt
       * begins, the grid's top was 196px above the heading's bottom. The
       * section's own spacing is already right (92px heading to grid, 116px
       * grid to tools); translating the container keeps that true at every
       * instant instead of only at rest.
       *
       * Deliberately not a second matching tween on the cards: that re-derives
       * a relationship the layout already expresses, and two tweens can drift
       * out of step — the same shape of bug as the scrub flash.
       */
      // Same reason as `end()`: the headings sit inside the element this tween
      // translates, so a rect read would include the y it is applying and the
      // travel would solve to zero.
      // Minus LOCK_PX for the same reason as `end()`: the spacer sits above
      // this block, so its layout position includes height the lock will spend.
      const headDocTop = docTop(headings) - LOCK_PX;
      const scrollAtCue = start() + ((end() - start()) * HEAD_CUE) / TOTAL;
      const headTravel = Math.max(0, window.innerHeight - (headDocTop - scrollAtCue));
      const riseEndScroll =
        start() + ((end() - start()) * (HEAD_CUE + HEAD_RUN)) / TOTAL;
      const content = headings.parentElement as HTMLElement;

      /*
       * Rise and lock are one transform, driven from scroll rather than from
       * the timeline — the same reasoning as the marquee hold. A lock has to
       * cancel scroll exactly, and a scrubbed playhead lags it by design, so a
       * held-then-released tween drifts out of step with the position that
       * decides where it should be.
       *
       *   before the cue   y = rise − LOCK_PX   (the −LOCK_PX cancels the
       *                                          spacer, so the block sits
       *                                          where it would without it)
       *   through the lock the offset climbs to 0 at exactly the rate scroll
       *                    advances, so the block stands still
       *   after            y = 0, and the block is already where the layout
       *                    puts it — the release is exact, not a jump
       */
      syncContent = () => {
        const s = window.scrollY;
        const rise =
          headTravel *
          (1 - gsap.utils.clamp(0, 1, (s - scrollAtCue) / (riseEndScroll - scrollAtCue)));
        const lockStart = kfDocTop() - LOCK_Y;
        const spent = gsap.utils.clamp(0, LOCK_PX, s - lockStart);
        gsap.set(content, { y: rise - LOCK_PX + spent });
      };
      syncContent();

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

      /*
       * The tools row, cued to the third card's own rotation rather than to
       * where it sits in the document. It used to just be plain content below
       * the grid, so it only appeared once scrolled into view naturally — a
       * pop, disconnected from everything the sequence above it was doing.
       *
       * "Third card" is the rightmost one: cards stagger left→right, so index
       * 2 is the one whose own tween starts last. On this linear (ease: none)
       * tween, half its own duration is exactly half its rotation — card 3's
       * tween runs from CARD_CUE + 2·CARD_STAGGER to +CARD_RUN, so halfway is
       * that start plus CARD_RUN / 2.
       */
      const card3Start = CARD_CUE + 2 * CARD_STAGGER;
      const card3Half = card3Start + CARD_RUN / 2;

      const toolsWrap = document.querySelector<HTMLElement>(".kf-tools");
      const toolsList = document.querySelector<HTMLElement>(".kf-tools-list");
      if (toolsWrap && toolsList) {
        gsap.set(toolsList, { opacity: 0, filter: "blur(8px)" });
        tl.to(
          toolsWrap.querySelectorAll(".blur-char"),
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 0.4,
            ease: "none",
            stagger: { each: 0.012, from: "random" },
          },
          card3Half,
        );
        tl.to(
          toolsList,
          { opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "none" },
          card3Half,
        );
      }
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
              /*
               * The section's own gradient, realigned to it every frame above,
               * over its first stop. The flat colour alone was visibly lighter
               * than the section once the overlay hid. The solid sits behind so
               * the area above the section's top -- where the gradient does not
               * reach -- still reads as the chapter's arriving colour.
               */
              backgroundColor: "#dadada",
              backgroundImage: CHAPTER_BG,
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
      </div>
    </>
  );
}
