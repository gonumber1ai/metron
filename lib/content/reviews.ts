import type { Locale } from "@/lib/i18n";

/**
 * Reviews.
 *
 * Empty on purpose. Add real ones here as they come in from WhatsApp and
 * in-app screenshots — never invent them. Until this array has entries the
 * page shows an honest "no testimonials yet" block instead, which converts
 * better than fabricated proof and cannot blow up later.
 *
 * `image` is a path under /public (e.g. "/reviews/whatsapp-01.png") for a
 * screenshot. Crop the name and photo out before you add it, and get the
 * customer's explicit permission first — in this category that is not
 * optional, and a single leak would end the business.
 *
 * `numbers` renders as a before/after chip. Only fill it in when the customer
 * actually logged both measurements.
 */

export type Review = {
  id: string;
  /** first name only, an initial, or a city — never a full name */
  who: string;
  locale: Locale;
  text: string;
  numbers?: { day1: string; day12: string };
  image?: string;
  /** confirm you hold written permission to publish this */
  consent: true;
};

export const reviews: Review[] = [
  // {
  //   id: "r1",
  //   who: "S., Douala",
  //   locale: "fr",
  //   text: "...",
  //   numbers: { day1: "2:10", day12: "4:45" },
  //   consent: true,
  // },
];

export function getReviews(locale: Locale | string): Review[] {
  return reviews.filter((r) => r.locale === locale);
}
