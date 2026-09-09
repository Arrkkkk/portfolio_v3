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
 * PAGES §05 / A09 — vertical scroll is mapped to X translation of the card
 * track while the title column stays put (frames 096–120). Below `lg` the track
 * unwinds into a vertical stack (RESPONSIVE.md — our rule, not observed).
 */
export function SelectedWork() {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();

  useEffect(() => {
    const sec = section.current;
    const tr = track.current;
    if (!sec || !tr || reduced || !desktop) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, tr.scrollWidth - (window.innerWidth - 730));
      gsap.to(tr, {
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
        <div className="flex h-full flex-col gap-16 page-x py-[120px] lg:flex-row lg:gap-0 lg:py-0">
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
          <div className="lg:flex lg:h-full lg:min-w-0 lg:shrink lg:items-start lg:overflow-hidden lg:pt-[187px]">
            <div
              ref={track}
              className="flex flex-col gap-16 lg:w-max lg:flex-none lg:flex-row lg:gap-[60px] lg:pl-[66px]"
            >
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
