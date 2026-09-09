"use client";
import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

/** The reference's interactive layer is desktop + fine-pointer only. */
export const useFinePointer = () =>
  useMediaQuery("(hover: hover) and (pointer: fine)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
