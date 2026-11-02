/**
 * Key facts (A08) — supplied by the owner, not placeholders.
 *
 * The order is the one given, and it happens to fall the right way round for
 * the three card treatments: the circle card is the row's centrepiece, so the
 * claim with the most in it ("AI, APPLIED") sits there rather than a count of
 * tools, and "THE TOOLKIT" lands on the dark card the technologies line was
 * already written for.
 */
export type Stat =
  | { kind: "image"; label: string; mark?: string; copy: string[]; value: string; image: string; tint: string }
  | { kind: "circle"; label: string; copy: string[]; value: string }
  | { kind: "dark"; label: string; copy: string[]; value: string; image: string; tint: string };

export const stats: Stat[] = [
  {
    kind: "image",
    /*
     * The arrow is not in JetBrains Mono as we load it — see the --font-mono
     * note in globals.css. It renders from a named monospace fallback, not
     * from the label's own face.
     */
    label: "IDEAS → REALITY",
    copy: ["Turning concepts & problems", "into things you can actually use."],
    value: "10",
    /*
     * Owner-supplied illustration, kept at its own 691:1016 aspect — not
     * cropped to the card's 330:407 — and resized down (691×1016 → 480×706)
     * and re-encoded to webp for size. KeyFacts.tsx renders it with
     * object-contain inside a box, not object-cover filling the card, so
     * nothing is cut off.
     */
    image: "/images/stats/ideas-reality.webp",
    /*
     * Sampled from the artwork itself, not matched by eye: (47, 23, 13) is
     * the single most common exact pixel value across the whole 691×1016
     * image — 153358 of 702k pixels, 21.8%, nearly 5× the runner-up and the
     * next several values are all within ±1 of it (grain noise around the
     * same flat fill). That is the card's own background, not a blend of it
     * with the artwork — a strip-average instead returned a slightly
     * different value that was visibly off and would have kept the seam.
     * Matching it exactly is what lets the image's own background and the
     * card's tint disappear into each other with no visible rectangle.
     */
    tint: "#2f170d",
  },
  {
    kind: "circle",
    label: "AI, APPLIED",
    copy: ["Exploring what happens when", "software meets intelligent systems."],
    value: "5",
  },
  {
    kind: "dark",
    label: "THE TOOLKIT",
    copy: ["Different technologies.", "One focus: building it right."],
    value: "15",
    image: "",
    tint: "#2a2a2a",
  },
];

/**
 * The note under the "Key facts" heading. PAGES §04 measures the reference's
 * as two lines inside a ~240px measure; this copy fits on one at exactly that
 * measure, so the block is a line shorter than the frame. Owner's copy — the
 * geometry around it is unchanged.
 */
export const statsNote = "Some numbers. A lot of building.";

/** Tools row (the reference's "OUR BUSINESS PARTNERS"). */
export const tools = ["Next.js", "TypeScript", "Three.js", "GSAP", "Figma"];
export const toolsLabel = "TOOLS I BUILD WITH";
