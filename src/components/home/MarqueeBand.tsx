import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { StarCaption } from "@/components/primitives/Rule";
import { Marquee } from "./Marquee";
import { site } from "@/data/site";

/** PAGES §03 — the dark marquee chapter. Geometry anchored to frame 070. */
export function MarqueeBand() {
  return (
    <ChapterSection theme="dark" className="pointer-events-auto relative overflow-hidden text-text-hi">
      {/*
        A full viewport, not 70svh. PAGES §03 measures the label at y 125, the
        band centred at y 465 and the caption at y 785 — that geometry only
        lands inside a 951px viewport. At 70svh the band sat well above centre,
        so it crossed empty sky instead of the mark: the canvas behind is
        sticky and therefore always centred on the viewport, and the words only
        sweep across it when this section is a viewport tall too.
      */}
      <div className="flex min-h-svh flex-col justify-between py-[125px]">
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
