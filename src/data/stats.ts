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
    image: "",
    tint: "#6b3a2c",
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

/** Tools row (the reference's "OUR BUSINESS PARTNERS"). */
export const tools = ["Next.js", "TypeScript", "Three.js", "GSAP", "Figma"];
export const toolsLabel = "TOOLS I BUILD WITH";
