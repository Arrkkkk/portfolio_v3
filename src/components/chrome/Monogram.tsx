"use client";

import { MONOGRAM_CONTOURS } from "@/components/three/monogramContours";

/**
 * The RA monogram — an "R" interlocked with a triangular "A".
 *
 * Geometry is the artwork's own: the same auto-traced contours the 3D hero
 * mark extrudes (see scripts/trace-monogram.py), so the flat mark and the
 * hero mark are guaranteed to be the identical shape. The mark is three
 * disjoint pieces — the interlace breaks separate them — so it renders as
 * three filled paths with no masking, weaving or redrawing.
 *
 * Contours are Y-up (Three.js orientation) and centred on the mark's bounding
 * box, normalised so the larger dimension is 1; SVG is Y-down, hence the flip.
 */

const PATHS = MONOGRAM_CONTOURS.map(
  (contour) =>
    contour.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${-y}`).join("") + "Z",
);

export function Monogram({
  className,
  animated = false,
}: {
  className?: string;
  /** Tags each piece for the preloader's staggered assembly (A01). */
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="-0.52 -0.45 1.04 0.9"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      {PATHS.map((d, i) => (
        <path key={i} d={d} className={animated ? "mono-piece" : undefined} />
      ))}
    </svg>
  );
}
