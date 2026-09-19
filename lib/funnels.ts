/**
 * The four funnels.
 *
 *   Funnel 1K — FR    /fr/f/1k     1 000 → 3 500 after 7h · 30-day 5 000
 *   Funnel 1K — EN    /en/f/1k
 *   Funnel 5K — FR    /fr/f/5k     5 000 → 7 500 after 7h · 30-day 15 000
 *   Funnel 5K — EN    /en/f/5k
 *
 * Same page, same copy, same tracking. What differs is the tier — the three
 * prices — and the language, and both are read from here by everything that
 * needs them: the page, the checkout, the payment route, the recovery
 * message, the admin. Nothing else is allowed to know a price.
 *
 * ── THE FUNNEL TRAVELS WITH THE MAN ──────────────────────────────────────
 * Landing on /fr/f/1k writes the funnel id into his local state (first touch
 * kept separately, never overwritten) and into a cookie the server can read.
 * The checkout, the payment route and every event he fires afterwards carry
 * it, so a purchase can never be attributed to the wrong funnel — the id was
 * decided on the landing page and nothing downstream gets to guess.
 */

export type Tier = "1k" | "5k";
export type Lang = "fr" | "en";
export type FunnelId = `${Tier}-${Lang}`;

export type TierPrices = {
  /** the 10-day at the offer price, for 7 hours from first landing */
  offer: number;
  /** the 10-day once the clock has run — what everyone pays */
  full: number;
  /** the 30-day, flat */
  sprint: number;
};

/* One price. The 1K/5K split and the seven-hour clock are retired: the
   10-day is 4 900 everywhere, the 30-day 15 000, and nothing counts down.
   The tier ids remain so the four funnel links keep working and keep
   reporting separately. */
export const TIERS: Record<Tier, TierPrices> = {
  "1k": { offer: 4900, full: 4900, sprint: 15000 },
  "5k": { offer: 4900, full: 4900, sprint: 15000 },
};

export type Funnel = {
  id: FunnelId;
  /** exactly as it appears in the admin, the CRM and every report */
  name: string;
  tier: Tier;
  lang: Lang;
  path: string;
  /** hours the offer price holds from first landing */
  timerHours: number;
  /** hours after expiry during which the last-chance link still honours the offer price */
  recoveryHours: number;
};

const mk = (tier: Tier, lang: Lang): Funnel => ({
  id: `${tier}-${lang}`,
  name: `Funnel ${tier.toUpperCase()} — ${lang.toUpperCase()}`,
  tier,
  lang,
  path: `/${lang}/f/${tier}`,
  timerHours: 7,
  recoveryHours: 48,
});

export const FUNNELS: Record<FunnelId, Funnel> = {
  "1k-fr": mk("1k", "fr"),
  "1k-en": mk("1k", "en"),
  "5k-fr": mk("5k", "fr"),
  "5k-en": mk("5k", "en"),
};

export const FUNNEL_IDS = Object.keys(FUNNELS) as FunnelId[];

export function isFunnelId(v: unknown): v is FunnelId {
  return typeof v === "string" && v in FUNNELS;
}

export function isTier(v: unknown): v is Tier {
  return v === "1k" || v === "5k";
}

/** The funnel for a landing, or null for anything that is not one of the four. */
export function funnelFor(tier: string, lang: string): Funnel | null {
  const l: Lang = lang === "fr" ? "fr" : "en";
  return isTier(tier) ? FUNNELS[`${tier}-${l}`] : null;
}

/** Cookie the server reads to price a checkout when the body does not say. */
export const FUNNEL_COOKIE = "metron_funnel";

/** The recovery link, honouring the offer price after expiry. */
export function lastChanceUrl(f: Funnel): string {
  return `/${f.lang}/offer?go=1&lc=1`;
}
