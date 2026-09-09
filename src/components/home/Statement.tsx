import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { WordReveal } from "@/components/primitives/WordReveal";
import { MonoLink } from "@/components/primitives/MonoLink";
import { RuleWithCrosshair, SectionLabel } from "@/components/primitives/Rule";
import { site } from "@/data/site";

/** PAGES §02 — the about statement. Geometry anchored to frame 048. */
export function Statement() {
  return (
    <ChapterSection
      id="about"
      theme="dark"
      className="relative bg-dark text-text-hi"
    >
      <div className="page-x pt-[166px] pb-[200px]">
        <div className="relative">
          <SectionLabel className="absolute left-0 top-[7px] hidden lg:block">
            {site.about.label}
          </SectionLabel>

          <WordReveal
            as="h2"
            text={site.about.statement}
            className="text-display track-display lg:pl-[139px]"
          />
        </div>

        <RuleWithCrosshair className="mt-[80px]" />

        <div className="mt-[76px] grid gap-12 lg:grid-cols-[1.83fr_1fr] lg:pl-[139px]">
          <div className="label-mono text-text-mid">
            {site.about.note.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="lg:justify-self-start">
            <p className="measure text-[16px] leading-[1.35] text-text-hi">
              {site.about.mission}
            </p>
            <MonoLink
              className="mt-[76px] text-text-mid"
              label={site.about.link.label}
              href={site.about.link.href}
              width={168}
            />
          </div>
        </div>
      </div>
    </ChapterSection>
  );
}
