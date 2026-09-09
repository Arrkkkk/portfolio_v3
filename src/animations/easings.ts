/** Motion tokens — analysis/DESIGN-SYSTEM.md §6. */
export const EASE = {
  out: "expo.out", // --e-out  cubic-bezier(.16,1,.3,1)
  inOut: "power4.inOut", // --e-inout
  none: "none",
} as const;

export const DUR = {
  fast: 0.3,
  base: 0.6,
  slow: 1.0,
  xslow: 1.5,
} as const;

export const STAGGER = 0.04;
