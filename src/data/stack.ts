/** Technology stack accordion (A17) — ⚠️ PLACEHOLDER, replace with your real stack. */
export type StackGroup = {
  title: string;
  columns: { label: string; items: string[] }[];
};

export const stackIntro = {
  note: "BUILT WITH PERFORMANCE-FIRST, SCALABLE AND MODERN ARCHITECTURE.",
  headingA: "TECHNOLOGY",
  headingB: "STACK",
};

export const stack: StackGroup[] = [
  {
    title: "AI & Intelligent Automation",
    columns: [
      { label: "AI PLATFORMS & APIS", items: ["Anthropic Claude API", "OpenAI API", "Vercel AI SDK"] },
      {
        label: "AI CAPABILITIES",
        items: [
          "AI-powered chatbots & assistants",
          "Content generation",
          "AI-driven search & recommendations",
          "Workflow automation",
          "AI integrations for web apps",
        ],
      },
    ],
  },
  {
    title: "Front-end",
    columns: [
      { label: "FRAMEWORKS", items: ["Next.js", "React", "TypeScript"] },
      { label: "CRAFT", items: ["Tailwind CSS", "GSAP / ScrollTrigger", "Three.js / R3F", "Lenis"] },
    ],
  },
  {
    title: "Back-end",
    columns: [
      { label: "RUNTIME", items: ["Node.js", "Edge functions"] },
      { label: "APIS", items: ["REST", "tRPC", "GraphQL"] },
    ],
  },
  {
    title: "Databases & Content Management",
    columns: [
      { label: "DATA", items: ["Postgres", "Prisma", "Redis"] },
      { label: "CONTENT", items: ["Sanity", "Headless CMS integrations"] },
    ],
  },
  {
    title: "Cloud Services",
    columns: [
      { label: "HOSTING", items: ["Vercel", "AWS", "Cloudflare"] },
      { label: "STORAGE", items: ["S3", "R2", "Blob storage"] },
    ],
  },
  {
    title: "DevOps & Infrastructure",
    columns: [
      { label: "PIPELINES", items: ["GitHub Actions", "Preview deployments"] },
      { label: "OBSERVABILITY", items: ["Sentry", "Analytics", "Performance budgets"] },
    ],
  },
  {
    title: "Marketing, Email & Integrations",
    columns: [
      { label: "EMAIL", items: ["Resend", "Transactional templates"] },
      { label: "INTEGRATIONS", items: ["Stripe", "Calendly", "Webhooks"] },
    ],
  },
];
