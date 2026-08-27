import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase, server side only.
 *
 * This uses the SERVICE ROLE key, which bypasses row-level security entirely.
 * It must never be imported from a "use client" file and it must never be
 * exposed through an API response. Everything it touches — payments, leads —
 * is written on behalf of a man who has no account yet, which is exactly the
 * case RLS cannot express.
 *
 * ── WHY THIS EXISTS ──────────────────────────────────────────────────────
 * Entitlement is a signed cookie, and that works right up until the moment a
 * man's phone dies between paying and being redirected back. The provider's
 * webhook knows he paid; without a row to write it to, that knowledge is lost
 * and he has to message us to get in. This is that row.
 *
 * Everything degrades rather than breaks: if the keys are absent, `db()`
 * returns null and every caller carries on. A payment must never fail because
 * a database is unreachable.
 */

let cached: SupabaseClient | null = null;

export function db(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (cached) return cached;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export type Plan = "test" | "sprint";

/**
 * Record a confirmed payment.
 *
 * Idempotent on (provider, provider_txn) — the schema has a unique constraint,
 * and both the redirect path and the webhook will call this for the same
 * transaction, often within a second of each other.
 */
export async function recordPayment(input: {
  ref: string;
  provider: "fapshi" | "whop";
  providerTxn: string;
  plan: Plan;
  currency: string;
  amountMinor: number;
}): Promise<boolean> {
  const client = db();
  if (!client) return false;
  try {
    const { error } = await client.from("payments").upsert(
      {
        ref: input.ref,
        provider: input.provider,
        provider_txn: input.providerTxn,
        plan: input.plan,
        currency: input.currency,
        amount_minor: input.amountMinor,
        status: "paid",
      },
      { onConflict: "provider,provider_txn" },
    );
    if (error) {
      console.error("[supabase] recordPayment", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[supabase] recordPayment threw", err);
    return false;
  }
}

/**
 * Has this ref ever paid?
 *
 * Used by account recovery. Answering from our own table is faster and more
 * reliable than asking the provider, and it keeps working for a customer whose
 * transaction has aged out of a provider's lookup window.
 */
export async function findPaidByRef(
  ref: string,
): Promise<{ plan: Plan; providerTxn: string } | null> {
  const client = db();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("payments")
      .select("plan, provider_txn")
      .eq("ref", ref)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return { plan: data.plan as Plan, providerTxn: data.provider_txn as string };
  } catch {
    return null;
  }
}

/**
 * Record everything a man told us, at the moment he tried to pay.
 *
 * Keyed on `ref` so a device is one row that moves through stages rather than
 * a new row per attempt — otherwise a man who retries a failed payment three
 * times shows up in the admin view as four different people.
 *
 * Called before the payment is created, deliberately. The people worth chasing
 * are the ones who typed their details and then abandoned at the checkout
 * page, and they only exist in the data if we write before the money moves.
 */
export async function recordIntake(input: {
  ref: string;
  name?: string;
  contact?: string;
  phone?: string;
  plan?: string;
  locale: string;
  provider?: string;
  stage?: "lead" | "checkout_started" | "paid";
  quiz?: unknown;
}): Promise<boolean> {
  const client = db();
  if (!client) return false;
  try {
    const row: Record<string, unknown> = {
      ref: input.ref,
      locale: input.locale,
      stage: input.stage ?? "checkout_started",
      updated_at: new Date().toISOString(),
    };
    // Only overwrite what we were actually given, so a later stage cannot
    // blank a detail captured earlier.
    if (input.name) row.name = input.name;
    if (input.contact) row.contact = input.contact;
    if (input.phone) row.phone = input.phone;
    if (input.plan) row.plan = input.plan;
    if (input.provider) row.provider = input.provider;
    if (input.quiz) row.quiz = input.quiz;
    // `contact` is NOT NULL in the base schema; fall back to whatever we have.
    if (!row.contact) row.contact = input.phone ?? input.ref;

    const { error } = await client.from("leads").upsert(row, { onConflict: "ref" });
    if (error) {
      console.error("[supabase] recordIntake", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[supabase] recordIntake threw", err);
    return false;
  }
}

/**
 * Find a man's access code from the email he gave at checkout.
 *
 * Only returns one for somebody who actually paid — this is a recovery path,
 * not a way to discover whether an address is in the database.
 */
export async function findRefByContact(contact: string): Promise<string | null> {
  const client = db();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("leads")
      .select("ref")
      .ilike("contact", contact.trim())
      .eq("stage", "paid")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data?.ref) return null;
    return data.ref as string;
  } catch {
    return null;
  }
}

/** Capture a lead. Never throws — losing the lead is bad, breaking the page is worse. */
export async function recordLead(input: {
  contact: string;
  ref?: string;
  plan?: string;
  locale: string;
}): Promise<boolean> {
  const client = db();
  if (!client) return false;
  try {
    const { error } = await client.from("leads").insert({
      contact: input.contact,
      ref: input.ref ?? null,
      plan: input.plan ?? null,
      locale: input.locale,
    });
    if (error) {
      console.error("[supabase] recordLead", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
