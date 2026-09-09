/**
 * DESIGN-SYSTEM §5 — 24 × 24, 1px stroke, geometric line art. Original marks in
 * the reference's idiom (concentric squares, line stacks, arrows, rings).
 */
export function ServiceIcon({
  name,
  className,
}: {
  name: "squares" | "lines" | "arrows" | "rings" | "grid" | "dots";
  className?: string;
}) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    className,
    "aria-hidden": true,
  } as const;

  switch (name) {
    case "squares":
      return (
        <svg {...common}>
          <rect x="1" y="1" width="22" height="22" />
          <rect x="5" y="5" width="14" height="14" />
          <rect x="9" y="9" width="6" height="6" />
          <rect x="11.5" y="11.5" width="1" height="1" />
        </svg>
      );
    case "lines":
      return (
        <svg {...common}>
          {[3, 6, 9, 12, 15, 18, 21].map((y, i) => (
            <line key={y} x1={2 + i} y1={y} x2={22 - i} y2={y} />
          ))}
        </svg>
      );
    case "arrows":
      return (
        <svg {...common}>
          <path d="M2 2 L9 9 M22 2 L15 9 M2 22 L9 15 M22 22 L15 15" />
        </svg>
      );
    case "rings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="11" />
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <path d="M1 1h22v22H1z" />
          <path d="M8.3 1v22M15.6 1v22M1 8.3h22M1 15.6h22" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          {[4, 12, 20].map((y) =>
            [4, 12, 20].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" />),
          )}
        </svg>
      );
  }
}
