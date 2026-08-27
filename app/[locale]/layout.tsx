import type { Metadata, Viewport } from "next";
import "../globals.css";
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
  themeColor: "#0E1417",
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
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
