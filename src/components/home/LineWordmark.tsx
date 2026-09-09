"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Segment = { row: number; x1: number; x2: number };

/**
 * COMPONENTS §24 / A13 — the giant wordmark drawn as ~40 rows of horizontal
 * hairlines (a scanline reading of the letterforms). Rows draw in with a
 * stagger; hovering pushes nearby rows aside, which is what the footer's
 * "HOVER THE LINES." caption refers to.
 */
export function LineWordmark({ word }: { word: string }) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [rows, setRows] = useState(40);
  const svg = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  const W = 1600;
  // Height follows from the width-filling type size, so the wordmark always
  // spans the full page like the reference's (frame 248).
  const [H, setH] = useState(420);

  useEffect(() => {
    // Measured after paint: the sampling is a DOM measurement, so it is
    // scheduled rather than run synchronously inside the effect body.
    const frame = requestAnimationFrame(() => {
    const probe = document.createElement("canvas").getContext("2d");
    if (!probe) return;

    // Size the type to fill the width, then size the canvas to the type.
    probe.font = `600 100px system-ui, sans-serif`;
    const unit = probe.measureText(word).width / 100;
    const size = (W * 0.99) / unit;
    const height = Math.round(size * 0.78);

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${size}px system-ui, sans-serif`;
    ctx.fillText(word, W / 2, height / 2);

    const data = ctx.getImageData(0, 0, W, height).data;
    const rowCount = 44;
    const step = Math.floor(height / rowCount);
    const out: Segment[] = [];

    for (let r = 0; r < rowCount; r++) {
      const y = Math.min(height - 1, r * step + Math.floor(step / 2));
      let start: number | null = null;
      for (let x = 0; x < W; x++) {
        const on = data[(y * W + x) * 4 + 3] > 40;
        if (on && start === null) start = x;
        if (!on && start !== null) {
          if (x - start > 6) out.push({ row: r, x1: start, x2: x });
          start = null;
        }
      }
      if (start !== null && W - start > 6) out.push({ row: r, x1: start, x2: W });
    }

    setRows(rowCount);
    setH(height);
    setSegments(out);
    });
    return () => cancelAnimationFrame(frame);
  }, [word]);

  useEffect(() => {
    const el = svg.current;
    if (!el || !segments.length || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".lw-line", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.6,
        ease: "expo.out",
        stagger: 0.02,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [segments, reduced]);

  // Hover deformation
  useEffect(() => {
    const el = svg.current;
    if (!el || reduced) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const y = ((e.clientY - r.top) / r.height) * rows;
      el.querySelectorAll<SVGLineElement>(".lw-line").forEach((line) => {
        const row = Number(line.dataset.row);
        const d = Math.abs(row - y);
        const push = Math.max(0, 1 - d / 4);
        gsap.to(line, {
          x: push * 26 * (row % 2 ? 1 : -1),
          opacity: 0.35 + push * 0.55,
          duration: 0.5,
          ease: "expo.out",
          overwrite: true,
        });
      });
    };
    const onLeave = () => {
      gsap.to(el.querySelectorAll(".lw-line"), {
        x: 0,
        opacity: 0.35,
        duration: 0.8,
        ease: "expo.out",
      });
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [rows, reduced, segments]);

  const step = H / rows;

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      aria-label={word}
      role="img"
    >
      {segments.map((s, i) => (
        <line
          key={i}
          className="lw-line"
          data-row={s.row}
          x1={s.x1}
          x2={s.x2}
          y1={s.row * step + step / 2}
          y2={s.row * step + step / 2}
          stroke="currentColor"
          strokeWidth={1.4}
          opacity={0.35}
        />
      ))}
    </svg>
  );
}
