"use client";

import { useEffect, useRef } from "react";
import { lerp } from "@/lib/utils";
import { useFinePointer } from "@/hooks/useMediaQuery";

/**
 * COMPONENTS §25 — an 82px ring that lerps toward the pointer with visible lag.
 * Hero canvas only: the reference never hides or replaces the native cursor.
 */
export function CursorRing({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const ring = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();

  useEffect(() => {
    const el = ring.current;
    const container = containerRef.current;
    if (!el || !container || !fine) return;

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, visible = false;

    const move = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        el.style.opacity = "1";
      }
    };
    const leave = () => {
      visible = false;
      el.style.opacity = "0";
    };
    const tick = () => {
      x = lerp(x, tx, 0.12);
      y = lerp(y, ty, 0.12);
      el.style.transform = `translate3d(${x - 41}px, ${y - 41}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    container.addEventListener("pointermove", move);
    container.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);

    return () => {
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [containerRef, fine]);

  if (!fine) return null;

  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-20 h-[82px] w-[82px] rounded-full border border-white/40 opacity-0 transition-opacity duration-300"
    />
  );
}
