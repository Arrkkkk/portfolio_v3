"use client";

import { useState } from "react";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
import { MonoLink } from "@/components/primitives/MonoLink";
import { RuleWithCrosshair } from "@/components/primitives/Rule";
import { testimonials, testimonialsCopy } from "@/data/testimonials";

/**
 * PAGES §08 / A11 — client list on the left, quote on the right, ←/→ controls.
 *
 * Renders nothing while `testimonials` is empty: the reference's section is
 * real social proof, and inventing quotes is out of the question (CLAUDE.md).
 */
export function ClientStories() {
  const [index, setIndex] = useState(0);
  if (!testimonials.length) return null;

  const active = testimonials[index];
  const move = (delta: number) =>
    setIndex((i) => (i + delta + testimonials.length) % testimonials.length);

  return (
    <ChapterSection
      theme="light"
      className="bg-[linear-gradient(180deg,#f7f7f7_0%,#bebebe_100%)] text-ink"
    >
      <div className="page-x py-[115px]">
        <div className="grid gap-8 lg:grid-cols-[1.06fr_1fr]">
          <BlurText
            as="h2"
            text={testimonialsCopy.heading}
            className="text-display track-display lg:pl-[139px]"
          />
          <p className="max-w-[180px] text-[14px] leading-[1.3] text-ink-mid">
            {testimonialsCopy.note}
          </p>
        </div>

        <RuleWithCrosshair className="mt-[70px]" />

        <div className="mt-[81px] grid gap-16 lg:grid-cols-[1.06fr_1fr]">
          <div className="lg:pl-[139px]">
            <ul>
              {testimonials.map((t, i) => (
                <li key={t.client} className="h-7">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`inline-flex items-center gap-2 text-[14px] uppercase tracking-[0.02em] transition-colors ${
                      i === index ? "text-ink" : "text-ink-lo hover:text-ink-mid"
                    }`}
                  >
                    {t.client}
                    {i === index ? <span aria-hidden>→</span> : null}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-[128px] flex">
              {[
                { label: "Previous testimonial", glyph: "←", delta: -1 },
                { label: "Next testimonial", glyph: "→", delta: 1 },
              ].map((b, i) => (
                <button
                  key={b.glyph}
                  type="button"
                  aria-label={b.label}
                  onClick={() => move(b.delta)}
                  className={`grid h-[68px] w-[68px] place-items-center border border-black/20 transition-colors hover:bg-black/5 ${
                    i === 1 ? "-ml-px" : ""
                  }`}
                >
                  {b.glyph}
                </button>
              ))}
            </div>
          </div>

          <div>
            <blockquote className="max-w-[640px] text-quote tracking-[-0.01em]">
              {active.quote}
            </blockquote>

            <figcaption className="mt-[110px] flex items-center gap-6">
              {active.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={active.avatar}
                  alt=""
                  className="h-[66px] w-[66px] rounded-[2px] object-cover"
                />
              ) : (
                <span className="h-[66px] w-[66px] rounded-[2px] bg-black/10" />
              )}
              <span>
                <span className="block text-[16px]">{active.author}</span>
                <span className="block text-[15px] text-ink-mid">{active.role}</span>
              </span>
            </figcaption>

            <MonoLink
              className="mt-[110px] text-ink-mid"
              label={testimonialsCopy.cta.label}
              href={testimonialsCopy.cta.href}
              width={168}
            />
          </div>
        </div>

        <RuleWithCrosshair className="mt-[110px]" />
      </div>
    </ChapterSection>
  );
}
