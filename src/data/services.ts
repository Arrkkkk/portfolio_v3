/** Services / expertise — ⚠️ PLACEHOLDER copy, real structure. */
export type Service = {
  title: string;
  /** Two display lines, as the reference sets them. */
  lines: [string, string];
  description: string;
  caption: string;
  capabilities: string[];
  icon: "squares" | "lines" | "arrows" | "rings" | "grid" | "dots";
};

export const services: Service[] = [
  {
    title: "AI & Intelligent Automation",
    lines: ["AI & Intelligent", "Automation"],
    description:
      "I build intelligent automation that simplifies digital workflows — systems designed to add efficiency without adding complexity.",
    caption: "INTEGRATED SEAMLESSLY INTO EXISTING PLATFORMS.",
    capabilities: [
      "AI-powered digital experiences",
      "Workflow automation",
      "Agents & virtual assistants",
      "Semantic search & recommendations",
      "AI tools for websites & web apps",
    ],
    icon: "rings",
  },
  {
    title: "Website & Mobile Design",
    lines: ["Website &", "Mobile Design"],
    description:
      "High-quality website and app experiences designed with intent and built to feel fast, considered and coherent on every screen.",
    caption: "DESIGNED TO PERFORM CONSISTENTLY ON EVERY DEVICE.",
    capabilities: [
      "High-fidelity web design",
      "Mobile app design",
      "Responsive experiences",
      "UI/UX systems",
      "Motion-first interfaces",
      "Interaction storytelling",
    ],
    icon: "squares",
  },
  {
    title: "Product Design",
    lines: ["Product", "Design"],
    description:
      "Thoughtful product design that captures attention, deepens engagement and builds lasting loyalty.",
    caption: "CLOSELY SHAPED ALONGSIDE STRATEGY AND BUSINESS GOALS.",
    capabilities: [
      "Product strategy",
      "Interface design",
      "UI architecture",
      "Design systems",
      "Prototyping & validation",
      "Motion & interaction design",
    ],
    icon: "squares",
  },
  {
    title: "Web Development",
    lines: ["Web", "Development"],
    description:
      "Custom web development delivered with a product-focused, design-conscious approach — performant, reliable and accessible.",
    caption: "ENGINEERED TO SUPPORT SCALE AND LONGEVITY.",
    capabilities: [
      "Front-end & back-end development",
      "Headless CMS integration",
      "WebGL & Canvas experiences",
      "Shader-based interactions",
      "GSAP motion systems",
      "Creative development",
    ],
    icon: "grid",
  },
  {
    title: "Interface Engineering",
    lines: ["Interface", "Engineering"],
    description:
      "Design systems and component libraries that keep large interfaces consistent, fast and pleasant to extend.",
    caption: "BUILT TO STAY CONSISTENT AS TEAMS GROW.",
    capabilities: [
      "Design system architecture",
      "Component libraries",
      "Accessibility engineering",
      "Performance budgets",
      "Documentation & tooling",
    ],
    icon: "lines",
  },
  {
    title: "Branding",
    lines: ["Branding", ""],
    description:
      "Impactful branding that positions products for success through credibility, clarity and lasting loyalty.",
    caption: "BUILT TO STAND OUT ACROSS PRODUCTS AND EXPERIENCES.",
    capabilities: [
      "Brand strategy",
      "Visual identity systems",
      "Brand guidelines",
      "Creative direction",
      "Logo design",
      "Digital brand experiences",
    ],
    icon: "dots",
  },
];

export const servicesScene = {
  label: "MY EXPERTISE",
  stack: ["A.I.", "DESIGN", "DEVELOPMENT", "BRANDING"],
  captionA: "DESIGN WITH INTENT. BUILT TO WORK.",
  captionB: "DIFFERENT DISCIPLINES. ONE STANDARD OF CRAFT.",
  link: { label: "VIEW EXPERTISE", href: "/expertise" },
};

export const expertiseHero = {
  eyebrow: "✦ WHAT I DO BEST",
  heading: "Area of expertise",
  note: ["FOCUSED DISCIPLINES, DELIVERED END TO END", "STRATEGY · DESIGN · ENGINEERING"],
  statement:
    "Focused disciplines where strategy, design, and technology work as one.",
  links: [
    { label: "VIEW MY PROJECTS", href: "/work" },
    { label: "LET'S CONNECT", href: "/contact" },
  ],
};
