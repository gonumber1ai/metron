import type { Metadata } from "next";
import { headers } from "next/headers";
import { ChallengeClient } from "./c/ChallengeClient";

/**
 * metron.life — the funnel page in its "home" variant (see ChallengeClient).
 *
 * The only indexable page. The ad page is noindex and stays that way; this
 * one carries the plain words people actually search, in both languages,
 * and points every search engine at itself for the other language.
 */
const META = {
  en: {
    title: "Metron — Last longer in bed: 10 days of training, 15 minutes a day",
    description: "Exercises to last longer in bed. No pills, no herbs. Measure yourself on Day 1, train 15 minutes a day, measure again on Day 12. Day 1 is free.",
  },
  fr: {
    title: "Metron — Durer plus longtemps au lit : 10 jours d'entraînement, 15 minutes par jour",
    description: "Des exercices pour durer plus longtemps au lit. Pas de pilules, pas de plantes. Mesurez-vous au jour 1, entraînez-vous 15 minutes par jour, mesurez à nouveau au jour 12. Le jour 1 est gratuit.",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = META[locale === "fr" ? "fr" : "en"];
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://metron.life";
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `${base}/${locale}`, languages: { en: `${base}/en`, fr: `${base}/fr`, "x-default": `${base}/en` } },
    openGraph: { type: "website", siteName: "Metron", title: m.title, description: m.description, url: `${base}/${locale}` },
    twitter: { card: "summary_large_image", title: m.title, description: m.description },
    robots: { index: true, follow: true },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const h = await headers();
  const country = h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("x-country") ?? null;
  return <ChallengeClient locale={locale} geoCountry={country?.toUpperCase() ?? null} variant="home" />;
}
