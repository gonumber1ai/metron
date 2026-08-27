import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "../globals.css";

/**
 * Two families, both variable, both downloaded at build time and served from
 * our own origin. Nothing is fetched from Google at runtime: no third party
 * learns who opened this page, and a man on a slow connection in Douala is not
 * waiting on a CDN in another country before he can read anything.
 *
 * Archivo carries every heading and every measurement — it is a grotesque with
 * real weight to it, which is what makes a number look like a reading off an
 * instrument rather than a figure in a brochure. Inter runs the body, because
 * at 15px on a cheap Android screen nothing else is as legible.
 *
 * Both carry latin-ext, which is what the French accents need.
 */
const display = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const body = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});
import { locales, isLocale, defaultLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  // Neutral everywhere it can be seen — browser tab, home-screen shortcut,
  // shared link. Nothing here hints at what the app is for.
  title: "Metron",
  description: "Measure it. Change it.",
  applicationName: "Metron",
  appleWebApp: { capable: true, title: "Metron", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#070D0F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = isLocale(locale) ? locale : defaultLocale;

  return (
    <html lang={lang} className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
