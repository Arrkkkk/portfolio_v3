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
        {/* dark -> light band wipe; must sit inside the wrapper so the sticky
            canvas still shows through the bands that haven't filled yet. */}
        <ChapterWipe />
      </DarkChapters>
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
