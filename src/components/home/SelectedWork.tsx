"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
import { MonoLink } from "@/components/primitives/MonoLink";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { projects } from "@/data/projects";

/**
 * PAGES §05 / A09 — vertical scroll is mapped to X translation of the whole
 * row: the title column, the divider and the cards travel together as one rigid
 * track (frames 096–120). Below `lg` it unwinds into a vertical stack
 * (RESPONSIVE.md — our rule, not observed).
 *
 * The title column is NOT sticky. FRAME-MAP.md used to describe it as "still
 * while project cards translate leftward", and that was wrong: frames 098–102
 * show "Selected work / & explorations" sliding left and leaving the viewport.
 * Cross-correlating the heading band against the card band gives the same
 * displacement frame for frame at three different scroll speeds — 99→100
 * 118/119 px, 100→101 99/99, 101→102 28/28, 102→103 46/46 — so it is one
 * translation, not a parallax pair.
 *
 * Moving the title costs no extra scroll, because the two travel distances are
 * algebraically the same number. The cards used to start at x 730 and run until
 * their right edge reached the viewport's: `track − (vw − 730)`. The row is
 * `730 + track` wide and runs until its own right edge gets there:
 * `730 + track − vw`. 730 is exactly the title column (698) plus the page
 * padding (32), so the section pins for the same distance it always did.
 */
export function SelectedWork() {
  const section = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();

  useEffect(() => {
    const sec = section.current;
    const rw = row.current;
    if (!sec || !rw || reduced || !desktop) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      /*
       * Measured off the row rather than the card track, and against the full
       * viewport rather than the viewport-less-730: the row now carries the
       * title, so its own width already includes everything that has to pass
       * the screen. The old form hard-coded 730 as the track's starting x,
       * which is a number that has to be kept in step with the column width by
       * hand; this one cannot drift out of step with the layout.
       */
      const distance = () => Math.max(0, rw.scrollWidth - window.innerWidth);
      gsap.to(rw, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, sec);

    return () => ctx.revert();
  }, [reduced, desktop]);

  return (
    <ChapterSection
      theme="light"
      className="bg-[linear-gradient(180deg,#ffffff_0%,#ededed_100%)] text-ink"
    >
      <div ref={section} className="relative lg:h-svh lg:overflow-hidden">
        {/*
          `lg:w-max` is what lets the row be wider than the screen so it can be
          translated as a unit. It used to be viewport-width with the card track
          clipped inside it, and the transform sat on that inner track — which
          is why the title stayed put. Translating the row in that arrangement
          does not work: the clipping wrapper travels too, and its right edge
          takes the cards off screen with it. The section's own
          `lg:overflow-hidden` above does the clipping now.
        */}
        <div
          ref={row}
          className="flex h-full flex-col gap-16 page-x py-[120px] lg:w-max lg:flex-row lg:gap-0 lg:py-0"
        >
          {/* Sticky title column — 43% of the viewport, divider at x 730 */}
          <div className="flex shrink-0 flex-col justify-center lg:w-[698px] lg:border-r lg:border-black/12 lg:pr-16">
            <BlurText
              as="h2"
              text="Selected work"
              className="block text-display track-display lg:pl-[68px]"
            />
            <BlurText
              as="h2"
              text="& explorations"
              className="block text-display track-display lg:pl-[68px]"
            />
            <MonoLink
              className="mt-[64px] text-ink-mid lg:ml-[190px]"
              label="View all projects"
              href="/work"
              width={168}
            />
          </div>

          {/* Horizontal track */}
          {/*
            No `overflow-hidden`/`shrink`/`min-w-0` here any more — those made
            this a clipping window sized to the space left beside the title, and
            a clipping window cannot travel. It is now just the cards' vertical
            offset.
          */}
          <div className="lg:flex lg:h-full lg:items-start lg:pt-[187px]">
            <div className="flex flex-col gap-16 lg:w-max lg:flex-none lg:flex-row lg:gap-[60px] lg:pl-[66px]">
              {projects.map((p) => (
                <article key={p.slug} className="lg:w-[714px] lg:shrink-0">
                  <Link href={`/work/${p.slug}`} className="group block">
                    <div
                      className="relative aspect-[714/488] w-full overflow-hidden rounded-img"
                      style={{ background: p.tint }}
                    >
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center label-mono text-white/70">
                          Add project image
                        </span>
                      )}
                    </div>
                  </Link>

                  <h3 className="mt-10 text-[24px] leading-none tracking-[-0.01em]">
                    {p.title}
                  </h3>
                  <div className="mt-3 flex items-end justify-between gap-8">
                    <p className="measure text-[14px] leading-[1.3] text-ink-mid">
                      {p.description}
                    </p>
                    <MonoLink
                      className="shrink-0 text-ink-mid"
                      label="Explore project"
                      href={`/work/${p.slug}`}
                      width={183}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ChapterSection>
  );
}
