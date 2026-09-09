"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { CursorRing } from "@/components/chrome/CursorRing";
import { KineticHeadline } from "@/components/primitives/KineticHeadline";
import { MonoLink } from "@/components/primitives/MonoLink";
import { useSceneEnabled } from "@/components/three/SceneGate";
import { site } from "@/data/site";

const HeroShards = dynamic(
  () => import("@/components/three/HeroShards").then((m) => m.HeroShards),
  { ssr: false },
);

/** PAGES §01 — hero. Geometry anchored to frame 013. */
export function Hero() {
  const stage = useRef<HTMLDivElement>(null);
  const sceneOn = useSceneEnabled();

  return (
    <ChapterSection
      theme="dark"
      className="relative min-h-svh w-full overflow-hidden bg-dark text-text-hi"
    >
      <div ref={stage} className="absolute inset-0">
        {sceneOn ? <HeroShards /> : <div className="h-full w-full bg-dark" />}
        <CursorRing containerRef={stage} />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col justify-between page-x pt-[112px] pb-[49px]">
        <div>
          <KineticHeadline prefix={site.hero.prefix} words={site.hero.cycle} />

          <div className="mt-11 flex flex-wrap gap-[22px]">
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
              className="grid h-5 w-5 place-items-center rounded-full border border-white/30 text-[10px]"
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
