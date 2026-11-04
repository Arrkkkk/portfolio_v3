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
       * P5 — each card flies in from its own screen corner, in to where it
       * rests against the monolith's side, holds, then keeps travelling
       * straight through and off in the SAME direction it arrived from —
       * not a cross-fade, and not a simple fade-in-place either (both
       * tried and rejected against a direct capture of trionn.com; see
       * COMPONENTS.md §18). The first label of every pair always
       * originates bottom-left and continues straight up past its resting
       * spot; the second always originates top-right and continues
       * straight down. Because the vertical leg never touches x, the
       * card's edge stays flush against the same side of the rock for the
       * whole glide instead of drifting away from it.
       *
       * This used to be ~13svh for a whole flight (0.033 of the old
       * 400svh section) — a tiny scroll nudge finished the entire
       * corner-to-rock trip, so scrolling didn't feel like it was driving
       * the motion at all. Also wrong per a direct re-check of
       * trionn.com: a later pair starts flying in while the EARLIER
       * pair is STILL FULLY SETTLED (mid-hold, not mid-exit) — four cards
       * on screen together for a stretch, not strictly one pair at a
       * time. Both fixed by growing the section itself (SVH constants
       * below) rather than reallocating the existing 400svh: P1–P4 keep
       * their original absolute scroll distance (via SERVICES_P1_P4_SCALE)
       * so nothing about the rise/flip/scatter above changes, and ALL of
       * the added height goes to P5. Each pair's own enter+hold+exit
       * cycle is now 450svh by itself (vs. the ~26svh a whole pair used
       * to get), and consecutive pairs START only 225svh apart — the
       * midpoint of the PREVIOUS pair's own hold (enter 150 + half of a
       * 150-long hold), not after it. An earlier version staggered by
       * enter+hold exactly (250svh), which put the overlap entirely in
       * the exit leg — the next pair only started once the previous one
       * had ALREADY begun fading, never while it was genuinely settled.
       */
      const SVH_ENTER = 150;
      const SVH_HOLD = 150;
      const SVH_EXIT = 150;
      const SVH_STAGGER = 225; // ENTER + HOLD/2 — next pair starts mid-hold, not at exit
      // SERVICES_SVH_P1_P4 + 2 staggers + one full cycle = SERVICES_SVH_TOTAL
      // (200 + 500 + 400 = 1100) — both constants live in lib/utils.ts
      // alongside the scale MonolithScene also depends on; if these svh
      // numbers below ever change, SERVICES_SVH_TOTAL there must too, and
      // so must the literal h-[1100svh] in the JSX below (Tailwind needs
      // that class spelled out, not built from a variable).
      const pairStart = (i: number) => (SERVICES_SVH_P1_P4 + i * SVH_STAGGER) / SERVICES_SVH_TOTAL;
      const enterDur = SVH_ENTER / SERVICES_SVH_TOTAL;
      const holdDur = SVH_HOLD / SERVICES_SVH_TOTAL;
      const exitDur = SVH_EXIT / SERVICES_SVH_TOTAL;

      // Always 3 — six services in diagonal pairs, same assumption the
      // window math above already makes. Looping a fixed count rather
      // than `pairs.forEach` keeps `pairs` (a fresh array every render)
      // out of this effect's dependencies.
      for (let i = 0; i < 3; i++) {
        const windowStart = pairStart(i);
        const exitStart = windowStart + enterDur + holdDur;

        // First label: bottom-left corner -> rests on the rock's left side -> straight up and out.
        tl.fromTo(
          `.svc-pair-${i}-a`,
          {
            x: () => -window.innerWidth * 0.45,
            y: () => window.innerHeight * 0.45,
            autoAlpha: 0,
          },
          { x: 0, y: 0, autoAlpha: 1, duration: enterDur },
          windowStart,
        ).to(
          `.svc-pair-${i}-a`,
          { y: () => -window.innerHeight * 0.45, autoAlpha: 0, duration: exitDur },
          exitStart,
        );

        // Second label: top-right corner -> rests on the rock's right side -> straight down and out.
        tl.fromTo(
          `.svc-pair-${i}-b`,
          {
            x: () => window.innerWidth * 0.45,
            y: () => -window.innerHeight * 0.45,
            autoAlpha: 0,
          },
          { x: 0, y: 0, autoAlpha: 1, duration: enterDur },
          windowStart,
        ).to(
          `.svc-pair-${i}-b`,
          { y: () => window.innerHeight * 0.45, autoAlpha: 0, duration: exitDur },
          exitStart,
        );
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
    // h-[1100svh] must equal SERVICES_SVH_TOTAL (lib/utils.ts) — Tailwind
    // needs the class spelled out literally, so this can't read the
    // constant directly. The "light" marker's 40svh is untouched: it
    // marks the same absolute point (P2's luminance flip) as before,
    // which SERVICES_P1_P4_SCALE keeps fixed; only the "dark" marker's
    // height changes, to cover the rest of the now-taller section.
    <div ref={section} className="relative h-[1100svh]">
      <ChapterMarker className="absolute left-0 top-0 h-[40svh] w-px" theme="light" />
      <ChapterMarker className="absolute left-0 top-[40svh] h-[1060svh] w-px" theme="dark" />

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
          fly-in/hold/fly-out motion is GSAP-driven on `.svc-pair-${i}-a`
          and `-b` above (one class per card, not per pair — the two
          halves of a pair travel in opposite directions, so they can't
          share a tween). `opacity-0` is the pre-JS/reduced-motion
          default, overridden by GSAP's inline style once it runs.
        */}
        <div className="pointer-events-none absolute inset-0 z-[8] page-x">
          {pairs.map((pair, i) => (
            <div key={i} className="absolute inset-0 page-x">
              {pair[0] ? (
                <ServiceCallout
                  service={pair[0]}
                  className={`svc-pair-${i}-a absolute bottom-[110px] left-0 opacity-0 sm:bottom-[310px] sm:left-[180px]`}
                />
              ) : null}
              {pair[1] ? (
                <ServiceCallout
                  service={pair[1]}
                  className={`svc-pair-${i}-b absolute right-0 top-[128px] opacity-0 sm:right-[180px] sm:top-[285px]`}
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
