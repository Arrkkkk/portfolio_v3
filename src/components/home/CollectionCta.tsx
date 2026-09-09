import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { MonoLink } from "@/components/primitives/MonoLink";
import { site } from "@/data/site";

/** PAGES §06 — the breath between the work track and the services set-piece. */
export function CollectionCta() {
  return (
    <ChapterSection theme="light" className="bg-white text-ink">
      <div className="flex min-h-[70svh] flex-col items-center justify-center page-x text-center">
        <p className="max-w-[330px] text-[16px] leading-[1.35] text-ink-mid">
          {site.collection.copy}
        </p>
        <MonoLink
          className="mt-10 text-ink-mid"
          label={site.collection.link.label}
          href={site.collection.link.href}
          width={168}
        />
      </div>
    </ChapterSection>
  );
}
