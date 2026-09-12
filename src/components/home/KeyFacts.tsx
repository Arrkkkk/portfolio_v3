"use client";

import { useRef } from "react";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
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

  /*
   * No ScrollTrigger here any more. The card rotation is one beat in a single
   * sequence that also drives the band wipe and this heading, and that sequence
   * is cued off the bands — the cards start as the fourth band fills. Splitting
   * it across two components meant two triggers that could not be phase-locked,
   * so ChapterWipe owns the whole timeline and reaches in via `.kf-card` and
   * `.kf-headings`. The geometry lives here (the grid's shared perspective);
   * only the timing moved.
   */

  return (
    <ChapterSection
      theme="light"
      className="bg-[linear-gradient(180deg,#dadada_0%,#fdfdfd_60%,#ffffff_100%)] text-ink"
    >
      {/*
        z-30 on the content, not on the section. Everything inside rides above
        the wipe overlay (z-20) so it scrolls in continuously, while the
        section's own background stays below it — the background must not lift,
        or it shows above the fill line while the bands are still arriving.
        Lifting only the headings and the cards left the tools row underneath,
        so it stayed hidden until the overlay switched off and then appeared all
        at once instead of scrolling in.
      */}
      <div ref={root} className="relative z-30 page-x py-[120px]">
        <div className="kf-headings text-center">
          <BlurText manual as="h2" text="Key facts" className="text-display track-display" />
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

        {/*
          `kf-tools` and `kf-tools-list` are ChapterWipe's hooks: it resolves
          this label's blur-chars and fades the list in together, cued to the
          third card's own rotation rather than to this block's position in
          the document. Left to normal document flow it only appeared once
          scrolled into view, which read as popping in rather than arriving as
          part of the sequence everything above it is already part of.
        */}
        <div className="kf-tools mt-[116px] text-center">
          <BlurText manual as="p" text={toolsLabel} className="label-mono text-ink-mid" />
          <ul className="kf-tools-list mx-auto mt-8 flex max-w-[690px] flex-wrap items-center justify-center">
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
