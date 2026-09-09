"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Service } from "@/data/services";

/**
 * PAGES §14 / A16 — a 50/50 split row with a 1px divider. Capability lines
 * stagger in and each one's underline draws left→right (frames 290–293).
 */
export function ServiceRow({ service }: { service: Service }) {
  const row = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = row.current;
    if (!el || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      });
      tl.from(".sr-media", { opacity: 0, y: 40, duration: 0.8, ease: "expo.out" })
        .from(".sr-copy > *", { opacity: 0, y: 16, duration: 0.5, ease: "expo.out", stagger: 0.06 }, 0.1)
        .from(
          ".sr-cap",
          { opacity: 0, y: 10, duration: 0.4, ease: "expo.out", stagger: 0.06 },
          0.3,
        )
        .from(
          ".sr-cap-rule",
          { scaleX: 0, transformOrigin: "left center", duration: 0.5, ease: "expo.out", stagger: 0.06 },
          0.34,
        );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={row}
      className="relative grid gap-12 border-t border-black/12 py-[110px] lg:grid-cols-2 lg:gap-0"
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-0 hidden h-full w-px bg-black/12 lg:block"
      />
      <span
        aria-hidden
        className="absolute left-1/2 top-0 hidden -translate-x-1/2 -translate-y-1/2 text-[11px] opacity-40 lg:block"
      >
        +
      </span>

      <div className="sr-media flex flex-col items-center lg:pr-16">
        <p className="label-mono max-w-[280px] text-center text-ink-lo">{service.caption}</p>
        <div className="mt-10 aspect-[493/320] w-full max-w-[493px] bg-[#eceff1]" />
      </div>

      <div className="sr-copy lg:pl-16">
        <h3 className="text-title-md tracking-[-0.01em]">{service.title}</h3>
        <p className="mt-4 max-w-[350px] text-[14px] leading-[1.3] text-ink-mid lg:max-w-[350px]">
          {service.description}
        </p>

        <p className="mt-[88px] label-mono text-ink-lo">Core capabilities</p>
        <ul className="mt-6">
          {service.capabilities.map((c) => (
            <li key={c} className="sr-cap pt-3">
              <span className="block text-[14px]">{c}</span>
              <span className="sr-cap-rule mt-3 block h-px w-full bg-black/12" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
