/** Key facts (A08) — ⚠️ PLACEHOLDER numbers. Replace with real, verifiable figures. */
export type Stat =
  | { kind: "image"; label: string; mark?: string; copy: string[]; value: string; image: string; tint: string }
  | { kind: "circle"; label: string; copy: string[]; value: string }
  | { kind: "dark"; label: string; copy: string[]; value: string; image: string; tint: string };

export const stats: Stat[] = [
  {
    kind: "image",
    label: "SHIPPED & SHOWCASED",
    mark: "W.",
    copy: ["TODO — a line about", "where the work has landed."],
    value: "20",
    image: "",
    tint: "#6b3a2c",
  },
  {
    kind: "circle",
    label: "PROJECTS COMPLETED",
    copy: ["TODO — a line about", "repeat collaborations."],
    value: "40",
  },
  {
    kind: "dark",
    label: "TECHNOLOGIES USED",
    copy: ["Different tools.", "One standard."],
    value: "15",
    image: "",
    tint: "#2a2a2a",
  },
];

/** Tools row (the reference's "OUR BUSINESS PARTNERS"). */
export const tools = ["Next.js", "TypeScript", "Three.js", "GSAP", "Figma"];
export const toolsLabel = "TOOLS I BUILD WITH";
