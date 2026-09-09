"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const labelFor = (path: string) => {
  const seg = path.split("/").filter(Boolean)[0];
  return (seg ?? "home").replace(/-/g, " ").toUpperCase();
};

/**
 * COMPONENTS §7 / A15 — a flat grey overlay carrying the destination name in
 * mono caps plus two faint `+` crosshairs (frames 265–268, ~1.5s). Shares its
 * surface with the preloader.
 *
 * Note: the App Router commits navigation before this can cover the outgoing
 * page, so the overlay plays over the *incoming* route. Visually the sequence
 * matches the reference; the cover phase is marginally later.
 */
export function PageTransition() {
  const pathname = usePathname();
  const first = useRef(true);
  const [showing, setShowing] = useState<string | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setShowing(labelFor(pathname));
    const t = setTimeout(() => setShowing(null), 900);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence>
      {showing ? (
        <motion.div
          key={showing}
          className="pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-grey"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          aria-hidden
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]">
            {showing}
          </p>
          <span className="absolute left-[42%] top-1/2 -translate-y-[110px] text-[12px] opacity-30">+</span>
          <span className="absolute left-[58%] top-1/2 -translate-y-[110px] text-[12px] opacity-30">+</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
