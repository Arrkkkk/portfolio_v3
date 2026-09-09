"use client";

import { useId } from "react";

/**
 * The RA monogram — an "R" interlocked with a triangular "A", drawn in the
 * grooved-outline style of the supplied artwork: each letterform is a thick
 * stroke with a thin light channel running through it, and the two letters
 * weave over and under one another where they cross.
 *
 * Built from two skeleton paths rather than traced outlines, so the groove and
 * the weave are derived rather than hand-drawn:
 *   • white at `STROKE`  → the letterform body
 *   • black at `GROOVE`  → the channel through it
 *   • black at `CLEAR`   → the gap where the *other* letter passes over
 * The clip rects decide which letter wins each crossing.
 */

// Λ plus the crossbar that juts out past the left leg. The legs run past
// y=200 so the frame clip gives them flat feet.
const A_PATH = "M12.1 212 L120 26 L227.9 212 M6.4 157 L148.7 157";

// Stem, bowl, leg. The bowl reaches just far enough right to cross the A's
// right leg; the stem and leg run past y=200 for the same flat cut.
const R_PATH =
  "M90 212 L90 66 L118 66 C140 66 147 77 147 95 C147 113 140 124 118 124 L90 124 M110 124 L146 205";

const STROKE = 22;
const GROOVE = 6;
const CLEAR = 36; // STROKE + 7px separation on each side

export function Monogram({
  className,
  animated = false,
}: {
  className?: string;
  /** Adds the draw-on class the preloader timeline animates (A01). */
  animated?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const draw = animated ? "mono-draw" : undefined;

  const common = {
    fill: "none",
    strokeLinecap: "butt",
    strokeLinejoin: "miter",
    strokeMiterlimit: 10,
  } as const;

  return (
    <svg viewBox="0 0 240 200" className={className} fill="none" aria-hidden>
      <defs>
        <clipPath id={`${uid}-frame`}>
          <rect width="240" height="200" />
        </clipPath>

        {/* Where R passes over A: the stem crossing the left leg. Bounded at
            x=122 so it never reaches the A's right leg. */}
        <clipPath id={`${uid}-over-r`}>
          <rect x="60" y="44" width="62" height="86" />
        </clipPath>

        {/* Where A passes over R: the right leg across the bowl (x≥130 keeps
            the left leg out of it), and the crossbar across stem and leg. */}
        <clipPath id={`${uid}-over-a`}>
          <rect x="130" y="46" width="85" height="94" />
          <rect x="0" y="132" width="175" height="48" />
        </clipPath>

        <mask id={`${uid}-a`}>
          <path d={A_PATH} className={draw} stroke="#fff" strokeWidth={STROKE} pathLength={1000} {...common} />
          <path d={A_PATH} stroke="#000" strokeWidth={GROOVE} {...common} />
          <g clipPath={`url(#${uid}-over-r)`}>
            <path d={R_PATH} stroke="#000" strokeWidth={CLEAR} {...common} />
          </g>
        </mask>

        <mask id={`${uid}-r`}>
          <path d={R_PATH} className={draw} stroke="#fff" strokeWidth={STROKE} pathLength={1000} {...common} />
          <path d={R_PATH} stroke="#000" strokeWidth={GROOVE} {...common} />
          <g clipPath={`url(#${uid}-over-a)`}>
            <path d={A_PATH} stroke="#000" strokeWidth={CLEAR} {...common} />
          </g>
        </mask>
      </defs>

      <g clipPath={`url(#${uid}-frame)`} fill="currentColor">
        <rect width="240" height="200" mask={`url(#${uid}-a)`} />
        <rect width="240" height="200" mask={`url(#${uid}-r)`} />
      </g>
    </svg>
  );
}
