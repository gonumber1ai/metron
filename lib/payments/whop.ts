/**
 * Whop — international cards, USD. Merchant of record.
 *
 * The site quotes francs everywhere. Whop settles in dollars, so this is the
 * one surface a buyer sees a dollar figure on, and it is the figure he is
 * actually charged: $15 and $125.
 *
 * SERVER ONLY. Reads the API key. Never import from a "use client" file.
 *
 * ── DYNAMIC PRICING, ONE BARE PRODUCT ────────────────────────────────────
 * Whop needs a product to exist, but it never carries a price. It is a
 * container. Every purchase creates a fresh checkout configuration that
 * attaches to the same product with the price set per request, so the price
 * book in index.ts stays the only place a number lives, and a new offer needs
 * no new product.
 *
 * The safety property that makes one product safe for two plans: we never ask
 * Whop "which plan was this?". We ask "how much did they pay?" and derive the
 * plan from the amount — same rule as the Fapshi rail. A tampered client
 * cannot claim the 30-day for the price of the 10-day.
 *
 * ── ON THE SDK ───────────────────────────────────────────────────────────
 * @whop/sdk, not @whop/api. The latter has no price field on its checkout
 * session call and cannot do dynamic pricing at all, which is why an earlier
 * attempt here reached for raw REST and guessed the path wrong.
 *
 * The call shape below is not guesswork — it matches a Whop integration that
 * is live and taking money:
 *
 *   whop.checkoutConfigurations.create({
 *     account_id,                       // top level, NOT inside plan
 *     plan: { product_id, initial_price, plan_type: "one_time", currency },
 *     metadata,
 *   })
 *
 * Two things worth knowing. `account_id` sits at the top level and Whop
 * resolves it from the API key when omitted. There is no `mode` field. And
 * initial_price is decimal MAJOR units — that live integration passes 875 for
 * $875, which settles the question our conversion had been assuming.
 */

import { Whop, APIError } from "@whop/sdk";
import type { Plan, Currency } from "./index";

export function isConfigured(): boolean {
  return Boolean(process.env.WHOP_API_KEY && process.env.WHOP_PRODUCT_ID);
}

/**
 * ⚠⚠ THE 100x BUG LIVES HERE. TEST THIS WITH A REAL £1 CHARGE BEFORE LAUNCH. ⚠⚠
 *
 * Our price book stores minor units ($15.00 = 1500) because that is what most
 * payment APIs want and it avoids floating point. Whop's plan `initial_price`
 * is conventionally a DECIMAL MAJOR unit (15.00 means fifteen dollars).
 *
 * Get this backwards and you either charge $1,500 for a $15 product or 15
 * cents for a $125 one. Neither is survivable.
 *
 * Default assumes major units. If a live test shows the wrong amount on the
 * Whop checkout page, flip WHOP_PRICE_IN_MINOR_UNITS=1 and it sends cents.
 */
function toWhopPrice(amountMinor: number, currency: Currency): number {
  if (process.env.WHOP_PRICE_IN_MINOR_UNITS === "1") return Math.round(amountMinor);
  // XAF has no minor unit at all — 7500 already means 7,500 francs.
  if (currency === "XAF") return Math.round(amountMinor);
  return Math.round(amountMinor) / 100;
}

/**
 * Which plan does this amount correspond to?
 *
 * Shared by both rails, both the redirect and the webhook. The client never
 * gets a say. Thresholds sit far above the reset price and far below the
 * sprint price, so a promo or an FX rounding difference cannot flip it.
 */
export function planFromAmount(amountMinor: number, currency: Currency): Plan {
  // Sits between the two real prices on each rail: 7 500 vs 69 000 FCFA, and
  // $15 vs $125. Far enough from both that a promo or an FX wobble cannot
  // flip a 10-day buyer into the 30-day programme or the reverse.
  const threshold = currency === "XAF" ? 30_000 : 5_000; // 30k FCFA | $50.00
  return amountMinor >= threshold ? "sprint" : "test";
}

export type WhopCheckout = { url: string; sessionId?: string };

export async function createCheckout(input: {
  plan: Plan;
  ref: string;
  amountMinor: number;
  currency: Currency;
  redirectUrl: string;
}): Promise<WhopCheckout | null> {
  const apiKey = process.env.WHOP_API_KEY;
  const accountId = process.env.WHOP_ACCOUNT_ID ?? process.env.WHOP_COMPANY_ID;
  const productId = process.env.WHOP_PRODUCT_ID;

  if (apiKey && productId) {
    try {
      const whop = new Whop({ apiKey });
      const config = await whop.checkoutConfigurations.create({
        // Whop resolves this from the key when omitted; state it when known.
        ...(accountId ? { account_id: accountId } : {}),
        plan: {
          product_id: productId,
          initial_price: toWhopPrice(input.amountMinor, input.currency),
          plan_type: "one_time",
          currency: input.currency.toLowerCase(),
        },
        // Rides on the configuration, so the webhook can match this payment to
        // a device exactly instead of guessing from an email address.
        metadata: { ref: input.ref, plan: input.plan },
      });

      const id = config.id ?? "";
      if (id) {
        return { url: `https://whop.com/checkout/${id}`, sessionId: id };
      }
      console.error("[whop] checkout configuration returned no id");
    } catch (err) {
      const status = err instanceof APIError ? err.status : undefined;
      console.error("[whop] checkoutConfigurations.create failed", status, err);
    }
  }

  // Fallback: a pre-priced plan, if one exists. Loses dynamic pricing but sells.
  const planId = process.env.WHOP_PLAN_ID;
  if (planId) {
    return {
      url: `https://whop.com/checkout/${planId}?metadata[ref]=${encodeURIComponent(input.ref)}`,
    };
  }
  return null;
}

export type WhopMembership = {
  id?: string;
  valid?: boolean;
  status?: string;
  plan_id?: string;
  metadata?: Record<string, unknown>;
  amount?: number;
  currency?: string;
  receipt?: { amount?: number; currency?: string };
};

/** Never trust a redirect or a webhook body. Ask Whop. */
export async function membership(id: string): Promise<WhopMembership | null> {
  const key = process.env.WHOP_API_KEY;
  if (!key || !id) return null;
  const base = process.env.WHOP_API_BASE ?? "https://api.whop.com/api/v2";
  try {
    const res = await fetch(`${base}/memberships/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    return json ? ((json.data ?? json) as WhopMembership) : null;
  } catch {
    return null;
  }
}

export function isValid(m: WhopMembership | null): boolean {
  if (!m) return false;
  if (typeof m.valid === "boolean") return m.valid;
  return m.status === "active" || m.status === "completed" || m.status === "valid";
}

/**
 * What did they buy?
 *
 * Amount charged first, because that is the fact. Metadata last, because on
 * the fallback path it comes from a query string the buyer could have edited.
 */
export function planFromMembership(m: WhopMembership | null): Plan {
  const paid = m?.amount ?? m?.receipt?.amount;
  const cur = ((m?.currency ?? m?.receipt?.currency ?? "USD").toUpperCase() as Currency) ?? "USD";
  if (typeof paid === "number" && paid > 0) return planFromAmount(paid, cur);
  return m?.metadata?.plan === "sprint" ? "sprint" : "test";
}
