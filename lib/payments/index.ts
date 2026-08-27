/**
 * Payment abstraction.
 *
 * Two rails, one interface:
 *   Fapshi — MTN / Orange Mobile Money, XAF.
 *   Whop   — cards, acts as merchant of record.
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
export type Currency = "XAF";
export type ProviderId = "fapshi" | "whop";

export type Price = {
  plan: Plan;
  currency: Currency;
  /** XAF is a zero-decimal currency: 7500 means 7 500 francs, not 75.00 */
  amountMinor: number;
  provider: ProviderId;
  /** what the buyer sees */
  display: string;
};

/**
 * Price book. Everything is priced in francs.
 *
 * There used to be a second, dollar-priced book for "everywhere else", and it
 * did real damage: any visitor the edge geo header could not place — which is
 * every request in local development and plenty in production — fell through
 * to it and was quoted $15 and $125. Worse, a Cameroonian buyer got BOTH
 * books, so the Card tab beside Mobile Money read dollars while the page above
 * it read francs.
 *
 * One currency, one set of numbers, both rails. Cameroon is the market; when
 * a second one is worth pricing separately it gets its own entry here and its
 * own numbers, chosen deliberately rather than inherited by accident.
 */
const TEST_XAF = 7500;
const SPRINT_XAF = 69000;

const FCFA = (n: number) => `${n.toLocaleString("fr-FR")}${NBSP}FCFA`;

export const priceBook: Record<string, Price[]> = {
  default: [
    { plan: "test", currency: "XAF", amountMinor: TEST_XAF, provider: "fapshi", display: FCFA(TEST_XAF) },
    { plan: "sprint", currency: "XAF", amountMinor: SPRINT_XAF, provider: "fapshi", display: FCFA(SPRINT_XAF) },
    { plan: "test", currency: "XAF", amountMinor: TEST_XAF, provider: "whop", display: FCFA(TEST_XAF) },
    { plan: "sprint", currency: "XAF", amountMinor: SPRINT_XAF, provider: "whop", display: FCFA(SPRINT_XAF) },
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
