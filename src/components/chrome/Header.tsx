"use client";

import Link from "next/link";
import { useChapter } from "./ChapterTheme";
import { Logo } from "./Logo";
import { PillButton } from "./PillButton";
import { AudioToggle } from "./AudioToggle";
import { useMenu } from "./MenuContext";
import { cn } from "@/lib/utils";

/**
 * COMPONENTS §1 — fixed, always visible (present in all 327 frames), never
 * hides or shrinks. Controls band sits y 32 → 60 with 32px page padding, and the
 * whole lockup inverts with the chapter behind it (A06).
 */
export function Header() {
  const chapter = useChapter();
  const { open, toggle } = useMenu();
  const dark = chapter === "dark";

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-60 page-x pt-8 transition-colors duration-300",
        dark ? "text-white" : "text-[#111111]",
      )}
    >
      <div className="pointer-events-auto flex h-7 items-center justify-between">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <AudioToggle dark={dark} />
          <PillButton label="Let's talk" href="/contact" variant="filled" dark={dark} />
          <PillButton
            label={open ? "Close" : "Menu"}
            onClick={toggle}
            variant="outline"
            dark={dark}
            ariaExpanded={open}
            icon={
              <span aria-hidden className="text-[13px] leading-none">
                {open ? "✕" : "≡"}
              </span>
            }
          />
        </div>
      </div>
    </header>
  );
}
