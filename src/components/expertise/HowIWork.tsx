import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
import { SectionLabel } from "@/components/primitives/Rule";
import { process } from "@/data/process";

/** PAGES §16 — three process columns on the grey chapter (frame 320). */
export function HowIWork() {
  return (
    <ChapterSection theme="light" className="bg-grey-2 text-ink">
      <div className="page-x py-[141px]">
        <div className="grid gap-10 lg:grid-cols-[275px_1fr] lg:gap-x-0">
          <SectionLabel className="lg:pt-2">{process.label}</SectionLabel>

          <div>
            <BlurText
              as="h2"
              text={process.heading}
              className="text-display track-display"
            />
            <p className="mt-6 max-w-[200px] text-[14px] leading-[1.3] text-ink-mid">
              {process.note.map((n) => (
                <span key={n} className="block">
                  {n}
                </span>
              ))}
            </p>

            <ol className="mt-[85px] grid gap-12 md:grid-cols-3">
              {process.steps.map((s) => (
                <li key={s.step}>
                  <p className="label-mono text-ink-lo">{s.step}</p>
                  <h3 className="mt-[43px] text-title-sm tracking-[-0.01em]">{s.title}</h3>
                  <p className="mt-[26px] max-w-[305px] text-[14px] leading-[1.3] text-ink-mid">
                    {s.copy}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </ChapterSection>
  );
}
