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

/**
 * Live-test override for the Mobile Money price.
 *
 * Set NEXT_PUBLIC_PRICE_OVERRIDE_XAF=500 to charge 500 FCFA instead of the
 * real price, so a real MTN or Orange payment can be run end to end without
 * spending 7,500 each time. Fapshi's floor is 100 XAF.
 *
 * NEXT_PUBLIC_ on purpose: the browser renders the price and the server
 * charges it, and those two must never disagree. One variable moves both.
 *
 * ⚠ REMOVE IT AFTER TESTING. While it is set, real buyers pay it too. The
 * health check reports it in bold for exactly that reason.
 */
function xafOverride(): number | null {
  const raw = process.env.NEXT_PUBLIC_PRICE_OVERRIDE_XAF;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 100 ? Math.round(n) : null;
}

function applyOverride(p: Price): Price {
  const o = xafOverride();
  // Only the 10-day. The 175,000 anchor has to stay real or the offer page
  // reads "the full programme costs 175,000 FCFA" directly above a 500 FCFA
  // price for that same programme.
  if (o === null || p.currency !== "XAF" || p.plan !== "test") return p;
  return { ...p, amountMinor: o, display: `${o.toLocaleString("fr-FR")} FCFA` };
}

export function getPrice(plan: Plan, country = "default"): Price {
  const rows = priceBook[country] ?? priceBook.default;
  const row = rows.find((r) => r.plan === plan) ?? priceBook.default.find((r) => r.plan === plan)!;
  return applyOverride(row);
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
 * A market with its own book gets its local rail first and the card rail as the
 * alternative. Everywhere else gets the card rail only — note the explicit
 * `country !== "default"` guard, without which the default book concatenates
 * with itself and the offer page renders the same Card row twice.
 */
export function getPrices(country = "default"): Price[] {
  const local = country === "default" ? undefined : priceBook[country];
  if (!local) return priceBook.default.map(applyOverride);
  return [...local, ...priceBook.default].map(applyOverride);
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
