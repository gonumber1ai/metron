import type { EstimateBucket } from "./store";

/**
 * Brief 2, 1.1 — the five buckets a man can pick when he cannot measure.
 * `seconds` is the midpoint the row stores. The label is what every screen
 * says back to him: "about 2 minutes", never a number that looks measured.
 */
export const BUCKETS: { id: EstimateBucket; seconds: number; en: string; fr: string; aboutEn: string; aboutFr: string }[] = [
  { id: "u1", seconds: 30, en: "Under 1 min", fr: "Moins d'1 min", aboutEn: "under a minute", aboutFr: "moins d'une minute" },
  { id: "1_2", seconds: 90, en: "1–2 min", fr: "1 à 2 min", aboutEn: "about 1–2 minutes", aboutFr: "environ 1 à 2 minutes" },
  { id: "2_3", seconds: 150, en: "2–3 min", fr: "2 à 3 min", aboutEn: "about 2–3 minutes", aboutFr: "environ 2 à 3 minutes" },
  { id: "3_5", seconds: 240, en: "3–5 min", fr: "3 à 5 min", aboutEn: "about 3–5 minutes", aboutFr: "environ 3 à 5 minutes" },
  { id: "o5", seconds: 360, en: "Over 5 min", fr: "Plus de 5 min", aboutEn: "over 5 minutes", aboutFr: "plus de 5 minutes" },
];

export function bucketSeconds(id: EstimateBucket): number {
  return BUCKETS.find((b) => b.id === id)?.seconds ?? 90;
}

/** "about 2–3 minutes" — for the result screen and the paywall. */
export function aboutLabel(id: EstimateBucket | undefined, locale: string): string {
  const b = BUCKETS.find((x) => x.id === id) ?? BUCKETS[1];
  return locale === "fr" ? b.aboutFr : b.aboutEn;
}
