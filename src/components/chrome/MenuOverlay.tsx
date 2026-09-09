"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMenu } from "./MenuContext";
import { site } from "@/data/site";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * COMPONENTS §5 / A14 — a 368 × 928 white panel inset 12px from the right,
 * sliding in from x:100%. Nav links reveal with a *per-character* stagger
 * (frame 259 catches "Contact" rendered as "Co").
 */
export function MenuOverlay() {
  const { open, close } = useMenu();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.nav
            className="fixed right-3 top-3 bottom-3 z-50 flex w-[368px] max-w-[calc(100vw-24px)] flex-col justify-between rounded-[6px] bg-white px-[29px] pt-[258px] pb-8 text-[#0b0b0b]"
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            transition={{ duration: 1, ease: EASE_OUT }}
          >
            <div>
              <ul>
                {site.nav.map((item, i) => (
                  <li key={item.href} className="text-title-lg tracking-[-0.01em]">
                    <Link href={item.href} onClick={close} className="inline-block">
                      {Array.from(item.label).map((ch, c) => (
                        <motion.span
                          key={`${ch}-${c}`}
                          className="inline-block"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.3 + i * 0.08 + c * 0.03,
                            duration: 0.4,
                            ease: EASE_OUT,
                          }}
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </Link>
                  </li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4, ease: EASE_OUT }}
                className="mt-8"
              >
                <Link
                  href={site.navPill.href}
                  onClick={close}
                  className="inline-flex h-8 items-center rounded-full border border-black/30 px-4 text-[12px] uppercase tracking-[0.04em]"
                >
                  {site.navPill.label}
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4, ease: EASE_OUT }}
              className="space-y-8"
            >
              <div>
                <p className="label-mono text-[#8a8a8a]">Business enquiry</p>
                <p className="mt-3 text-[15px]">
                  <span className="text-[#8a8a8a]">E.</span>{" "}
                  <a href={`mailto:${site.footer.email}`}>{site.footer.email}</a>
                </p>
                {site.footer.phone ? (
                  <p className="mt-1 text-[15px]">
                    <span className="text-[#8a8a8a]">P.</span> {site.footer.phone}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="label-mono text-[#8a8a8a]">Social</p>
                <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-[15px]">
                  {site.footer.social.map((s) => (
                    <li key={s.label}>
                      <a href={s.href}>{s.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.nav>
        </>
      ) : null}
    </AnimatePresence>
  );
}
