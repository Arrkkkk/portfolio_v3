import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * COMPONENTS §2 — mark + wordmark + ®, ~102 × 28, single colour, flips with the
 * chapter. Original mark: three angular strokes reading as an ascending "R/A".
 * (The reference's monogram is TRIONN's property and is not reproduced.)
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <svg
        width="26"
        height="22"
        viewBox="0 0 26 22"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path d="M13 1 L25 21 L19.6 21 L13 9.6 L6.4 21 L1 21 Z" fill="currentColor" />
        <path d="M6.6 14.6 L19.4 14.6 L17.2 18.2 L4.4 18.2 Z" fill="currentColor" />
      </svg>
      <span className="text-[18px] leading-none font-medium tracking-[-0.01em]">
        {site.wordmark}
        {site.registered ? (
          <sup className="ml-[2px] align-super text-[8px] tracking-normal">®</sup>
        ) : null}
      </span>
    </span>
  );
}
