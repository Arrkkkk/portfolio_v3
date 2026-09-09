"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChapterMarker } from "@/components/chrome/ChapterTheme";
import { MonoLink } from "@/components/primitives/MonoLink";
import { StarCaption } from "@/components/primitives/Rule";
import { ServiceIcon } from "@/components/expertise/ServiceIcon";
import { useSceneEnabled } from "@/components/three/SceneGate";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { seeded } from "@/lib/utils";
import { services, servicesScene } from "@/data/services";

const MonolithScene = dynamic(
  () => import("@/components/three/MonolithScene").then((m) => m.MonolithScene),
  { ssr: false },
);

/**
 * PAGES §07 / A10 — the pinned services set-piece, the site's centrepiece.
 *
 * Six phases scrubbed across ~400vh of scroll (frames 121–178):
 *   P1 the type stack settles on white
 *   P2 background crossfades to #0E0E0E, smoke and monolith enter
 *   P3 glyphs detach and tumble out of frame
 *   P4 the monolith settles square-on
 *   P5 six service labels cross-fade in diagonal pairs
 *   P6 the scene unpins
 */
export function ServicesScene() {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [captionB, setCaptionB] = useState(false);
  const [activePair, setActivePair] = useState(-1);
  const reduced = useReducedMotion();
  const sceneOn = useSceneEnabled();

  const pairs = [services.slice(0, 2), services.slice(2, 4), services.slice(4, 6)];

  useEffect(() => {
    const sec = section.current;
    if (!sec || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            progress.current = p;
            setCaptionB(p > 0.42);
            // P5 — one diagonal pair at a time across the back half of the scene.
            setActivePair(p < 0.5 ? -1 : Math.min(2, Math.floor((p - 0.5) / 0.165)));
          },
        },
      });

      // A spacer pins the timeline's total duration to exactly 1, so every
      // position below reads directly as a fraction of the pinned scroll.
      tl.to({}, { duration: 1 }, 0);

      // P1 — the stack settles and grows slightly.
      tl.fromTo(".svc-stack", { scale: 0.94, y: 60 }, { scale: 1.12, y: 0, duration: 0.3 }, 0);

      // P2 — luminance flip.
      tl.to(".svc-stage", { backgroundColor: "#0e0e0e", duration: 0.14 }, 0.1)
        .to(".svc-stack", { color: "#f2f2f2", duration: 0.12 }, 0.12)
        .to(".svc-canvas", { opacity: 1, duration: 0.14 }, 0.1)
        .to(".svc-chrome", { color: "#f2f2f2", duration: 0.12 }, 0.12);

      // P3 — glyphs detach as independent bodies and fall out of frame.
      tl.to(
        ".svc-char",
        {
          x: (i: number) => (seeded(i + 1) - 0.5) * 1400,
          y: (i: number) => (seeded(i + 41) - 0.5) * 900,
          rotate: (i: number) => (seeded(i + 91) - 0.5) * 540,
          opacity: 0,
          ease: "power2.in",
          duration: 0.14,
          stagger: { each: 0.001, from: "random" },
        },
        0.3,
      );

    }, sec);

    return () => ctx.revert();
  }, [reduced, pairs.length]);

  return (
    <div ref={section} className="relative h-[400svh]">
      <ChapterMarker className="absolute left-0 top-0 h-[40svh] w-px" theme="light" />
      <ChapterMarker className="absolute left-0 top-[40svh] h-[360svh] w-px" theme="dark" />

      <div
        ref={stage}
        className="svc-stage sticky top-0 flex h-svh flex-col overflow-hidden bg-white text-ink"
      >
        <div className="svc-canvas pointer-events-none absolute inset-0 opacity-0">
          {sceneOn ? <MonolithScene progress={progress} /> : null}
        </div>

        {/* Persistent chrome */}
        <div className="svc-chrome relative z-10 flex h-full flex-col justify-between page-x pt-[107px] pb-[43px]">
          <p className="text-center label-mono">{servicesScene.label}</p>

          <div className="flex items-end justify-between gap-8">
            <span className="hidden w-[180px] md:block" />
            <StarCaption className="text-center">
              {captionB ? servicesScene.captionB : servicesScene.captionA}
            </StarCaption>
            <MonoLink
              className="hidden shrink-0 md:inline-flex"
              label={servicesScene.link.label}
              href={servicesScene.link.href}
              width={178}
            />
          </div>
        </div>

        {/* Kinetic type stack */}
        <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center">
          <div className="svc-stack text-center text-kinetic uppercase tracking-[-0.01em] text-ink">
            {servicesScene.stack.map((line) => (
              <span key={line} className="block">
                {Array.from(line).map((ch, i) => (
                  <span key={`${ch}-${i}`} className="svc-char inline-block">
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* Service label pairs — diagonal, top-left + bottom-right */}
        <div className="pointer-events-none absolute inset-0 z-[8] page-x">
          {pairs.map((pair, i) => (
            <div
              key={i}
              className="absolute inset-0 page-x transition-opacity duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
              style={{ opacity: activePair === i ? 1 : 0 }}
            >
              {pair[0] ? (
                <ServiceCallout service={pair[0]} className="absolute left-[13%] top-[128px]" />
              ) : null}
              {pair[1] ? (
                <ServiceCallout
                  service={pair[1]}
                  className="absolute left-[65%] bottom-[110px]"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServiceCallout({
  service,
  className,
}: {
  service: (typeof services)[number];
  className?: string;
}) {
  return (
    <div className={`max-w-[260px] text-text-hi ${className ?? ""}`}>
      <div className="flex items-start gap-6">
        <h3 className="text-title-md tracking-[-0.01em]">
          {service.lines[0]}
          {service.lines[1] ? (
            <>
              <br />
              {service.lines[1]}
            </>
          ) : null}
        </h3>
        <ServiceIcon name={service.icon} className="mt-1 shrink-0 opacity-70" />
      </div>
      <p className="mt-[104px] text-[14px] leading-[1.3] text-text-mid">
        {service.description}
      </p>
    </div>
  );
}
