"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChapterMarker } from "@/components/chrome/ChapterTheme";
import { MonoLink } from "@/components/primitives/MonoLink";
import { StarCaption } from "@/components/primitives/Rule";
import { ServiceIcon } from "@/components/expertise/ServiceIcon";
import { useSceneEnabled } from "@/components/three/SceneGate";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { seeded, SERVICES_P1_P4_SCALE, SERVICES_SVH_P1_P4, SERVICES_SVH_TOTAL } from "@/lib/utils";
import { services, servicesScene } from "@/data/services";

const MonolithScene = dynamic(
  () => import("@/components/three/MonolithScene").then((m) => m.MonolithScene),
  { ssr: false },
);

/**
 * PAGES §07 / A10 — the pinned services set-piece, the site's centrepiece.
 *
 * Six phases scrubbed across ~400vh of scroll (frames 121–178):
 *   P1 the type stack settles on white
 *   P2 background crossfades to #0E0E0E, smoke and monolith enter
 *   P3 glyphs detach and tumble out of frame
 *   P4 the monolith settles square-on
 *   P5 six service labels cross-fade in diagonal pairs
 *   P6 the scene unpins
 */
export function ServicesScene() {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [captionB, setCaptionB] = useState(false);
  const reduced = useReducedMotion();
  const sceneOn = useSceneEnabled();

  const pairs = [services.slice(0, 2), services.slice(2, 4), services.slice(4, 6)];

  useEffect(() => {
    const sec = section.current;
    if (!sec || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    let st: ScrollTrigger | undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          /*
           * The scatter below reads window.innerWidth/innerHeight in its
           * function-based x/y — those only get re-evaluated when GSAP
           * invalidates the tween. Without this, a real later window
           * resize would leave the throw amounts sized to whatever the
           * window was at mount, not the new size.
           */
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            progress.current = p;
            setCaptionB(p > 0.42 * SERVICES_P1_P4_SCALE);
          },
        },
      });

      // A spacer pins the timeline's total duration to exactly 1, so every
      // position below reads directly as a fraction of the pinned scroll.
      tl.to({}, { duration: 1 }, 0);

      // P1 — the stack settles and grows slightly.
      tl.fromTo(
        ".svc-stack",
        { scale: 0.94, y: 60 },
        { scale: 1.12, y: 0, duration: 0.3 * SERVICES_P1_P4_SCALE },
        0,
      );

      // P2 — luminance flip.
      tl.to(
        ".svc-stage",
        { backgroundColor: "#0e0e0e", duration: 0.14 * SERVICES_P1_P4_SCALE },
        0.1 * SERVICES_P1_P4_SCALE,
      )
        .to(".svc-stack", { color: "#f2f2f2", duration: 0.12 * SERVICES_P1_P4_SCALE }, 0.12 * SERVICES_P1_P4_SCALE)
        .to(".svc-canvas", { opacity: 1, duration: 0.14 * SERVICES_P1_P4_SCALE }, 0.1 * SERVICES_P1_P4_SCALE)
        .to(".svc-chrome", { color: "#f2f2f2", duration: 0.12 * SERVICES_P1_P4_SCALE }, 0.12 * SERVICES_P1_P4_SCALE);

      /*
       * P3 — glyphs detach as independent bodies and fall out of frame.
       *
       * The throw used to be flat pixels (±700/±450), tuned by eye against
       * the 1710px reference capture. That made it vanish at the reference
       * width itself: ±700px is only ~41% of 1710px, faded out over a
       * 0.14-of-scroll window with an ease that front-loads slow movement
       * — barely a drift. The same ±700px is 1.5–2x an actual phone's width,
       * which is why it only ever read as a real "explosion" there. Scaling
       * by the live viewport (90% of width, 70% of height) means letters
       * always clear the screen before fading, at any width — the effect
       * that was only ever visible by accident on a narrow window becomes
       * the effect everywhere.
       */
      tl.to(
        ".svc-char",
        {
          x: (i: number) => (seeded(i + 1) - 0.5) * window.innerWidth * 0.9,
          y: (i: number) => (seeded(i + 41) - 0.5) * window.innerHeight * 0.7,
          rotate: (i: number) => (seeded(i + 91) - 0.5) * 540,
          opacity: 0,
          ease: "power2.in",
          duration: 0.14 * SERVICES_P1_P4_SCALE,
          // `each` also needs the P1-P4 rescale: left alone, the ~29
          // characters' staggered offsets (each a fraction of the WHOLE
          // timeline, same as `duration`/position) would spread across
          // more absolute scroll than before, since the whole timeline
          // got longer — exactly the kind of drift P1-P4 is supposed to
          // be immune to.
          stagger: { each: 0.001 * SERVICES_P1_P4_SCALE, from: "random" },
        },
        0.3 * SERVICES_P1_P4_SCALE,
      );

      /*
       * P5 — each card travels ONE continuous path, corner to corner: in
       * from off-screen bottom-left (or top-right), past the monolith's
       * side, out off-screen top (or bottom). Not three separate tweens
       * (enter, static hold, exit) — that was tried and it's wrong. Re-
       * examined directly against Trion Frames/frame_0156–0172 (2fps, so
       * each pair's read as it actually happens, not a single still) and
       * a hand-drawn path overlay the owner supplied: the card never
       * stops. The "hugging the rock" look is x settling onto the rock's
       * edge quickly while y keeps moving at a steady rate the whole
       * time — a dogleg, not a stop-and-go. Two tweens per card, same
       * start position and duration, different eases:
       *
       *   x: power4.out, off-screen -> 0 — nearly all of its motion
       *      happens in the first ~30% of the duration, then barely
       *      moves, which is what reads as "locked onto the rock's edge"
       *      even though it's still technically, continuously easing.
       *   y: linear ("none"), off-screen-start -> off-screen-exit in one
       *      sweep, passing through y:0 (the measured rest position,
       *      same left-180/bottom-310 etc. anchors as before) at the
       *      exact midpoint of the tween — ties y directly to scroll
       *      distance, so scrolling reads as what's pushing the card,
       *      not an animation playing out on its own.
       *
       * This used to be three separate tweens spanning ~13svh total
       * (0.033 of the old 400svh section) — both too short to feel
       * scroll-driven AND structurally wrong (a real stop in the
       * middle). Now one continuous path per card, 500svh long.
       *
       * Overlap: "the next pair becomes visible once the current one has
       * covered about half of its hugging track" (owner's words, and
       * Trion Frames/frame_0160→0168 show the same thing: one pair fully
       * on screen while the next is already partway through its own
       * approach). Since x is ~settled and y is at its own rest point by
       * the midpoint of a card's duration, starting the next pair at
       * HALF of the current pair's duration lands it right there — that's
       * the OVERLAP_FACTOR = 0.5 baseline. Bumped to 0.575 on request
       * (+15%: "a bit more gap between consecutive [pairs of] cards" —
       * less overlap, not a spatial gap) so the next pair starts a little
       * later relative to the current one's journey, same structural
       * link to SVH_DURATION either way.
       */
      const SVH_DURATION = 500;
      const OVERLAP_FACTOR = 0.575; // 0.5 baseline + 15%
      const SVH_STAGGER = SVH_DURATION * OVERLAP_FACTOR;
      // SERVICES_SVH_P1_P4 + 2 staggers + one full duration = SERVICES_SVH_TOTAL
      // (200 + 575 + 500 = 1275) — both constants live in lib/utils.ts
      // alongside the scale MonolithScene also depends on; if SVH_DURATION
      // or OVERLAP_FACTOR change, SERVICES_SVH_TOTAL there must too, and
      // so must the literal h-[1275svh] in the JSX below (Tailwind needs
      // that class spelled out, not built from a variable).
      const pairStart = (i: number) => (SERVICES_SVH_P1_P4 + i * SVH_STAGGER) / SERVICES_SVH_TOTAL;
      const duration = SVH_DURATION / SERVICES_SVH_TOTAL;
      // Fade in/out only — never the thing that makes a card feel like
      // it's "arrived"; position alone does that. Short relative to the
      // full duration so a card is at full opacity well before its x
      // has settled.
      const fadeDur = duration * 0.1;

      /*
       * The card's rest x used to be a flat 0 against a left-180px/
       * right-180px CSS anchor — correct-looking only at the exact
       * 1710px reference width. The monolith's on-screen size is set by
       * the camera's vertical FOV, so its rendered width tracks viewport
       * HEIGHT only, not width (confirmed by screenshotting it settled
       * at 1710x951 / 1920x1000 / 2200x1000: rock width was 587 / 615 /
       * 618px — a near-constant 0.616x the viewport height, independent
       * of width). A fixed-px card offset doesn't track that, so on any
       * browser wider than 1710 at a similar height, the rock reads
       * relatively narrower and a gap opens up where there used to be
       * none — which is exactly the bug reported, on a real window.
       *
       * Fix: compute the rest offset from viewport height, the same way
       * the rock itself scales, rather than touching the CSS anchor at
       * all. The CSS base for each card becomes `right-1/2`/`left-1/2`
       * (desktop only — its own right/left edge starts exactly at the
       * horizontal centre, matching the monolith's own centring), and
       * this is the GSAP x this settles to: half the rock's width,
       * minus how far onto it the card should reach. Both coefficients
       * were measured the same way: half-rock = 0.308 * vh (half of the
       * measured 0.616), overlap = 0.08 * vh (measured off the owner's
       * reference capture: the card's edge crosses about 8% of a
       * viewport-height's worth onto the rock at full overlap).
       *
       * Below the `sm` breakpoint the cards still dock to the screen
       * edge (`left-0`/`right-0` in the JSX, unrelated to the monolith's
       * position) — this formula must not touch that layout, so it
       * returns 0 there.
       */
      const restX = (sign: 1 | -1) => () =>
        window.innerWidth < 640 ? 0 : sign * (0.308 - 0.08) * window.innerHeight;

      // Always 3 — six services in diagonal pairs, same assumption the
      // window math above already makes. Looping a fixed count rather
      // than `pairs.forEach` keeps `pairs` (a fresh array every render)
      // out of this effect's dependencies.
      for (let i = 0; i < 3; i++) {
        const windowStart = pairStart(i);

        // First label: bottom-left corner -> past the rock's left side -> straight up and off.
        tl.fromTo(
          `.svc-pair-${i}-a`,
          { x: () => -window.innerWidth * 0.45 },
          { x: restX(-1), ease: "power4.out", duration },
          windowStart,
        )
          .fromTo(
            `.svc-pair-${i}-a`,
            { y: () => window.innerHeight * 0.45 },
            { y: () => -window.innerHeight * 0.45, ease: "none", duration },
            windowStart,
          )
          .fromTo(`.svc-pair-${i}-a`, { autoAlpha: 0 }, { autoAlpha: 1, duration: fadeDur }, windowStart)
          .to(`.svc-pair-${i}-a`, { autoAlpha: 0, duration: fadeDur }, windowStart + duration - fadeDur);

        // Second label: top-right corner -> past the rock's right side -> straight down and off.
        tl.fromTo(
          `.svc-pair-${i}-b`,
          { x: () => window.innerWidth * 0.45 },
          { x: restX(1), ease: "power4.out", duration },
          windowStart,
        )
          .fromTo(
            `.svc-pair-${i}-b`,
            { y: () => -window.innerHeight * 0.45 },
            { y: () => window.innerHeight * 0.45, ease: "none", duration },
            windowStart,
          )
          .fromTo(`.svc-pair-${i}-b`, { autoAlpha: 0 }, { autoAlpha: 1, duration: fadeDur }, windowStart)
          .to(`.svc-pair-${i}-b`, { autoAlpha: 0, duration: fadeDur }, windowStart + duration - fadeDur);
      }

      st = tl.scrollTrigger;
    }, sec);

    /*
     * This trigger is created while `useIsDesktop()` (consumed by
     * SelectedWork, above this section) is still mid-flight — that hook
     * starts at `false` and only flips true in its own effect, one render
     * later. SelectedWork's horizontal track is only pinned once it does,
     * and that pin's spacer is what gives this section its real place in
     * the document; before it exists, this trigger measures "top top"/
     * "bottom bottom" thousands of pixels too high and gets baked in wrong.
     *
     * The normal fix — call the global ScrollTrigger.refresh() once things
     * settle — does not work here: verified directly (gsap@3.13) that
     * ScrollTrigger.refresh() leaves this specific instance's cached
     * start/end untouched even though a *new* ScrollTrigger created on the
     * same element at the same moment measures correctly. Calling
     * .refresh() on the *instance itself* does correct it reliably, which
     * is what this does, deferred two frames so SelectedWork's pin has
     * definitely landed first.
     */
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => st?.refresh());
    });

    return () => {
      cancelAnimationFrame(raf1);
      ctx.revert();
    };
  }, [reduced, pairs.length]);

  return (
    // h-[1275svh] must equal SERVICES_SVH_TOTAL (lib/utils.ts) — Tailwind
    // needs the class spelled out literally, so this can't read the
    // constant directly. The "light" marker's 40svh is untouched: it
    // marks the same absolute point (P2's luminance flip) as before,
    // which SERVICES_P1_P4_SCALE keeps fixed; only the "dark" marker's
    // height changes, to cover the rest of the now-taller section.
    <div ref={section} className="relative h-[1275svh]">
      <ChapterMarker className="absolute left-0 top-0 h-[40svh] w-px" theme="light" />
      <ChapterMarker className="absolute left-0 top-[40svh] h-[1235svh] w-px" theme="dark" />

      <div
        ref={stage}
        className="svc-stage sticky top-0 flex h-svh flex-col overflow-hidden bg-white text-ink"
      >
        <div className="svc-canvas pointer-events-none absolute inset-0 opacity-0">
          {sceneOn ? <MonolithScene progress={progress} /> : null}
        </div>

        {/* Persistent chrome */}
        <div className="svc-chrome relative z-10 flex h-full flex-col justify-between page-x pt-[107px] pb-[43px]">
          <p className="text-center label-mono">{servicesScene.label}</p>

          <div className="flex items-end justify-between gap-8">
            <span className="hidden w-[180px] md:block" />
            <StarCaption className="text-center">
              {captionB ? servicesScene.captionB : servicesScene.captionA}
            </StarCaption>
            <MonoLink
              className="hidden shrink-0 md:inline-flex"
              label={servicesScene.link.label}
              href={servicesScene.link.href}
              width={178}
            />
          </div>
        </div>

        {/* Kinetic type stack */}
        <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
          <div className="svc-stack text-center text-kinetic uppercase tracking-[-0.01em] text-ink">
            {servicesScene.stack.map((line) => (
              <span key={line} className="block">
                {Array.from(line).map((ch, i) => (
                  <span key={`${ch}-${i}`} className="svc-char inline-block">
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/*
          Service label pairs — every pair uses the SAME two corners,
          bottom-left then top-right (re-checked directly against
          trionn.com: all three pairs land there, not an alternating
          diagonal — COMPONENTS.md's "top-left + bottom-right" note was
          wrong, read off too few of the 2fps frames to catch it). The
          continuous corner-to-corner path is GSAP-driven on
          `.svc-pair-${i}-a` and `-b` above (one class per card, not per
          pair — the two halves of a pair travel in opposite directions,
          so they can't share a tween). `opacity-0` is the pre-JS/
          reduced-motion default, overridden by GSAP's inline style once
          it runs.
        */}
        <div className="pointer-events-none absolute inset-0 z-[8] page-x">
          {pairs.map((pair, i) => (
            <div key={i} className="absolute inset-0 page-x">
              {pair[0] ? (
                <ServiceCallout
                  service={pair[0]}
                  className={`svc-pair-${i}-a absolute bottom-[110px] left-0 opacity-0 sm:bottom-[310px] sm:left-auto sm:right-1/2`}
                />
              ) : null}
              {pair[1] ? (
                <ServiceCallout
                  service={pair[1]}
                  className={`svc-pair-${i}-b absolute right-0 top-[128px] opacity-0 sm:right-auto sm:left-1/2 sm:top-[285px]`}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServiceCallout({
  service,
  className,
}: {
  service: (typeof services)[number];
  className?: string;
}) {
  return (
    /*
     * Frosted-glass card, not bare floating text — on trionn.com the
     * monolith is visibly soft-blurred through the panel wherever it
     * passes behind one. bg-black/45 + backdrop-blur-md is what gives
     * that; rounded-panel (6px, DESIGN-SYSTEM's own panel radius) keeps
     * the corner barely-there, matching the reference rather than a
     * rounder "card" radius.
     *
     * Size/spacing measured directly off a reference capture as pixel
     * ratios of its viewport (not read-by-eye px, which a screenshot's
     * own DPI/window-width can throw off): card ≈0.255 of viewport width
     * → 436px at the 1710px reference; icon ≈0.053 → ~90px, far bigger
     * than it looks relative to the title at a glance; the title→
     * description gap is a good ~0.27 of the card's own height. The
     * 30px title / 14px description were already right (COMPONENTS.md),
     * confirmed against the same ratios.
     */
    <div
      className={`max-w-[80vw] rounded-panel bg-black/45 p-8 text-text-hi backdrop-blur-md sm:max-w-[436px] sm:p-10 ${className ?? ""}`}
    >
      <div className="flex items-start gap-6">
        <h3 className="text-title-md tracking-[-0.01em]">
          {service.lines[0]}
          {service.lines[1] ? (
            <>
              <br />
              {service.lines[1]}
            </>
          ) : null}
        </h3>
        <ServiceIcon
          name={service.icon}
          className="mt-1 h-10 w-10 shrink-0 opacity-70 sm:h-[90px] sm:w-[90px]"
        />
      </div>
      <p className="mt-6 text-[14px] leading-[1.3] text-text-mid sm:mt-16">
        {service.description}
      </p>
    </div>
  );
}
