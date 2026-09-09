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
 * 20px gaps, rising in with a left→right stagger. Geometry from frame 088.
 */
export function KeyFacts() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".kf-card", {
        opacity: 0,
        y: 40,
        scale: 0.97,
        duration: 1,
        ease: "expo.out",
        stagger: 0.08,
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

        <div className="mx-auto mt-[92px] grid max-w-[var(--container-mid)] gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
