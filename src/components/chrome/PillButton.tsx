import Link from "next/link";
import { cn } from "@/lib/utils";

const base =
  "inline-flex h-7 items-center gap-2 rounded-full px-4 text-[13px] uppercase leading-none tracking-[0.02em] transition-colors duration-300";

/**
 * COMPONENTS §3 — 28px tall, radius 999.
 * `filled` inverts against the chapter; `outline` is a 1px border in the
 * chapter's foreground colour.
 */
export function PillButton({
  label,
  href,
  onClick,
  variant = "filled",
  dark = true,
  icon,
  className,
  ariaExpanded,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "filled" | "outline";
  /** True when the chapter behind the header is dark. */
  dark?: boolean;
  icon?: React.ReactNode;
  className?: string;
  ariaExpanded?: boolean;
}) {
  const styles = cn(
    base,
    variant === "filled"
      ? dark
        ? "bg-white text-[#0e0e0e] hover:bg-white/85"
        : "bg-[#111111] text-white hover:bg-black"
      : dark
        ? "border border-white/70 text-white hover:bg-white hover:text-[#0e0e0e]"
        : "border border-black/60 text-[#111111] hover:bg-[#111111] hover:text-white",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        <span>{label}</span>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-expanded={ariaExpanded} className={styles}>
      <span>{label}</span>
      {icon}
    </button>
  );
}
