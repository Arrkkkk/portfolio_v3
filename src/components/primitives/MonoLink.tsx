"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * COMPONENTS §10 — uppercase mono label + trailing arrow + a 1px underline that
 * spans the whole component. Hover pushes the arrow right (the reference's only
 * link affordance).
 */
export function MonoLink({
  label,
  href,
  className,
  width,
  arrow = "→",
}: {
  label: string;
  href: string;
  className?: string;
  /** Fixed track width; the reference uses ~168–210px. */
  width?: number;
  arrow?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-end justify-between gap-6 border-b border-current/30 pb-[10px] link-mono",
        "transition-colors duration-300 hover:border-current",
        className,
      )}
      style={width ? { width } : undefined}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className="translate-x-0 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1.5"
      >
        {arrow}
      </span>
    </Link>
  );
}
