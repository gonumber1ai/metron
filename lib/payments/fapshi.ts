/**
 * Fapshi — MTN MoMo / Orange Money, XAF, Cameroon.
 *
 * SERVER ONLY. This module reads the API key. Never import it from a
 * "use client" file — it must only ever be reached from a route handler.
 *
 * Auth is two headers, `apiuser` and `apikey`, taken from the service's API
 * tab in the Fapshi dashboard. Each service (each domain) has its own pair, so
 * the sandbox service and the live service have different credentials.
 *
 * NOTE: the METRON service has "Card Payments: Not Allowed", which is expected
 * and correct — Fapshi carries Mobile Money here and Whop carries cards.
 */

const BASE = process.env.FAPSHI_BASE_URL ?? "https://live.fapshi.com";

export type FapshiStatus = "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";

export type FapshiTransaction = {
  transId: string;
  status: FapshiStatus;
  medium?: string;
  serviceName?: string;
  amount?: number;
  revenue?: number;
  payerName?: string;
  email?: string;
  redirectUrl?: string;
  externalId?: string;
  userId?: string;
  dateInitiated?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type InitiateResult = {
  message: string;
  link: string;
  transId: string;
  dateInitiated?: string;
};

function headers(): HeadersInit {
  const apiuser = process.env.FAPSHI_API_USER;
  const apikey = process.env.FAPSHI_API_KEY;
  if (!apiuser || !apikey) {
    throw new Error("FAPSHI_API_USER / FAPSHI_API_KEY are not set");
  }
  return { apiuser, apikey, "Content-Type": "application/json" };
}

export function isConfigured(): boolean {
  return Boolean(process.env.FAPSHI_API_USER && process.env.FAPSHI_API_KEY);
}

/**
 * Create a payment and get back a hosted checkout link.
 *
 * `amount` is a whole number of XAF — there are no minor units in this
 * currency, so 7500 means 7,500 FCFA. Fapshi enforces a 100 XAF minimum.
 *
 * `externalId` is our own reference. We send the anonymous `ref` from the
 * user's local state, which is how a completed payment gets tied back to a
 * device without ever asking for a name.
 */
export async function initiatePay(input: {
  amount: number;
  redirectUrl: string;
  externalId: string;
  userId?: string;
  email?: string;
  message?: string;
}): Promise<InitiateResult> {
  const body: Record<string, unknown> = {
    amount: Math.round(input.amount),
    redirectUrl: input.redirectUrl,
    externalId: input.externalId,
    message: input.message ?? "Metron",
  };
  // Only send optional fields when we actually have them — Fapshi validates
  // format on these and rejects empty strings.
  if (input.userId) body.userId = input.userId;
  if (input.email) body.email = input.email;

  const res = await fetch(`${BASE}/initiate-pay`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as Partial<InitiateResult> & {
    message?: string;
  };

  if (!res.ok || !json.link || !json.transId) {
    throw new Error(`Fapshi initiate-pay failed (${res.status}): ${json.message ?? "no link"}`);
  }
  return json as InitiateResult;
}

/**
 * Cameroonian mobile numbers are 9 digits beginning with 6, no country code.
 * Verified against Fapshi's own SDK, which rejects anything else client-side
 * before it ever reaches their API.
 */
export const PHONE_RE = /^6\d{8}$/;

/** MTN and Orange split by prefix. Cosmetic — we show him the right logo. */
export function operatorOf(phone: string): "mtn" | "orange" | null {
  if (!PHONE_RE.test(phone)) return null;
  const p = phone.slice(0, 3);
  const two = phone.slice(0, 2);
  if (two === "67" || two === "68" || ["650", "651", "652", "653", "654"].includes(p)) return "mtn";
  if (two === "69" || ["655", "656", "657", "658", "659"].includes(p)) return "orange";
  return null;
}

/**
 * Charge a Mobile Money number directly — no redirect, no hosted page.
 *
 * This is what makes checkout embedded: he types his number into our own UI,
 * Fapshi pushes a USSD prompt to his handset, he enters his PIN there, and we
 * poll payment-status until it settles. He never leaves the site, which on a
 * page about something he is embarrassed by matters more than usual.
 *
 * Fapshi's SDK enforces: amount is an integer >= 100, phone matches PHONE_RE.
 * We enforce the same here so a bad number fails instantly and locally rather
 * than after a round trip.
 */
export async function directPay(input: {
  amount: number;
  phone: string;
  externalId: string;
  userId?: string;
  name?: string;
  email?: string;
  medium?: "mobile money" | "orange money";
  message?: string;
}): Promise<{ transId: string; message?: string }> {
  const amount = Math.round(input.amount);
  if (!Number.isInteger(amount) || amount < 100) {
    throw new Error("amount must be an integer of at least 100 XAF");
  }
  if (!PHONE_RE.test(input.phone)) {
    throw new Error("invalid phone number");
  }

  const body: Record<string, unknown> = {
    amount,
    phone: input.phone,
    externalId: input.externalId,
    message: input.message ?? "Metron",
  };
  if (input.userId) body.userId = input.userId;
  if (input.name) body.name = input.name;
  if (input.email) body.email = input.email;
  if (input.medium) body.medium = input.medium;

  const res = await fetch(`${BASE}/direct-pay`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as { transId?: string; message?: string };
  if (!res.ok || !json.transId) {
    throw new Error(json.message ?? `direct-pay failed (${res.status})`);
  }
  return { transId: json.transId, message: json.message };
}

/**
 * Authoritative status check.
 *
 * This is the ONLY thing that may grant access. Webhook payloads are not
 * trusted — anyone who learns the webhook URL can POST to it, so the webhook
 * handler calls straight back here with the transId before doing anything.
 */
export async function paymentStatus(transId: string): Promise<FapshiTransaction | null> {
  const res = await fetch(`${BASE}/payment-status/${encodeURIComponent(transId)}`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  if (!json) return null;

  // The endpoint has returned both a bare object and a single-element array
  // depending on version — accept either rather than break on a deploy.
  const tx = (Array.isArray(json) ? json[0] : json) as FapshiTransaction | undefined;
  return tx?.transId ? tx : null;
}

export function isPaid(tx: FapshiTransaction | null): boolean {
  return tx?.status === "SUCCESSFUL";
}
