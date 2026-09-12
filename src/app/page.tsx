import { ChapterWipe } from "@/components/home/ChapterWipe";
import { DarkChapters } from "@/components/home/DarkChapters";
import { Hero } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { MarqueeBand } from "@/components/home/MarqueeBand";
import { KeyFacts } from "@/components/home/KeyFacts";
import { SelectedWork } from "@/components/home/SelectedWork";
import { CollectionCta } from "@/components/home/CollectionCta";
import { ServicesScene } from "@/components/home/ServicesScene";
import { ClientStories } from "@/components/home/ClientStories";
import { DesignInMotion } from "@/components/home/DesignInMotion";
import { FooterCta } from "@/components/home/FooterCta";

/** Home — chapter order per analysis/PAGES.md. */
export default function Home() {
  return (
    <>
      {/* One canvas behind all three dark chapters — see DarkChapters. */}
      <DarkChapters>
        <Hero />
        <Statement />
        <MarqueeBand />
      </DarkChapters>
      {/* Zero-height anchor + fixed overlay. Adds no scroll distance: it is
          scrubbed across Key facts' own entry, so the marquee is still leaving
          and Key facts still rising while the bands fill. */}
      <ChapterWipe />
      <KeyFacts />
      <SelectedWork />
      <CollectionCta />
      <ServicesScene />
      <ClientStories />
      <DesignInMotion />
      <FooterCta />
    </>
  );
}
