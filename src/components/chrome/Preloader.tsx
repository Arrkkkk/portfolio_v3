"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { site } from "@/data/site";
import { Monogram } from "./Monogram";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useClientFlag } from "@/hooks/useClientFlag";

/**
 * COMPONENTS §6 / A01 — grey (#BBBBBB) full screen, a 195px framed square with
 * `×` corner ticks, the monogram assembling inside, a keyword caption and a
 * counter. Exits on a *hard cut to black* (frames 005 → 006), not a fade.
 */
const alreadySeen = () =>
  typeof window !== "undefined" && sessionStorage.getItem("preloaded") === "1";

export function Preloader() {
  const seen = useClientFlag(alreadySeen);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (seen || reduced) return;
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("preloaded", "1");
          document.body.style.overflow = "";
          setDone(true);
        },
      });
      tl.to({ v: 0 }, {
        v: 100,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate() {
          setCount(Math.round((this.targets()[0] as { v: number }).v));
        },
      })
        .from(".pl-frame", { scale: 0.9, opacity: 0, duration: 0.8, ease: "expo.out" }, 0)
        // fromTo, not to: the mask paths live inside <defs>, so GSAP cannot
        // reliably read their starting dash offset from the stylesheet.
        .fromTo(
          ".mono-draw",
          { strokeDashoffset: 1000 },
          { strokeDashoffset: 0, duration: 1.5, ease: "power1.inOut" },
          0.2,
        )
        .from(".pl-word", { opacity: 0, y: 6, duration: 0.5, stagger: 0.08, ease: "expo.out" }, 0.5)
        // hard cut, not a fade
        .set(root.current, { backgroundColor: "#000000" }, "+=0.2")
        .set(root.current, { autoAlpha: 0 }, "+=0.25");
    }, root);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, [reduced, seen]);

  if (done || seen || reduced) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] grid place-items-center bg-grey text-[#1a1a1a]"
      aria-hidden
    >
      <div className="flex flex-col items-center">
        <div className="pl-frame relative h-[195px] w-[195px] border border-black/25">
          {["-top-2 -left-2", "-top-2 -right-2", "-bottom-2 -left-2", "-bottom-2 -right-2"].map(
            (pos) => (
              <span
                key={pos}
                className={`absolute ${pos} text-[11px] leading-none opacity-50`}
              >
                ×
              </span>
            ),
          )}
          <Monogram
            animated
            className="pl-mark absolute inset-0 m-auto h-[124px] w-[149px] text-[#3a3a3a]"
          />
        </div>

        <p className="mt-7 flex gap-2 label-mono">
          {site.preloaderWords.map((w, i) => (
            <span key={w} className="pl-word">
              {i > 0 ? <span className="mr-2 opacity-40">·</span> : null}
              {w}
            </span>
          ))}
        </p>
      </div>

      <p className="absolute bottom-[73px] left-1/2 -translate-x-1/2 font-mono text-[11px] tabular-nums opacity-60">
        {String(count).padStart(3, "0")}
      </p>
    </div>
  );
}
