"use client";

import { supportsWebGL } from "@/lib/utils";
import { useClientFlag } from "@/hooks/useClientFlag";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

let cached: boolean | null = null;
const hasWebGL = () => (cached ??= supportsWebGL());

/**
 * RESPONSIVE.md — WebGL renders only on a desktop viewport with WebGL support
 * and no reduced-motion preference. Otherwise the caller shows a static poster
 * so the composition and rhythm survive.
 */
export function useSceneEnabled() {
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  const gl = useClientFlag(hasWebGL);
  return desktop && gl && !reduced;
}
