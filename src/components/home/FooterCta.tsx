"use client";

import { useEffect, useState } from "react";
import { ChapterSection } from "@/components/chrome/ChapterTheme";
import { BlurText } from "@/components/primitives/BlurText";
import { MonoLink } from "@/components/primitives/MonoLink";
import { LineWordmark } from "./LineWordmark";
import { site } from "@/data/site";
import { timeIn } from "@/lib/utils";

const ZONES: Record<string, string> = { IST: "Asia/Kolkata" };

/** PAGES §10 — the shared footer CTA. Geometry anchored to frame 248. */
export function FooterCta() {
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const zone = ZONES[site.footer.timezone] ?? "UTC";
    const tick = () => setClock(timeIn(zone));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ChapterSection theme="dark" className="relative overflow-hidden bg-black text-text-hi">
      <div className="relative z-10 page-x pt-[123px]">
        <div className="flex items-start justify-between gap-8">
          <p className="label-mono text-text-mid">{site.footer.label}</p>
          {/* Rendered client-side only so SSR and hydration cannot disagree. */}
          <p className="label-mono text-text-mid" suppressHydrationWarning>
            {clock ? `${site.footer.timezone} → ${clock}` : ""}
          </p>
        </div>

        <div className="mt-6 grid gap-16 lg:grid-cols-[2.09fr_1fr]">
          <div>
            <BlurText
              as="h2"
              text={site.footer.heading[0]}
              className="block text-display track-display"
            />
            <BlurText
              as="h2"
              text={site.footer.heading[1]}
              className="block text-display track-display"
            />
          </div>

          <div className="lg:pt-[115px]">
            <div className="flex flex-wrap gap-8">
              {site.footer.links.map((l) => (
                <MonoLink
                  key={l.label}
                  label={l.label}
                  href={l.href}
                  width={208}
                  className="text-text-mid"
                />
              ))}
            </div>

            <div className="mt-[92px] grid gap-10 sm:grid-cols-2">
              <div>
                <p className="label-mono text-text-lo">Business enquiry</p>
                <p className="mt-3 text-[16px]">
                  <span className="text-text-lo">E.</span>{" "}
                  <a href={`mailto:${site.footer.email}`} className="hover:opacity-70">
                    {site.footer.email}
                  </a>
                </p>
                {site.footer.phone ? (
                  <p className="mt-1 text-[16px]">
                    <span className="text-text-lo">P.</span> {site.footer.phone}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="label-mono text-text-lo">Social</p>
                <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-[16px]">
                  {site.footer.social.map((s) => (
                    <li key={s.label}>
                      <a href={s.href} className="hover:opacity-70">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[62px] flex flex-col gap-[62px] pb-[40px] label-mono text-text-lo">
          <p>
            ©{site.wordmark}
            {site.registered ? "®" : ""} {new Date().getFullYear()}
          </p>
          <p>{site.footer.soundNote}</p>
        </div>
      </div>

      <div className="relative z-0 -mt-[40px] px-0 pb-10 text-white">
        <LineWordmark word={site.wordmark} />
      </div>
    </ChapterSection>
  );
}
