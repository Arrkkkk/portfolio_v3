import { Monogram } from "./Monogram";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * COMPONENTS §2 — mark + wordmark + ®, ~102 × 28, single colour, flips with the
 * chapter. The mark is the RA monogram, sharing its traced geometry with the
 * preloader and the 3D hero mark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <Monogram className="h-[26px] w-[30px] shrink-0" />
      <span className="text-[18px] leading-none font-medium tracking-[-0.01em]">
        {site.wordmark}
        {site.registered ? (
          <sup className="ml-[2px] align-super text-[8px] tracking-normal">®</sup>
        ) : null}
      </span>
    </span>
  );
}
