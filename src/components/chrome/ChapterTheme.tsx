"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Chapter = "dark" | "light";

type Registry = Map<HTMLElement, Chapter>;

const ChapterCtx = createContext<{
  theme: Chapter;
  register: (el: HTMLElement, theme: Chapter) => () => void;
}>({ theme: "dark", register: () => () => {} });

/**
 * A06 — the header inverts with whatever chapter sits behind it. The reference
 * flips at the header's own eye-line (y ≈ 46), not at the viewport top, so the
 * probe line is set there.
 */
const PROBE_Y = 46;

export function ChapterProvider({ children }: { children: React.ReactNode }) {
  const registry = useRef<Registry>(new Map());
  const [theme, setTheme] = useState<Chapter>("dark");

  const register = useCallback((el: HTMLElement, chapter: Chapter) => {
    registry.current.set(el, chapter);
    return () => {
      registry.current.delete(el);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      let next: Chapter | null = null;
      for (const [el, chapter] of registry.current) {
        const r = el.getBoundingClientRect();
        if (r.top <= PROBE_Y && r.bottom > PROBE_Y) next = chapter;
      }
      if (next) setTheme((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const value = useMemo(() => ({ theme, register }), [theme, register]);
  return <ChapterCtx.Provider value={value}>{children}</ChapterCtx.Provider>;
}

export const useChapter = () => useContext(ChapterCtx).theme;

/** Wraps a section and reports its luminance chapter to the header. */
export function ChapterSection({
  theme,
  className,
  children,
  id,
  ...rest
}: React.ComponentProps<"section"> & { theme: Chapter }) {
  const ref = useRef<HTMLElement>(null);
  const { register } = useContext(ChapterCtx);

  useEffect(() => {
    if (!ref.current) return;
    return register(ref.current, theme);
  }, [register, theme]);

  return (
    <section ref={ref} id={id} className={className} {...rest}>
      {children}
    </section>
  );
}

/**
 * A zero-height sentinel that reports a chapter without owning a section.
 * Used inside pinned scenes whose luminance changes part-way through (A10).
 */
export function ChapterMarker({
  theme,
  className,
}: {
  theme: Chapter;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { register } = useContext(ChapterCtx);

  useEffect(() => {
    if (!ref.current) return;
    return register(ref.current, theme);
  }, [register, theme]);

  return <div ref={ref} aria-hidden className={className} />;
}
