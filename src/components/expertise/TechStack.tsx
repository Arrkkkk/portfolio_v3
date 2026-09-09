"use client";

import { useState } from "react";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
import { stack, stackIntro } from "@/data/stack";

/** PAGES §15 / A17 — 96px accordion rows: index · title · ↓, hairline beneath. */
export function TechStack() {
  const [open, setOpen] = useState(0);

  return (
    <ChapterSection theme="light" className="bg-white text-ink">
      <div className="page-x py-[120px]">
        <p className="label-mono text-center text-ink-lo">{stackIntro.note}</p>

        <div className="mt-16 flex flex-col items-center gap-2 md:flex-row md:justify-between">
          <BlurText
            as="h2"
            text={stackIntro.headingA}
            className="text-[clamp(34px,3.7vw,64px)] leading-none uppercase tracking-[-0.02em]"
          />
          <BlurText
            as="h2"
            text={stackIntro.headingB}
            className="text-[clamp(34px,3.7vw,64px)] leading-none uppercase tracking-[-0.02em]"
          />
        </div>

        <ul className="mt-24">
          {stack.map((group, i) => {
            const expanded = open === i;
            return (
              <li key={group.title} className="border-b border-black/12">
                <h3>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? -1 : i)}
                    className="group flex h-24 w-full items-center gap-8 text-left md:gap-0"
                  >
                    <span className="w-[551px] shrink-0 text-title-md tracking-[-0.01em] max-md:w-10">
                      {i + 1}.
                    </span>
                    <span className="flex-1 text-title-md tracking-[-0.01em]">
                      {group.title}
                    </span>
                    <span
                      aria-hidden
                      className={`shrink-0 text-[14px] transition-transform duration-300 ${
                        expanded ? "rotate-180" : "group-hover:translate-y-1"
                      }`}
                    >
                      ↓
                    </span>
                  </button>
                </h3>

                <div
                  className={`grid overflow-hidden transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0">
                    <div className="grid gap-10 pb-12 md:grid-cols-2 md:pl-[551px]">
                      {group.columns.map((col) => (
                        <div key={col.label}>
                          <p className="label-mono text-ink-lo">{col.label}</p>
                          <ul className="mt-4 space-y-[6px] text-[14px] text-ink-mid">
                            {col.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </ChapterSection>
  );
}
