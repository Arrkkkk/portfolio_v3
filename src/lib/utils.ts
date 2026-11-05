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
 * Design In Motion's pinned curved-gallery scene used to end the instant
 * the gallery finished flattening into its grid — the section's own pin
 * released at the same progress (1.0) the grid finished arriving at, so
 * there was zero scroll left to actually look at the settled grid before
 * the page moved on. DIM_SVH_TOTAL grew (350 -> 450svh) to hold a full
 * extra viewport-height of pure scroll after the grid settles — owner's
 * request ("no room to see them properly before they start scrolling").
 *
 * DIM_GALLERY_SCALE is how much every one of CurvedGallery's own progress
 * thresholds (sweep end, flatten start/span) has to shrink to still
 * complete at the same absolute scroll distance as before the section
 * grew — same technique, same reasoning as SERVICES_P1_P4_SCALE above:
 * the section got taller, the sequence inside it didn't get any longer on
 * its own, so every fraction-of-the-whole it's written against has to
 * shrink together, or the sequence itself would just slow down instead of
 * gaining a hold at the end. (100 subtracted on both sides of the ratio
 * because the pinned section's scrollable RANGE is its own height minus
 * one viewport — the viewport itself isn't scroll distance, it's the
 * sticky stage — so that's the figure the sequence's fractions are
 * actually paced against.)
 *
 * The curved gallery's tiles sweep across the scene, then flatten into a
 * static 2-row grid over its final stretch — see CurvedGallery.tsx's own
 * `flatten` value. The Design In Motion headline (and its bottom caption
 * row) sit underneath that grid in document flow, and once the grid is
 * fully flattened it's large enough to cover both outright, which read as
 * broken rather than intentional (owner's call, after seeing it). Fading
 * them out over that same final stretch — scrubbed to the same scroll
 * progress driving the gallery, not a separately-tuned fade window —
 * turns "the grid covers the title" into "the title recedes as the grid
 * arrives." DesignInMotion.tsx (the fade) and CurvedGallery.tsx (the
 * flatten) both read these so they can't drift apart.
 */
export const DIM_SVH_ORIGINAL = 350;
export const DIM_SVH_TOTAL = 450;
export const DIM_GALLERY_SCALE = (DIM_SVH_ORIGINAL - 100) / (DIM_SVH_TOTAL - 100);

export const DIM_GALLERY_SWEEP_END = 0.78 * DIM_GALLERY_SCALE;
export const DIM_GALLERY_FLATTEN_START = 0.72 * DIM_GALLERY_SCALE;
export const DIM_GALLERY_FLATTEN_SPAN = 0.28 * DIM_GALLERY_SCALE;

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
