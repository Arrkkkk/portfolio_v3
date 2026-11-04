"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The My Expertise (ServicesScene) -> Design In Motion transition: the same
 * five-horizontal-band, bottom-first fill technique as ChapterWipe.tsx (the
 * Marquee -> Key Facts transition), reused here at the owner's explicit
 * request ("exact like the shift from...FOCUSED VISION...to key facts, the
 * 5 horizontal bands").
 *
 * Deliberately a SEPARATE file rather than a generalisation of ChapterWipe.
 * That component is heavily tuned to Key Facts' own three-stat-card entrance
 * (LOCK_PX, STRETCH, PACE_REF, per-card stagger maths), none of which applies
 * here — Design In Motion has no card grid, and the owner confirmed no extra
 * locked scroll is wanted. A separate file means this can be deleted outright
 * (plus one import + one JSX line in page.tsx) without touching anything
 * already tuned and shipped.
 *
 * ── Why no STRETCH/LOCK_PX here ─────────────────────────────────────────────
 * ChapterWipe adds extra scroll distance because Key Facts' three-card
 * rotation needs guaranteed on-screen time the natural scroll gap didn't
 * have. Design In Motion only has two headings blur-resolving — no multi-beat
 * choreography needs extra room — so the owner confirmed skipping the lock,
 * and this plays entirely inside scroll distance the page already has:
 * exactly one viewport height, from the moment ServicesScene's pinned run
 * ends to the moment Design In Motion's own top reaches the top of the
 * viewport. (ClientStories sits between them in the JSX but renders nothing
 * — testimonials.ts is empty on purpose — so the two sections are adjacent in
 * the actual DOM and that gap really is exactly one viewport height.)
 *
 * ── Why the hold is still needed despite that ───────────────────────────────
 * Even with no added scroll, ServicesScene's pinned stage would naturally
 * start scrolling away the instant its own 1395svh container ends. The owner
 * was explicit that the resting "My Expertise" frame (rock settled, cards
 * already cycled through and gone) should stay static while the bands form
 * over it, not visibly scroll out from underneath them. So the same scroll-
 * driven counter-translate ChapterWipe uses on DarkChapters is used here on
 * ServicesScene's own root — `a.previousElementSibling` in the rendered DOM,
 * same relationship ChapterWipe relies on.
 */

const BANDS = 5;
const BAND_FILL = 1;
const BAND_STEP = 0.3;
/** 1 + 4*0.3 = 2.2 — same band-only span as ChapterWipe (its TOTAL is longer
 *  only because of the card sequence tacked on after the bands finish). */
const TOTAL = BAND_FILL + (BANDS - 1) * BAND_STEP;
/**
 * Resolve the headings as band 3 (of 5, bottom-first) passes 90% — band 3
 * starts at 2*BAND_STEP = 0.6, so 0.6 + 0.9 = 1.5. Same cue, same proportion,
 * same reasoning as ChapterWipe's HEAD_CUE: the bands are most of the way up
 * the screen by the time anything in front of them resolves.
 */
const HEAD_CUE = 1.5;
/** Finishes exactly as the last band does, landing the headline fully
 *  resolved right at the end of the wipe window — the owner's target frame. */
const HEAD_RUN = TOTAL - HEAD_CUE;

/** Design In Motion's own flat bg-grey (--color-grey, globals.css) — solid,
 *  not a gradient like Key Facts' chapter, so (unlike ChapterWipe's bands)
 *  these never need realigning to the target section on scroll: one colour
 *  looks identical wherever the clip lands. */
const FILL_COLOR = "#bbbbbb";

export function ServicesWipe() {
  const anchor = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const a = anchor.current;
    const l = layer.current;
    if (!a || !l || reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    // Bottom band first: the cascade runs up the screen, same as ChapterWipe.
    const bands = Array.from(l.querySelectorAll<HTMLElement>(".sw-band")).reverse();
    const dim = document.querySelector<HTMLElement>(".dim-section");
    const headings = dim?.querySelectorAll<HTMLElement>(".dim-heading .blur-char");
    // ServicesScene's own root div — the thing being held static while the
    // bands paint over it. Same relationship as ChapterWipe's `dark`.
    const dark = a.previousElementSibling as HTMLElement | null;
    if (!dim || !dark || !headings || !headings.length) return;

    let st: ScrollTrigger | undefined;
    const ctx = gsap.context(() => {
      /*
       * Unlike ChapterWipe's start()/end(), this needs no offsetTop walk —
       * `dim` (Design In Motion's own <section>) is never itself transformed
       * by anything here (there's no "rise" tween on its content, unlike Key
       * Facts), so a plain rect read is not circular and can be re-read live
       * exactly like ChapterWipe's own non-circular kfDocTop() check.
       */
      const dimTop = () => dim.getBoundingClientRect().top + window.scrollY;
      const start = () => dimTop() - window.innerHeight;
      const end = dimTop;

      /*
       * Holds ServicesScene's root counter-translated against scroll, so the
       * resting "My Expertise" frame stays visually still while the bands
       * fill over it — exactly ChapterWipe's syncDark, scroll-driven rather
       * than timeline-driven for the same reason: a scrubbed playhead lags
       * scroll position on a fast flick, and a hold has to track scroll
       * exactly or it visibly slips.
       */
      const syncDark = () => {
        const s = window.scrollY;
        const held = gsap.utils.clamp(0, end() - start(), s - start());
        gsap.set(dark, { y: s >= end() ? 0 : held });
      };

      const syncOverlay = (active: boolean) => {
        syncDark();
        const parked = Math.abs((gsap.getProperty(dark, "y") as number) ?? 0) < 1;
        const covered = window.scrollY >= end();
        l.style.visibility = !parked || (active && !covered) ? "visible" : "hidden";
      };

      const tl = gsap.timeline({
        onUpdate: () => syncOverlay(tl.scrollTrigger?.isActive ?? false),
        scrollTrigger: {
          trigger: a,
          start,
          end,
          scrub: 0.4,
          invalidateOnRefresh: true,
          onToggle: (self) => syncOverlay(self.isActive),
          onUpdate: (self) => syncOverlay(self.isActive),
        },
      });
      st = tl.scrollTrigger;

      bands.forEach((band, i) => {
        tl.fromTo(
          band,
          // Same inset(100%...) -> inset(0%...) fill-from-the-bottom-sliver
          // technique as ChapterWipe.
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: BAND_FILL, ease: "none" },
          i * BAND_STEP,
        );
      });

      // Initial blurred state is set by DesignInMotion's own `manual` BlurText
      // instances — not duplicated here, same division of responsibility as
      // ChapterWipe/KeyFacts.
      tl.to(
        headings,
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: HEAD_RUN,
          ease: "none",
          stagger: { each: 0.012, from: "random" },
        },
        HEAD_CUE,
      );
    }, a);

    /*
     * Same race ServicesScene's own trigger already documents and fixes
     * (see its comment above the identical two-rAF refresh): this trigger
     * is created while ServicesScene's own pinned run — and whatever sits
     * above it (SelectedWork's horizontal pin, Key Facts' lock spacer) —
     * may not have finished registering its final pin-spacer height with
     * ScrollTrigger yet. Measured directly: without this, `start`/`end`
     * were captured ~3100px too low (18999/19950 instead of the correct
     * ~22104/23055), even though both are plain functions re-read on
     * `invalidateOnRefresh` — the problem is the FIRST measurement, before
     * any refresh has a reason to fire. `.refresh()` on this instance,
     * deferred two frames, corrects it the same way it does there.
     */
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => st?.refresh());
    });

    return () => {
      cancelAnimationFrame(raf1);
      ctx.revert();
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <>
      {/* Zero height — this marks the boundary, it does not occupy it. */}
      <div ref={anchor} aria-hidden className="h-0" />

      <div
        ref={layer}
        aria-hidden
        // z-20: same layering reasoning as ChapterWipe — above ServicesScene's
        // own content (z-8 and below), under the header (z-60).
        className="pointer-events-none fixed inset-0 z-20"
        style={{ visibility: "hidden" }}
      >
        {Array.from({ length: BANDS }, (_, i) => (
          <div
            key={i}
            className="sw-band absolute inset-x-0"
            style={{
              top: `${(i * 100) / BANDS}%`,
              // +1px overlap — same hairline-seam fix as ChapterWipe.
              height: `calc(${100 / BANDS}% + 1px)`,
              backgroundColor: FILL_COLOR,
            }}
          />
        ))}
      </div>
    </>
  );
}
