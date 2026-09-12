"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { stats, tools, toolsLabel } from "@/data/stats";

/**
 * PAGES §04 / A08 — three 330 × 407 cards in a centred 1032px container with
 * 20px gaps. Geometry from frame 088.
 *
 * The cards enter under a real 3D perspective rotation, hinged on their top
 * edge, not the 2D rise that was here before. ANIMATIONS.md noted "a single
 * small skewed placeholder" in frame 081 and then inferred
 * `opacity/y:40/scale:.97` anyway; measuring the silhouette disproves it.
 *
 * Right-hand card, measured off the frames (CSS px, final size 330 × 407):
 *
 *   frame 082   height 241 (59%)   top 323   bottom 260   taper −19.7%
 *   frame 083   height 315 (77%)   top 327   bottom 287   taper −12.3%
 *   settled     height 407         top 330   bottom 330   taper 0
 *
 * Two things follow. Within frame 082 the width narrows 323 → 298 → 259.5 over
 * equal height steps — accelerating, which only a perspective divide does; an
 * affine skew holds width constant and a linear scale narrows evenly. And the
 * top edge sits at its final 330 throughout while the bottom sweeps in, so the
 * hinge is the top edge and the bottom is the far edge.
 */
export function KeyFacts() {
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el || !grid.current || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".kf-card");
      const hint = (on: boolean) =>
        cards.forEach((c) => (c.style.willChange = on ? "transform" : ""));

      /*
       * Scrubbed, not timed. A timed tween reversed at a single trigger point,
       * and that point put the cards ~1050px down a 951px viewport — so the
       * rewind was real but never visible. Bound to scroll position instead,
       * the rotation tracks the scrollbar in both directions: down unfolds the
       * cards, up folds them back, at whatever pace you scroll.
       *
       * This is a deliberate deviation from the measured A08, which is a timed
       * ~1.1s entrance. Under a scrub the duration is governed by the scroll
       * range rather than by time, so the 1.1s no longer applies; the stagger
       * survives as a proportion of that range, which is what keeps the
       * left→right cascade. Nothing in the frames covers scrolling back up —
       * the recording is a single downward pass — so there is no reference
       * behaviour being contradicted here. Logged in REPLICATION-CHECKLIST.md.
       *
       * `ease: "none"` because the tween is now driven by scroll: any easing
       * would decouple the cards from the scrollbar and undo the point of it.
       *
       * fromTo, not from: both endpoints have to be explicit for a tween that
       * is scrubbed through in both directions.
       */
      gsap.fromTo(
        cards,
        {
          // Hinge from the top edge — that's what pins the top width at 330.
          transformOrigin: "50% 0%",
          // No transformPerspective here: perspective belongs on the grid (see
          // the container's style) so all three cards share one vanishing point
          // at its centre. Per-card perspective centres the vanishing point on
          // each card and tapers them symmetrically; a shared one makes the
          // outer cards converge inward, which is what the frames show — the
          // right card's right edge drifts 97px left against its own left
          // edge's 33px. That asymmetry is the shared vanishing point, not a
          // rotateY.
          rotateX: -70,
          opacity: 0,
        },
        {
          rotateX: 0,
          opacity: 1,
          duration: 1.1,
          ease: "none",
          // Kept from the frame measurements: in frame 082 the three cards sit
          // at ~95% / ~77% / 59% of final height. Scrubbed, this reads as a
          // spatial cascade rather than a temporal one, but the offset between
          // cards is the same proportion of the run.
          stagger: 0.145,
          scrollTrigger: {
            // The grid, not the section: the range has to be anchored to where
            // the cards actually are, or it maps to scroll positions at which
            // they are off-screen — which is exactly what went wrong before.
            trigger: grid.current!,
            start: "top 92%",
            end: "top 38%",
            // A little smoothing so the cards glide rather than snap to every
            // wheel tick; still fully scroll-bound in both directions.
            scrub: 0.6,
            // Hint only while the rotation is live. On a scrub, tween
            // onStart/onComplete fire repeatedly as you scrub across the
            // endpoints, so the trigger's own active state is the right signal.
            onToggle: (self) => hint(self.isActive),
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <ChapterSection
      theme="light"
      className="bg-[linear-gradient(180deg,#dadada_0%,#fdfdfd_60%,#ffffff_100%)] text-ink"
    >
      <div ref={root} className="page-x py-[120px]">
        <div className="text-center">
          <BlurText as="h2" text="Key facts" className="text-display track-display" />
          <p className="mx-auto mt-5 max-w-[240px] text-[14px] leading-[1.3] text-ink-mid">
            A snapshot of my experience and impact.
          </p>
        </div>

        {/*
          Solved from the frames rather than picked: at 59% of final height the
          card is rotated ~53.8°, putting its bottom edge ~328px back, and the
          measured −19.7% taper then implies perspective ≈ 1335px.
        */}
        <div
          ref={grid}
          className="mx-auto mt-[92px] grid max-w-[var(--container-mid)] gap-5 sm:grid-cols-2 lg:grid-cols-3"
          style={{ perspective: "1335px" }}
        >
          {stats.map((s) => (
            <article
              key={s.label}
              className="kf-card relative flex aspect-[330/407] flex-col overflow-hidden rounded-card p-6"
              style={{
                background:
                  s.kind === "circle"
                    ? "var(--color-card-warm)"
                    : s.kind === "dark"
                      ? "var(--color-card-dark)"
                      : s.tint,
                color: s.kind === "circle" ? "#1a1a1a" : "#f2f2f2",
              }}
            >
              {s.kind !== "circle" && s.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}

              <p className="relative z-10 text-center label-mono">{s.label}</p>

              {s.kind === "circle" ? (
                <>
                  <div className="relative z-10 mx-auto mt-8 grid h-[190px] w-[190px] place-items-center rounded-full bg-white">
                    <span className="text-[40px] leading-none tracking-[-0.02em]">
                      {s.value}
                      <sup className="text-[18px]">+</sup>
                    </span>
                  </div>
                  <p className="relative z-10 mt-auto text-center text-[14px] leading-[1.3] text-ink-mid">
                    {s.copy.map((c) => (
                      <span key={c} className="block">
                        {c}
                      </span>
                    ))}
                  </p>
                </>
              ) : (
                <div className="relative z-10 mt-auto flex items-end justify-between gap-4">
                  <div>
                    {"mark" in s && s.mark ? (
                      <p className="mb-3 text-[28px] leading-none">{s.mark}</p>
                    ) : null}
                    <p className="text-[14px] leading-[1.3]">
                      {s.copy.map((c) => (
                        <span key={c} className="block">
                          {c}
                        </span>
                      ))}
                    </p>
                  </div>
                  <span className="text-[48px] leading-none tracking-[-0.02em]">
                    {s.value}
                    <sup className="text-[20px]">+</sup>
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-[116px] text-center">
          <p className="label-mono text-ink-mid">{toolsLabel}</p>
          <ul className="mx-auto mt-8 flex max-w-[690px] flex-wrap items-center justify-center">
            {tools.map((t, i) => (
              <li
                key={t}
                className={`px-8 text-[18px] leading-none ${i > 0 ? "border-l border-black/12" : ""}`}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ChapterSection>
  );
}
