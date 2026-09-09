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
 * Display face: General Sans (Fontshare, free) — the closest freely-licensable
 * match to the reference's PP Neue Montreal: single-storey `g`, double-storey
 * `a`, tight sidebearings. Weight 400 carries the whole design; 500 is used
 * only by the wordmark. See analysis/DESIGN-SYSTEM.md §2.
 */
const generalSans = localFont({
  src: [
    { path: "./fonts/GeneralSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-general-sans",
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
      className={`${generalSans.variable} ${jetbrainsMono.variable} antialiased`}
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
