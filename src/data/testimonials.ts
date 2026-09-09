/**
 * Client stories (A11).
 *
 * ⚠️ EMPTY BY DESIGN. Never invent testimonials — the section renders nothing
 * until real, attributable quotes are added here (see CLAUDE.md).
 */
export type Testimonial = {
  client: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
};

export const testimonials: Testimonial[] = [];

export const testimonialsCopy = {
  heading: "Client stories",
  note: "Great work is built through partnership. Here's what collaborators say.",
  cta: { label: "WORK WITH ME", href: "/contact" },
};
