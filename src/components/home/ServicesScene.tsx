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
import { seeded } from "@/lib/utils";
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
            setCaptionB(p > 0.42);
          },
        },
      });

      // A spacer pins the timeline's total duration to exactly 1, so every
      // position below reads directly as a fraction of the pinned scroll.
      tl.to({}, { duration: 1 }, 0);

      // P1 — the stack settles and grows slightly.
      tl.fromTo(".svc-stack", { scale: 0.94, y: 60 }, { scale: 1.12, y: 0, duration: 0.3 }, 0);

      // P2 — luminance flip.
      tl.to(".svc-stage", { backgroundColor: "#0e0e0e", duration: 0.14 }, 0.1)
        .to(".svc-stack", { color: "#f2f2f2", duration: 0.12 }, 0.12)
        .to(".svc-canvas", { opacity: 1, duration: 0.14 }, 0.1)
        .to(".svc-chrome", { color: "#f2f2f2", duration: 0.12 }, 0.12);

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
          duration: 0.14,
          stagger: { each: 0.001, from: "random" },
        },
        0.3,
      );

      /*
       * P5 — each pair rises up into its resting corners, holds, then keeps
       * rising on out as the next pair rises in under it. Re-captured
       * directly off trionn.com (frames here, not in the 2fps recording,
       * undersold it as a plain cross-fade): a pair doesn't fade in place,
       * it travels — up from `y: 40` to `0` on the way in, straight on
       * through to `y: -40` on the way out, so consecutive pairs read as
       * one continuous upward procession rather than three unrelated
       * fades. Three 0.165-wide windows starting at 0.5, matching the
       * three pairs; the middle 60% of each window is an implicit hold
       * (no tween touches it, so it just sits at the previous tween's end
       * value) and the first/last 20% are the rise in/out.
       */
      const PAIR_START = 0.5;
      const PAIR_WINDOW = 0.165;
      const PAIR_EDGE = PAIR_WINDOW * 0.2;
      // Always 3 — six services in diagonal pairs, same assumption the
      // window math above already makes. Looping a fixed count rather
      // than `pairs.forEach` keeps `pairs` (a fresh array every render)
      // out of this effect's dependencies.
      for (let i = 0; i < 3; i++) {
        const windowStart = PAIR_START + i * PAIR_WINDOW;
        tl.fromTo(
          `.svc-pair-${i}`,
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: PAIR_EDGE },
          windowStart,
        ).to(
          `.svc-pair-${i}`,
          { y: -40, autoAlpha: 0, duration: PAIR_EDGE },
          windowStart + PAIR_WINDOW - PAIR_EDGE,
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
    <div ref={section} className="relative h-[400svh]">
      <ChapterMarker className="absolute left-0 top-0 h-[40svh] w-px" theme="light" />
      <ChapterMarker className="absolute left-0 top-[40svh] h-[360svh] w-px" theme="dark" />

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
          rise/hold/rise-out motion is GSAP-driven on `.svc-pair-${i}`
          above, not React state, so opacity starts at 0 inline (not a
          Tailwind class) as the pre-JS/reduced-motion default — matches
          the old activePair=-1 default of "nothing shown until animated
          in" rather than flashing all three stacked at full opacity.
        */}
        <div className="pointer-events-none absolute inset-0 z-[8] page-x">
          {pairs.map((pair, i) => (
            <div key={i} className={`svc-pair-${i} absolute inset-0 page-x`} style={{ opacity: 0 }}>
              {pair[0] ? (
                <ServiceCallout
                  service={pair[0]}
                  className="absolute bottom-[110px] left-0 sm:left-[13%]"
                />
              ) : null}
              {pair[1] ? (
                <ServiceCallout
                  service={pair[1]}
                  className="absolute right-0 top-[128px] sm:right-auto sm:left-[65%]"
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
     */
    <div
      className={`max-w-[80vw] rounded-panel bg-black/45 p-8 text-text-hi backdrop-blur-md sm:max-w-[320px] ${className ?? ""}`}
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
        <ServiceIcon name={service.icon} className="mt-1 h-12 w-12 shrink-0 opacity-70" />
      </div>
      <p className="mt-6 text-[14px] leading-[1.3] text-text-mid">{service.description}</p>
    </div>
  );
}
