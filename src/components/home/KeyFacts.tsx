"use client";

import { useRef } from "react";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
import { LOCK_PX } from "@/components/home/ChapterWipe";
import { stats, statsNote, tools, toolsLabel } from "@/data/stats";

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
        The height the lock spends. ChapterWipe holds this section still while
        the three cards rotate, and holding content still while someone scrolls
        is the same thing as consuming scroll — so the scroll has to exist. It
        is cancelled by a matching −LOCK_PX on the block's transform until the
        hold spends it, which is what makes the release land exactly on the
        layout position instead of jumping to it.
      */}
      <div aria-hidden style={{ height: LOCK_PX }} />

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
          {/*
            font-medium (500) is a deliberate deviation from "weight 400
            display only" — the owner's call, logged in CLAUDE.md alongside
            the marquee's. It is a real cut, not a synthesized one: both
            weights are self-hosted and `font-synthesis-weight: none` is set
            globally, so an unloaded weight would silently fall back to 400
            rather than fake it.
          */}
          <BlurText
            manual
            as="h2"
            text="Key facts"
            className="text-display track-display font-medium"
          />
          <p className="mx-auto mt-5 max-w-[240px] text-[14px] leading-[1.3] text-ink-mid">
            {statsNote}
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
              <p className="relative z-10 text-center label-mono">{s.label}</p>

              {s.kind !== "circle" && s.image ? (
                /*
                 * In normal flex flow between the label and the bottom row,
                 * not absolutely positioned over the whole card — that was
                 * the first version, sized as a fixed percentage (60%) of the
                 * card's own height, and it broke at the `sm` grid breakpoint
                 * (640px): there the grid goes from 1 column to 2, so the
                 * card itself gets narrower and, via `aspect-[330/407]`,
                 * shorter — but the label and the bottom block (copy + the
                 * large value number) are set in fixed px and do not shrink
                 * with it. A percentage tuned safe at the 1710px reference
                 * width (measured: 41px clear above, 10px below) overlapped
                 * the bottom block by 26px at 640px. Checked across five
                 * widths (1710/1280/900/640/390), not assumed from one.
                 *
                 * `flex-1` makes this wrapper BE the leftover space between
                 * the label and the bottom row, whatever that space actually
                 * is at the current breakpoint — a structural guarantee
                 * against overlap rather than a number that has to be
                 * re-checked every time card content or a breakpoint changes.
                 * `items-center justify-center` then centres the image inside
                 * that space on both axes, and `max-h-[95%] max-w-[95%]`
                 * leaves a thin margin inside it rather than touching edge
                 * to edge.
                 *
                 * No `object-cover`: the artwork is not the card's own
                 * 330:407 aspect (it is 691:1016, taller and narrower), and
                 * the brief is not to crop it. A plain `<img>` with only
                 * max-height/max-width set (no explicit width/height) already
                 * scales to fit while keeping its own aspect ratio;
                 * `object-contain` is there for clarity, not doing anything
                 * additional on its own here.
                 *
                 * The leftover space inside the margin, and between the
                 * image and the card's edges, is NOT empty — the card's own
                 * `tint` is sampled from the artwork's own flat background
                 * (see stats.ts), so that space reads as more of the same
                 * background rather than a gap around a pasted-on rectangle.
                 */
                <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt=""
                    className="max-h-[95%] max-w-[95%] object-contain"
                  />
                </div>
              ) : null}

              {s.kind === "circle" ? (
                <>
                  <div className="relative z-10 mx-auto mt-8 grid h-[190px] w-[190px] place-items-center rounded-full bg-white">
                    {/*
                     * PP Editorial New Light — the owner's font file, self-hosted and
                     * subset to digits + "+" only (layout.tsx). Swapped in for the
                     * numerals alone: its thick-curve/hairline-stem contrast is the
                     * whole point here, which Neue Montreal's uniform grotesque stroke
                     * can't give. Tracking reset to normal — the display face's tight
                     * -0.02em was tuned for a grotesque sans, not a high-contrast serif.
                     */}
                    <span className="font-editorial text-[101px] leading-none font-light tracking-normal">
                      {s.value}
                      <sup className="text-[43px]">+</sup>
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
                  {/* PP Editorial New Light — see the circle card above for why. */}
                  <span className="font-editorial text-[60px] leading-none font-light tracking-normal">
                    {s.value}
                    <sup className="text-[24px]">+</sup>
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
          {/*
            The 32px item padding is the reference's spacing and only holds
            where there is room for it. Measured: the five names are 289px of
            text, so at `px-8` the row needs 609px and the available width is
            the viewport less the 32px page padding — it ran out at 640px and
            wrapped "Figma" onto a line of its own.

            The wrap also exposed the divider: a `border-l` on every item but
            the first means whichever item starts a wrapped row keeps its
            border, so the second line opened with a hairline attached to
            nothing. Hence `sm:border-l` — below the breakpoint the rule is
            dropped entirely and `gap` carries the separation, which cannot
            orphan. Above it the padding steps down before the row runs out of
            room, so it stays on one line and the dividers always sit between
            two names.
          */}
          <ul className="kf-tools-list mx-auto mt-8 flex max-w-[690px] flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-0">
            {tools.map((t, i) => (
              <li
                key={t}
                className={`px-0 text-[18px] leading-none sm:px-6 lg:px-8 ${
                  i > 0 ? "border-black/12 sm:border-l" : ""
                }`}
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
