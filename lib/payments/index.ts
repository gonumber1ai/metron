/**
 * Payment abstraction.
 *
 * Two rails, one interface:
 *   Fapshi — MTN / Orange Mobile Money, XAF, Cameroon.
 *   Whop   — international cards, USD, acts as merchant of record.
 *
 * Both are stubbed until credentials arrive. `createCheckout` returns
 * { status: "unavailable" } and the UI falls back to lead capture, so the
 * funnel keeps collecting contacts instead of dead-ending on a broken button.
 *
 * Adding a rail later (Stripe, Razorpay, PIX) means one new file implementing
 * PaymentProvider plus rows in the price book. Nothing else changes.
 */

export type Plan = "test" | "sprint";
export type Currency = "XAF" | "USD";
export type ProviderId = "fapshi" | "whop";

export type Price = {
  plan: Plan;
  currency: Currency;
  /** minor units — 7500 XAF = 7500, $15.00 = 1500 */
  amountMinor: number;
  provider: ProviderId;
  /** what the buyer sees */
  display: string;
};

/**
 * Price book, keyed by country. One row per market, per plan.
 * Purchasing power differs enormously between markets — never a single
 * global price. `default` catches everything not listed.
 */
export const priceBook: Record<string, Price[]> = {
  CM: [
    { plan: "test", currency: "XAF", amountMinor: 7500, provider: "fapshi", display: "7 500 FCFA" },
    {
      plan: "sprint",
      currency: "XAF",
      amountMinor: 175000,
      provider: "fapshi",
      display: "175 000 FCFA",
    },
  ],
  default: [
    { plan: "test", currency: "USD", amountMinor: 1500, provider: "whop", display: "$15" },
    { plan: "sprint", currency: "USD", amountMinor: 35000, provider: "whop", display: "$350" },
  ],
};

export function getPrice(plan: Plan, country = "default"): Price {
  const rows = priceBook[country] ?? priceBook.default;
  return rows.find((r) => r.plan === plan) ?? priceBook.default.find((r) => r.plan === plan)!;
}

/**
 * Every price available for a market, so the offer page can show both rails.
 *
 * A market with its own book gets its local rail first and the card rail as the
 * alternative. Everywhere else gets the card rail only — note the explicit
 * `country !== "default"` guard, without which the default book concatenates
 * with itself and the offer page renders the same Card row twice.
 */
export function getPrices(country = "default"): Price[] {
  const local = country === "default" ? undefined : priceBook[country];
  if (!local) return priceBook.default;
  return [...local, ...priceBook.default];
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
