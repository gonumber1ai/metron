/**
 * Customer testimonials.
 *
 * ── THE BAR FOR ADDING ONE ────────────────────────────────────────────────
 * A row in this file is a claim that a real person said a real thing about a
 * real result. That is what a star rating, a name, a flag and a stopwatch
 * number all assert to a man deciding whether to hand over 2,500 XAF, and it
 * is the only reason any of it moves him.
 *
 * So every entry needs, before it goes in:
 *   1. A real person who actually completed the programme.
 *   2. Their own words. Tidied for length is fine; written for them is not.
 *   3. Their permission to show it, and to show it at this level of detail —
 *      ask separately about the name and about the numbers.
 *   4. Numbers that came out of their own Day 1 and Day 10 measurements. The
 *      app already stores both, so this is a lookup, not a recollection.
 *
 * Anything short of all four does not belong here. It belongs in the page's
 * own voice, as Metron saying what the training does — which is honest copy,
 * costs nothing, and is a different section entirely.
 *
 * ── HOW TO GET THE FIRST ONES ─────────────────────────────────────────────
 * Give the 10-Day away to ten men on one condition: an honest reaction at
 * Day 10, whatever it says. Ten days from the day they start, this file is
 * full — and every number in it is one the app measured.
 *
 * ── SHAPE ─────────────────────────────────────────────────────────────────
 * `quote` carries both languages because the same man is shown to both
 * funnels. If he wrote in French, the `en` is a translation and vice versa;
 * translating what someone said is fine, inventing it is not.
 */

/** Where on the sales page a testimonial is allowed to appear. */
export type Slot =
  /** after DAY 1 -> DAY 10. Measurement stories. "This actually works." */
  | "journey"
  /** after WITHOUT/WITH. Confidence, arousal, anxiety, routine. */
  | "mindset"
  /** after the Day 10 bonus. Partners and wives. "This benefits her too." */
  | "partner"
  /** under the existing proof screenshots. A mix. */
  | "proof"
  /** before the 30-day section. Men who went 10 -> 30. */
  | "progression"
  /** the expandable "more experiences" drawer at the foot of the page. */
  | "more";

export type Testimonial = {
  id: string;
  /** ISO-3166 alpha-2. Drives the flag — see `flagOf`. */
  country: string;
  /** Exactly as the person agreed to be shown. Initials are fine. */
  name: string;
  /** Which programme they are talking about. */
  plan: "10" | "30";
  quote: { en: string; fr: string };
  slots: Slot[];
};

/**
 * Empty, and it stays empty until men have finished the programme.
 *
 * The carousel that reads this renders nothing at all when a slot has no
 * entries, so the page is complete and correct in the meantime — no gaps, no
 * placeholder cards, nothing to remember to take out later.
 */
export const TESTIMONIALS: Testimonial[] = [];

/** Everything cleared for one position on the page, in order. */
export function getTestimonials(locale: string, slot: Slot) {
  const lang = locale === "fr" ? "fr" : "en";
  return TESTIMONIALS.filter((t) => t.slots.includes(slot)).map((t) => ({
    id: t.id,
    country: t.country,
    name: t.name,
    plan: t.plan,
    quote: t.quote[lang],
  }));
}

/**
 * A country's flag from its code, built out of regional indicator letters —
 * so there is no image to ship, no sprite sheet to keep in step, and no
 * request to make. CM -> the two letters at U+1F1E6 + offset.
 */
export function flagOf(country: string): string {
  const cc = country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(
    ...[...cc].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65),
  );
}
