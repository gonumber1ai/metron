/**
 * Payment abstraction.
 *
 * Two rails, one interface:
 *   Fapshi — MTN / Orange Mobile Money, XAF.
 *   Whop   — cards, USD, acts as merchant of record.
 *
 * Both are stubbed until credentials arrive. `createCheckout` returns
 * { status: "unavailable" } and the UI falls back to lead capture, so the
 * funnel keeps collecting contacts instead of dead-ending on a broken button.
 *
 * Adding a rail later (Stripe, Razorpay, PIX) means one new file implementing
 * PaymentProvider plus rows in the price book. Nothing else changes.
 */

/** non-breaking space, so "7 500 FCFA" can never wrap into "7" / "500 FCFA" */
const NBSP = " ";

export type Plan = "test" | "sprint";
export type Currency = "XAF" | "USD";
export type ProviderId = "fapshi" | "whop";

export type Price = {
  plan: Plan;
  currency: Currency;
  /** minor units — 7500 XAF = 7 500 francs (zero-decimal), 1500 USD = $15.00 */
  amountMinor: number;
  provider: ProviderId;
  /** what the buyer sees */
  display: string;
};

/**
 * Price book.
 *
 * The site quotes francs. Whop settles in dollars, so the card rail — and only
 * the card rail — carries a USD figure, which is what a card buyer actually
 * gets charged. Mobile Money and every price in the copy are XAF.
 *
 * There used to be a second book keyed "default" that was dollars-only, and it
 * did real damage. Any visitor the edge geo header could not place fell
 * through to it and was quoted $15 and $125 for everything — that is every
 * request in local development and plenty in production. On top of that a
 * Cameroonian buyer got both books concatenated, so the offer page rendered
 * two Card rows. One book now, holding both rails, with no market able to
 * inherit dollar pricing by accident.
 *
 * Order matters: the Fapshi rows come first, because the offer page takes the
 * first row for a plan when it needs a price to print in a sentence, and the
 * sentence should say francs.
 */
const TEST_XAF = 7500;
const SPRINT_XAF = 69000;
/** minor units: $15.00 and $125.00 */
const TEST_USD = 1500;
const SPRINT_USD = 12500;

const NB = " "; // narrow no-break space, the French thousands separator
const FCFA = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB)}${NBSP}FCFA`;

export const priceBook: Record<string, Price[]> = {
  default: [
    { plan: "test", currency: "XAF", amountMinor: TEST_XAF, provider: "fapshi", display: FCFA(TEST_XAF) },
    { plan: "sprint", currency: "XAF", amountMinor: SPRINT_XAF, provider: "fapshi", display: FCFA(SPRINT_XAF) },
    { plan: "test", currency: "USD", amountMinor: TEST_USD, provider: "whop", display: "$15" },
    { plan: "sprint", currency: "USD", amountMinor: SPRINT_USD, provider: "whop", display: "$125" },
  ],
};

export function getPrice(plan: Plan, country = "default"): Price {
  const rows = priceBook[country] ?? priceBook.default;
  return rows.find((r) => r.plan === plan) ?? priceBook.default.find((r) => r.plan === plan)!;
}

/**
 * Price for an EXPLICITLY chosen rail.
 *
 * The offer page shows two tabs in a market that has both, so the rail is the
 * buyer's choice and not something to infer from his country. Inferring it is
 * how the Card tab ended up sending Cameroonian buyers to a Mobile Money
 * checkout page: the client sent only the country, and the server picked the
 * local rail because that is what the country implies.
 */
export function getPriceFor(plan: Plan, provider: ProviderId, country = "default"): Price | null {
  const rows = getPrices(country);
  return rows.find((r) => r.plan === plan && r.provider === provider) ?? null;
}

/**
 * Every price available for a market, so the offer page can show both rails.
 *
 * A market with its own book replaces the default outright rather than being
 * concatenated onto it. Concatenating is what used to put a dollar Card row
 * underneath a franc Mobile Money row on the same page.
 */
export function getPrices(country = "default"): Price[] {
  return priceBook[country] ?? priceBook.default;
}

export type CheckoutInput = {
  plan: Plan;
  price: Price;
  locale: string;
  /** anonymous id — no real name is ever collected */
  ref: string;
};

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "unavailable"; reason: string };

export interface PaymentProvider {
  id: ProviderId;
  label: string;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  /** verify a webhook signature — implemented when keys arrive */
  verifyWebhook(rawBody: string, headers: Record<string, string>): Promise<boolean>;
}
