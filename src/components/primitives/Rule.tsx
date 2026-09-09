import { cn } from "@/lib/utils";

/**
 * COMPONENTS §26 — a 1px hairline with a small `+` crosshair centred on it
 * (frames 048, 187).
 */
export function RuleWithCrosshair({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-px w-full bg-current/15", className)}>
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] leading-none opacity-40 select-none"
      >
        +
      </span>
    </div>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("label-mono opacity-70", className)}>{children}</p>;
}

/** The ✦-prefixed caption pinned to the bottom of pinned scenes. */
export function StarCaption({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("label-mono", className)}>
      <span aria-hidden>✦ </span>
      {children}
    </p>
  );
}
