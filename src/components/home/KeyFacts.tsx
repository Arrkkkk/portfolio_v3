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
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".kf-card");
      gsap.from(cards, {
        // Hinge from the top edge — that's what pins the top width at 330.
        transformOrigin: "50% 0%",
        // No transformPerspective here: perspective belongs on the grid (see
        // the container's style) so all three cards share one vanishing point
        // at its centre. Per-card perspective centres the vanishing point on
        // each card and tapers them symmetrically; a shared one makes the
        // outer cards converge inward, which is what the frames show — the
        // right card's right edge drifts 97px left against its own left edge's
        // 33px. That asymmetry is the shared vanishing point, not a rotateY.
        rotateX: -70,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        // 0.17, not the 0.08 originally inferred. In frame 082 the three
        // cards sit at ~95% / ~77% / 59% of final height — a 36-point spread.
        // On this expo.out curve that is ~0.30 of the duration between the
        // first card and the last, solved to 0.145 per step by
        // measurement: 0.08 gave a 16-point spread, 0.17 gave 59.
        stagger: 0.145,
        // Softens edges mid-rotation in some browsers; dropped on completion
        // so it doesn't pin a layer for the life of the page.
        onStart: () => cards.forEach((c) => (c.style.willChange = "transform")),
        onComplete: () => cards.forEach((c) => (c.style.willChange = "")),
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
      });
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
