"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
import { MonoLink } from "@/components/primitives/MonoLink";
import { useSceneEnabled } from "@/components/three/SceneGate";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { site } from "@/data/site";
import { explorations } from "@/data/explorations";
import { clamp, DIM_GALLERY_FLATTEN_START, DIM_GALLERY_FLATTEN_SPAN } from "@/lib/utils";

const CurvedGallery = dynamic(
  () => import("@/components/three/CurvedGallery").then((m) => m.CurvedGallery),
  { ssr: false },
);

/** PAGES §09 / A12 — pinned curved gallery on the grey chapter. */
export function DesignInMotion() {
  const section = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const reduced = useReducedMotion();
  const sceneOn = useSceneEnabled();

  useEffect(() => {
    const sec = section.current;
    if (!sec || reduced || !sceneOn) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progress.current = self.progress;
          /*
           * The gallery's own tiles flatten into a static grid over this
           * scene's final stretch (CurvedGallery.tsx) and end up large
           * enough to fully cover this heading, sitting underneath it in
           * document flow with no z-index of its own. Fading the heading
           * out over that exact same stretch — same constants, read from
           * lib/utils.ts so the two can't drift apart — turns "the grid
           * covers the title" into "the title recedes as the grid
           * arrives": scrubbed to the same scroll progress driving the
           * gallery, not a separately-timed fade, so it rewinds in step
           * if the scene is scrolled back up.
           *
           * The bottom caption/link row (`caption`) sits behind the
           * grid's own bottom row the same way, for the same reason —
           * it's in normal document flow with no z-index relative to the
           * z-10 gallery canvas either — so it fades on the same cue.
           */
          const flatten = clamp(
            (self.progress - DIM_GALLERY_FLATTEN_START) / DIM_GALLERY_FLATTEN_SPAN,
            0,
            1,
          );
          gsap.set([headline.current, caption.current], { opacity: 1 - flatten });
        },
      });
    }, sec);
    return () => ctx.revert();
  }, [reduced, sceneOn]);

  return (
    // dim-section/dim-heading: ServicesWipe.tsx's hooks into this section —
    // see that file for why. Mirrors KeyFacts' kf-headings/kf-card pattern.
    <ChapterSection theme="light" className="dim-section bg-grey text-ink">
      {/* h-[450svh] must equal DIM_SVH_TOTAL (lib/utils.ts) — Tailwind needs
          the class spelled out literally, same constraint as ServicesScene's
          own h-[1395svh]. The extra 100svh over the original 350 is a pure
          hold after the gallery grid settles; see DIM_GALLERY_SCALE. */}
      <div ref={section} className={sceneOn ? "relative h-[450svh]" : "relative"}>
        <div
          className={
            sceneOn
              ? "sticky top-0 flex h-svh flex-col justify-between overflow-hidden py-[96px]"
              : "flex flex-col justify-between gap-16 py-[120px]"
          }
        >
          {/* Split heading — the arc passes in front of it, then the grid
              it settles into covers it outright; ref + the ScrollTrigger
              above fade this out over the grid's own flatten window. */}
          <div ref={headline} className="pointer-events-none page-x">
            <BlurText
              manual
              as="h2"
              text={site.motion.headingA}
              className="dim-heading block text-[clamp(40px,5.6vw,96px)] leading-none uppercase tracking-[-0.02em]"
            />
            <div className="mt-2 flex items-start gap-10 pl-[8%]">
              <p className="label-mono mt-3 text-ink-mid">
                {site.motion.note.map((n) => (
                  <span key={n} className="block">
                    {n}
                  </span>
                ))}
              </p>
              <BlurText
                manual
                as="h2"
                text={site.motion.headingB}
                className="dim-heading block text-[clamp(40px,5.6vw,96px)] leading-none uppercase tracking-[-0.02em]"
              />
            </div>
          </div>

          {sceneOn ? (
            <div className="pointer-events-none absolute inset-0 z-10">
              <CurvedGallery progress={progress} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 page-x md:grid-cols-3">
              {explorations.slice(0, 6).map((e) => (
                <div
                  key={e.title}
                  className="grid aspect-[714/488] place-items-center rounded-img label-mono text-white/70"
                  style={{ background: e.tint }}
                >
                  {e.title}
                </div>
              ))}
            </div>
          )}

          <div ref={caption} className="relative z-20 flex items-end justify-between gap-8 page-x">
            <p className="max-w-[260px] text-[16px] leading-[1.35] text-ink">
              {site.motion.copy}
            </p>
            <MonoLink
              label={site.motion.link.label}
              href={site.motion.link.href}
              width={173}
              className="shrink-0 text-ink-mid"
            />
          </div>
        </div>
      </div>
    </ChapterSection>
  );
}
