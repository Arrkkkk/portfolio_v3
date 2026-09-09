import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { ExpertiseHero } from "@/components/expertise/ExpertiseHero";
import { ServiceRow } from "@/components/expertise/ServiceRow";
import { TechStack } from "@/components/expertise/TechStack";
import { HowIWork } from "@/components/expertise/HowIWork";
import { Marquee } from "@/components/home/Marquee";
import { FooterCta } from "@/components/home/FooterCta";
import { StarCaption } from "@/components/primitives/Rule";
import { services } from "@/data/services";
import { site } from "@/data/site";

export const metadata = { title: `Expertise — ${site.name}` };

/** Expertise (the reference's /services) — chapter order per analysis/PAGES.md. */
export default function ExpertisePage() {
  return (
    <>
      <ExpertiseHero />

      <ChapterSection theme="dark" className="overflow-hidden bg-dark text-text-hi">
        <div className="flex min-h-[60svh] flex-col justify-center gap-16 py-[100px]">
          <Marquee words={site.marquee.expertise} />
          <StarCaption className="text-center text-text-mid">
            DIFFERENT DISCIPLINES. ONE STANDARD OF CRAFT.
          </StarCaption>
        </div>
      </ChapterSection>

      <ChapterSection theme="light" className="bg-white text-ink">
        <div className="page-x">
          {services.map((service) => (
            <ServiceRow key={service.title} service={service} />
          ))}
        </div>
      </ChapterSection>

      <TechStack />
      <HowIWork />
      <FooterCta />
    </>
  );
}
