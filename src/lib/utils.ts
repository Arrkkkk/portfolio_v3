export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/*
 * ServicesScene's pinned section used to be flat 400svh, split evenly:
 * P1-P4 (type stack / luminance flip / scatter / monolith settle) in the
 * first half, P5 (service-label cards) in the second. P5 needed far more
 * scroll distance to feel scroll-driven rather than snapping through in a
 * few px, so the section grew to SERVICES_SVH_TOTAL — P1-P4 originally kept
 * its exact original absolute scroll distance (200svh) rather than also
 * stretching, but that just preserved how fast it already was: the scatter
 * (P3) in particular cleared in a single normal scroll, let alone a flick.
 * SERVICES_SVH_P1_P4 bumped 200 -> 320 (+60%) to give the whole P1-P4
 * sequence more room, same technique as P5's own fix, so the relative
 * rhythm between its sub-phases (stack settle, luminance flip, scatter,
 * monolith settle) is unchanged — just slower, together.
 *
 * SERVICES_P1_P4_SCALE is how much every P1-P4 keyframe fraction (written
 * against the old 400svh / 0.5 split) must be multiplied by to land on the
 * same absolute svh in the new, taller section. Both ServicesScene.tsx
 * (the GSAP keyframe positions) and MonolithScene.tsx (the monolith's own
 * settle-progress thresholds, which read the same 0-1 `progress`) depend
 * on this scale — defined once here so they can't drift apart.
 */
export const SERVICES_SVH_P1_P4 = 320;
export const SERVICES_SVH_TOTAL = 1395;
export const SERVICES_P1_P4_SCALE = SERVICES_SVH_P1_P4 / SERVICES_SVH_TOTAL / 0.5;

/*
 * The curved gallery's tiles sweep across the pinned scene, then flatten
 * into a static 2-row grid over the scene's final stretch — see
 * CurvedGallery.tsx's own `flatten` value. The Design In Motion headline
 * sits underneath that grid in document flow, and once the grid is fully
 * flattened it's large enough to cover the headline entirely, which read
 * as broken rather than intentional (owner's call, after seeing it). The
 * fix fades the headline out over that same final stretch, scrubbed to the
 * same scroll progress driving the gallery — not a separately-tuned fade
 * window, because "linked to the scrolling" means it has to track the
 * grid's own arrival exactly, not just happen to look similar. Both
 * DesignInMotion.tsx (the headline fade) and CurvedGallery.tsx (the grid
 * flatten) read these so they can't drift apart.
 */
export const DIM_GALLERY_FLATTEN_START = 0.72;
export const DIM_GALLERY_FLATTEN_SPAN = 0.28;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/** Deterministic pseudo-random in [0,1) — keeps SSR and client markup identical. */
export const seeded = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const supportsWebGL = () => {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

/** Local time in a named IANA zone, formatted as the footer clock (HH:MM). */
export const timeIn = (timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date());
