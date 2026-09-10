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

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
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
      className={`${neueMontreal.variable} ${jetbrainsMono.variable} antialiased`}
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
