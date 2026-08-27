/**
 * Whop — international cards, USD. Merchant of record.
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
 * @whop/api@0.0.51 (current published) exposes only
 * `payments.createCheckoutSession({ planId, ... })` — it requires a planId and
 * has no price field, so it cannot do dynamic pricing. The checkout
 * configurations API is newer and REST (note snake_case vs the SDK's camel),
 * so we call it directly and keep the SDK route as a fallback for anyone who
 * does have a priced plan.
 */

import type { Plan, Currency } from "./index";

const REST =
  process.env.WHOP_CHECKOUT_ENDPOINT ?? "https://api.whop.com/api/v5/company/checkout_configurations";

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
 * cents for a $350 one. Neither is survivable.
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
  const threshold = currency === "XAF" ? 100_000 : 10_000; // 100k FCFA | $100.00
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
  const key = process.env.WHOP_API_KEY;
  const companyId = process.env.WHOP_ACCOUNT_ID;
  const productId = process.env.WHOP_PRODUCT_ID;

  if (key && companyId && productId) {
    try {
      const res = await fetch(REST, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: {
            company_id: companyId,
            product_id: productId,
            currency: input.currency.toLowerCase(),
            plan_type: "one_time",
            initial_price: toWhopPrice(input.amountMinor, input.currency),
          },
          redirect_url: input.redirectUrl,
          metadata: { ref: input.ref, plan: input.plan },
        }),
        cache: "no-store",
      });

      if (res.ok) {
        const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        const data = (json.data ?? json) as Record<string, unknown>;
        const id = (data.id as string) ?? undefined; // ch_xxxxxxxx
        const url =
          (data.purchase_url as string) ??
          (data.checkout_url as string) ??
          (id ? `https://whop.com/checkout/${id}` : undefined);
        if (url) return { url, sessionId: id };
      } else {
        console.error("[whop] checkout config failed", res.status, await res.text());
      }
    } catch (err) {
      console.error("[whop] checkout config threw", err);
    }
  }

  // Fallback: a priced plan, if one exists. Loses dynamic pricing but sells.
  const planId = process.env.WHOP_PLAN_ID;
  if (planId) {
    const sep = "?";
    return {
      url: `https://whop.com/checkout/${planId}${sep}metadata[ref]=${encodeURIComponent(input.ref)}`,
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
