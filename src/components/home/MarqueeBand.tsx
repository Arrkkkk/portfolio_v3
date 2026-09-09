import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { StarCaption } from "@/components/primitives/Rule";
import { Marquee } from "./Marquee";
import { site } from "@/data/site";

/** PAGES §03 — the dark marquee chapter. Geometry anchored to frame 070. */
export function MarqueeBand() {
  return (
    <ChapterSection theme="dark" className="relative overflow-hidden bg-dark text-text-hi">
      <div className="flex min-h-[70svh] flex-col justify-between py-[125px]">
        <div className="page-x label-mono text-text-mid lg:pl-[139px]">
          {site.marquee.labelHome.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>

        <Marquee words={site.marquee.home} className="my-[60px]" />

        <StarCaption className="text-center text-text-mid">
          {site.marquee.captionHome}
        </StarCaption>
      </div>
    </ChapterSection>
  );
}
