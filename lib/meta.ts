import crypto from "node:crypto";

/**
 * Meta Conversions API — server side.
 *
 * ── WHAT IS ALLOWED OUT OF HERE ───────────────────────────────────────────
 * Four standard events and nothing else. No quiz answers, no pattern, no
 * duration, no name, no phone. The pattern in particular — anxious,
 * conditioned, dependent, depleted — is a health inference about a named
 * person, and it is the single worst thing this codebase could hand to an ad
 * network. It is not that we choose not to send it: there is no code path here
 * that can.
 *
 * The pixel is scoped to the offer and checkout pages only. Meta needs
 * InitiateCheckout and Purchase to optimise; it does not need to watch a man
 * answer nine questions about his sex life, and the assessment stays invisible
 * to it.
 *
 * Purchase fires from the server, off the payment webhook, because that is the
 * only place that knows for certain that money moved. The browser pixel guesses
 * — it misses the man who closes the tab on the confirmation screen and
 * double-counts the one who refreshes it.
 */

const ALLOWED = ["ViewContent", "InitiateCheckout", "Purchase", "Lead"] as const;
export type MetaEvent = (typeof ALLOWED)[number];

export function isConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID && process.env.META_CAPI_TOKEN);
}

/** Meta requires identifiers hashed, lowercased and trimmed, as SHA-256 hex. */
function hash(v: string): string {
  return crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
}

/**
 * Send one conversion.
 *
 * Never throws and never blocks a payment: an ad network being down is not a
 * reason to fail a webhook that has already taken a man's money.
 */
export async function sendEvent(input: {
  event: MetaEvent;
  /** our own ref, hashed — lets Meta dedupe without learning who he is */
  ref?: string;
  /** only if he gave one at checkout; hashed before it leaves this function */
  email?: string;
  value?: number;
  currency?: string;
  /** "test" | "sprint" — a product code, not a fact about him */
  plan?: string;
  eventId?: string;
  clientIp?: string;
  userAgent?: string;
}): Promise<boolean> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return false;

  // Belt and braces: an event name added later that is not on the list simply
  // does not go.
  if (!ALLOWED.includes(input.event)) {
    console.warn(`[meta] refused to send non-allowlisted event: ${input.event}`);
    return false;
  }

  const user_data: Record<string, unknown> = {};
  if (input.email) user_data.em = [hash(input.email)];
  if (input.ref) user_data.external_id = [hash(input.ref)];
  if (input.clientIp) user_data.client_ip_address = input.clientIp;
  if (input.userAgent) user_data.client_user_agent = input.userAgent;

  const custom_data: Record<string, unknown> = {};
  if (input.value != null) custom_data.value = input.value;
  if (input.currency) custom_data.currency = input.currency;
  if (input.plan) custom_data.content_ids = [input.plan];

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: input.event,
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              // Shared with the browser pixel so one purchase is not counted
              // twice when both fire.
              ...(input.eventId ? { event_id: input.eventId } : {}),
              event_source_url: process.env.NEXT_PUBLIC_APP_URL,
              user_data,
              custom_data,
            },
          ],
        }),
      },
    );
    if (!res.ok) {
      console.error("[meta] CAPI rejected:", (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[meta] CAPI failed:", (e as Error).message);
    return false;
  }
}
