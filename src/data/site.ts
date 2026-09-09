/**
 * Site-level identity and copy.
 *
 * ⚠️ PLACEHOLDER CONTENT — see CLAUDE.md § "Content status".
 * The name and email come from this repository's git config; everything marked
 * TODO is invented scaffolding and must be replaced before the site ships.
 */
export const site = {
  name: "Rajit Agrawal",
  /** Short wordmark used in the header lockup and the footer line-wordmark. */
  wordmark: "RAJIT",
  monogram: "RA",
  registered: true,

  /** Preloader caption — the reference used "INSPIRE · INNOVATE · IMPACT". */
  preloaderWords: ["DESIGN", "BUILD", "SHIP"], // TODO confirm

  hero: {
    /** Static prefix + the words that cycle (A03). */
    prefix: "Designed to",
    cycle: ["mean something.", "feel effortless.", "ship fast."], // TODO confirm
    badge: { left: "EST. 2021", right: "5+ YEARS BUILDING FOR THE WEB." }, // TODO confirm
    blurb:
      "Interfaces, products and systems built for clarity, scale and impact.", // TODO confirm
    captions: ["HOLD TO 💥 BLAST", "DARE ⚡ TO TOUCH THE LINES."],
  },

  about: {
    label: "ABOUT",
    statement:
      "Rajit is an independent product engineer crafting considered digital experiences through design, engineering, and motion.", // TODO confirm
    note: ["I DESIGN FOR LONGEVITY", "CLARITY FIRST, CRAFT ALWAYS,", "BUILT TO SCALE."],
    mission:
      "My aim is to make software feel human — building products that are intuitive, purposeful and meaningful to the people who use them.", // TODO confirm
    link: { label: "MORE ABOUT ME", href: "/about" },
  },

  marquee: {
    home: ["IMPACT", "INSPIRE", "INNOVATE"], // TODO confirm
    expertise: ["BRANDING", "A.I.", "DESIGN", "DEVELOPMENT"],
    labelHome: ["FOCUSED VISION.", "MEASURED EXECUTION."],
    captionHome: "FROM IDEA TO OUTCOME.",
  },

  collection: {
    copy: "Discover the complete collection of products, interfaces and experiments.",
    link: { label: "VIEW ALL PROJECTS", href: "/work" },
  },

  motion: {
    headingA: "DESIGN IN",
    headingB: "MOTION",
    note: ["EXPLORING IDEAS THROUGH", "A DAILY DESIGN PRACTICE"],
    copy: "Concepts, explorations and interface experiments shared openly as part of my creative process.",
    link: { label: "VIEW ON DRIBBBLE", href: "#" }, // TODO real link
  },

  footer: {
    label: "LET'S BUILD WORK THAT INSPIRES.",
    heading: ["Ready to build", "something bold?"],
    links: [
      { label: "DISCUSS YOUR PROJECT", href: "/contact" },
      { label: "BOOK A 30-MINUTE CALL", href: "#" }, // TODO real link
    ],
    email: "rajitagrawal2005@gmail.com",
    phone: "", // TODO or leave empty to hide the row
    social: [
      { label: "Linkedin", href: "#" }, // TODO
      { label: "Github", href: "#" }, // TODO
      { label: "Dribbble", href: "#" }, // TODO
      { label: "Instagram", href: "#" }, // TODO
    ],
    timezone: "IST",
    soundNote: "SOUND ON ♪ HOVER THE LINES.",
  },

  nav: [
    { label: "Work", href: "/work" },
    { label: "Expertise", href: "/expertise" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  navPill: { label: "✦ THE STORY BEHIND THE NAME", href: "/about" }, // TODO confirm
} as const;
