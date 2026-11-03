import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ChapterProvider } from "@/components/chrome/ChapterTheme";
import { MenuProvider } from "@/components/chrome/MenuContext";
import { Header } from "@/components/chrome/Header";
import { MenuOverlay } from "@/components/chrome/MenuOverlay";
import { SmoothScroll } from "@/components/chrome/SmoothScroll";
import { Preloader } from "@/components/chrome/Preloader";
import { PageTransition } from "@/components/chrome/PageTransition";
import { site } from "@/data/site";

/**
 * Display face: PP Neue Montreal — the reference's own face, replacing the
 * General Sans stand-in that stood here while the real files were unavailable.
 * Book is mapped to 400 and Medium to 500, matching how the design uses them:
 * 400 carries everything, 500 only the wordmark. See analysis/DESIGN-SYSTEM.md §2.
 *
 * Subset to Latin + punctuation + arrows and converted to woff2 from the OTFs
 * (pyftsubset, kern/liga/calt retained). The captions' emoji are unaffected —
 * those come from the system emoji face, not from here.
 */
const neueMontreal = localFont({
  src: [
    { path: "./fonts/NeueMontreal-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/NeueMontreal-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

/*
 * `fallback` is load-bearing, not tidiness. next/font synthesises a
 * "JetBrains Mono Fallback" face with size-adjust metrics for CLS and inserts
 * it directly after the real one — and by default it is built from `local("Arial")`.
 * Arial has U+2192, JetBrains Mono's `latin` subset does not (that range stops
 * at U+2191/U+2193), so Chrome resolved every right-arrow on the site to Arial
 * and never reached the monospace families further down the stack: a
 * proportional sans glyph inside monospace uppercase, on MonoLink's
 * "VIEW ALL PROJECTS →" as much as on the Key facts labels.
 *
 * Naming monospace families here makes the synthesised fallback derive from
 * one of them instead, so the substitute glyph is at least monospace. Verified
 * with CSS.getPlatformFontsForNode rather than by eye.
 */
/*
 * PP Editorial New (Light) — the owner's own font file, not a free
 * substitute. Used only for the three Key facts card numerals ("10+", "5+",
 * "15+"): its exaggerated thick-curve/hairline-stem contrast is the point
 * there, which Neue Montreal (a grotesque, uniform stroke weight) cannot
 * produce. Subset to digits + "+" only (pyftsubset, U+0030-0039 and U+002B) —
 * it is never used for running text, so the rest of the glyph set is dead
 * weight.
 */
const editorialNew = localFont({
  src: [{ path: "./fonts/EditorialNew-Light.woff2", weight: "300", style: "normal" }],
  variable: "--font-editorial-new",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  fallback: ["Menlo", "Consolas", "DejaVu Sans Mono", "monospace"],
});

export const metadata: Metadata = {
  title: `${site.name} — Portfolio`,
  description: site.about.mission,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${neueMontreal.variable} ${editorialNew.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <ChapterProvider>
          <MenuProvider>
            <SmoothScroll />
            <Preloader />
            <PageTransition />
            <Header />
            <MenuOverlay />
            <main>{children}</main>
          </MenuProvider>
        </ChapterProvider>
      </body>
    </html>
  );
}
