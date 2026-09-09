import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
import { WordReveal } from "@/components/primitives/WordReveal";
import { MonoLink } from "@/components/primitives/MonoLink";
import { expertiseHero } from "@/data/services";

/** PAGES §11–12 — the expertise hero and the focused-disciplines statement. */
export function ExpertiseHero() {
  return (
    <ChapterSection theme="dark" className="bg-dark text-text-hi">
      <div className="flex min-h-svh flex-col items-center justify-center page-x text-center">
        <p className="label-mono text-text-mid">{expertiseHero.eyebrow}</p>
        <BlurText
          as="h1"
          text={expertiseHero.heading}
          immediate
          className="mt-8 text-[clamp(32px,2.8vw,48px)] leading-[1.1] track-display"
        />
        <p className="mt-8 label-mono text-text-lo">
          {expertiseHero.note.map((n) => (
            <span key={n} className="block">
              {n}
            </span>
          ))}
        </p>
      </div>

      <div className="flex min-h-[90svh] flex-col items-center justify-center page-x text-center">
        <WordReveal
          as="h2"
          text={expertiseHero.statement}
          className="max-w-[900px] text-[clamp(28px,2.6vw,44px)] leading-[1.2] track-display"
        />
        <div className="mt-12 flex flex-wrap justify-center gap-12">
          {expertiseHero.links.map((l) => (
            <MonoLink
              key={l.label}
              label={l.label}
              href={l.href}
              width={190}
              className="text-text-mid"
            />
          ))}
        </div>
      </div>
    </ChapterSection>
  );
}
