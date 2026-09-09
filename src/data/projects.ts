/**
 * Selected work (A09 horizontal track) — ⚠️ PLACEHOLDER CONTENT.
 * Replace every entry with real projects and real images before shipping.
 * Image ratio must stay 714 × 488 (≈3:2) — see analysis/DESIGN-SYSTEM.md.
 */
export type Project = {
  slug: string;
  title: string;
  description: string;
  image: string;
  /** Fallback tint used until a real image exists. */
  tint: string;
};

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    description: "TODO — one sentence on what this product does and for whom.",
    image: "",
    tint: "#c96a3f",
  },
  {
    slug: "project-two",
    title: "Project Two",
    description: "TODO — one sentence on what this product does and for whom.",
    image: "",
    tint: "#1d1d1f",
  },
  {
    slug: "project-three",
    title: "Project Three",
    description: "TODO — one sentence on what this product does and for whom.",
    image: "",
    tint: "#8d8578",
  },
  {
    slug: "project-four",
    title: "Project Four",
    description: "TODO — one sentence on what this product does and for whom.",
    image: "",
    tint: "#3f4a5c",
  },
];
