"use client";

import { useRef } from "react";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { CursorRing } from "@/components/chrome/CursorRing";
import { KineticHeadline } from "@/components/primitives/KineticHeadline";
import { MonoLink } from "@/components/primitives/MonoLink";
import { site } from "@/data/site";

/**
 * PAGES §01 — hero. Geometry anchored to frame 013.
 *
 * The WebGL mark is not here: it lives in DarkChapters, one sticky layer
 * behind this section, About and Marquee, because the reference keeps it
 * visible through all three. What remains here is the hero's own content.
 *
 * Everything in this section is pointer-events-none by default, including the
 * section itself — it sits on top of that canvas, and anything interactive
 * here would swallow the events the scene needs for its parallax, its
 * hold-to-blast and its constellation reveals. Interactive children opt back
 * in one at a time.
 */
export function Hero() {
  const stage = useRef<HTMLDivElement>(null);

  return (
    <ChapterSection
      theme="dark"
      className="pointer-events-none relative min-h-svh w-full text-text-hi"
    >
      <div ref={stage} className="pointer-events-none absolute inset-0">
        <CursorRing containerRef={stage} />
      </div>

      {/*
        pointer-events-none is load-bearing: this layer covers the canvas
        edge to edge, so without it the scene never sees a pointer event and
        the parallax, the blast and the constellation reveals are all dead —
        which is exactly what the captions below were promising. Interactive
        children opt back in individually.
      */}
      <div className="pointer-events-none relative z-10 flex min-h-svh flex-col justify-between page-x pt-[112px] pb-[49px]">
        <div>
          <KineticHeadline prefix={site.hero.prefix} words={site.hero.cycle} />

          <div className="pointer-events-auto mt-11 flex flex-wrap gap-[22px]">
            {site.footer.links.map((l) => (
              <MonoLink
                key={l.label}
                label={l.label}
                href={l.href}
                width={208}
                className="text-text-lo hover:text-text-hi"
              />
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-8">
          <div className="flex flex-col gap-3">
            <a
              href="#about"
              aria-label="Scroll to next section"
              className="pointer-events-auto grid h-5 w-5 place-items-center rounded-full border border-white/30 text-[10px]"
            >
              ↓
            </a>
          </div>

          <div className="hidden text-center label-mono text-text-mid md:block">
            {site.hero.captions.map((c) => (
              <p key={c}>{c}</p>
            ))}
          </div>

          <div className="hidden w-[220px] shrink-0 flex-col items-end gap-6 md:flex">
            <div className="flex items-stretch border border-white/15">
              <div className="flex flex-col items-center justify-center gap-1 px-3 py-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <circle cx="8" cy="8" r="7" stroke="currentColor" />
                  <ellipse cx="8" cy="8" rx="3" ry="7" stroke="currentColor" />
                  <path d="M1 8h14" stroke="currentColor" />
                </svg>
                <span className="label-mono text-[10px]">{site.hero.badge.left}</span>
              </div>
              <p className="max-w-[110px] border-l border-white/15 px-3 py-2 label-mono text-[10px] leading-[1.3]">
                {site.hero.badge.right}
              </p>
            </div>
            <p className="text-right text-[15px] leading-[1.35] text-text-hi">
              {site.hero.blurb}
            </p>
          </div>
        </div>
      </div>
    </ChapterSection>
  );
}
