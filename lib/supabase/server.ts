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
  /** Only set when he gave one instead of an email. See 010_whatsapp.sql. */
  whatsapp?: string;
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
    if (input.whatsapp) row.whatsapp = input.whatsapp;
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
 * How to reach a man who just paid.
 *
 * Read at the moment the sale alert is written, so the owner's phone shows the
 * WhatsApp number and the access code together and he can forward it in one
 * action. Never throws and never blocks: a missing contact detail must not be
 * able to fail a payment webhook.
 */
export async function contactForRef(
  ref: string,
): Promise<{ name?: string; contact?: string; whatsapp?: string } | null> {
  const client = db();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("leads")
      .select("name, contact, whatsapp")
      .eq("ref", ref)
      .maybeSingle();
    if (error || !data) return null;
    return {
      name: (data.name as string) || undefined,
      contact: (data.contact as string) || undefined,
      whatsapp: (data.whatsapp as string) || undefined,
    };
  } catch {
    return null;
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

/**
 * Mirror a customer's progress.
 *
 * His device stays the source of truth — the app must keep working with no
 * network — so this is a copy, not a dependency. What it buys: you can see
 * whether anyone is actually doing the programme, a man who clears his browser
 * does not lose his history, and the refund promise can be checked against
 * something.
 */
export async function saveProgress(input: {
  ref: string;
  plan?: string;
  day: number;
  startedAt?: string;
  measurements: unknown;
  sessions: unknown;
  markers: unknown;
}): Promise<boolean> {
  const client = db();
  if (!client) return false;
  try {
    const { error } = await client.from("progress").upsert(
      {
        ref: input.ref,
        plan: input.plan ?? null,
        day: input.day,
        started_at: input.startedAt ?? null,
        measurements: input.measurements ?? [],
        sessions: input.sessions ?? [],
        markers: input.markers ?? [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "ref" },
    );
    if (error) {
      console.error("[supabase] saveProgress", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Post a message into a customer's thread. */
export async function postMessage(input: {
  ref: string;
  sender: "user" | "coach";
  body: string;
}): Promise<boolean> {
  const client = db();
  if (!client) return false;
  try {
    const { error } = await client.from("threads").insert({
      ref: input.ref,
      sender: input.sender,
      body: input.body.slice(0, 4000),
      // A coach reply is read by definition; only his messages need chasing.
      read_by_admin: input.sender === "coach",
      // And the mirror: his own message is not something he needs told about,
      // but a coach message is, until he opens it.
      read_by_user: input.sender === "user",
    });
    if (error) {
      console.error("[supabase] postMessage", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Who should receive a broadcast.
 *
 * Returns the ref and the contact, because a broadcast may go to the app, to
 * email, or to both, and the two need different things. Rows with no usable
 * contact still come back — they get the in-app copy, which is the whole point
 * of having both channels.
 */
export async function audienceFor(
  audience: "all" | "paid" | "leads" | "inactive",
): Promise<{ ref: string; contact: string | null }[]> {
  const client = db();
  if (!client) return [];
  try {
    if (audience === "inactive") {
      // Paid, but never opened the app. The row worth chasing, and the reason
      // a broadcast tool is worth building at all.
      const { data } = await client
        .from("activity")
        .select("ref, contact, last_seen")
        .is("last_seen", null)
        .limit(2000);
      return (data ?? []).map((r) => ({
        ref: String(r.ref),
        contact: (r.contact as string | null) ?? null,
      }));
    }

    let q = client.from("leads").select("ref, contact, stage").limit(5000);
    if (audience === "paid") q = q.eq("stage", "paid");
    if (audience === "leads") q = q.neq("stage", "paid");

    const { data } = await q;
    // One row per ref: a man who came back and filled the form twice should
    // not get the same message twice.
    const seen = new Map<string, string | null>();
    for (const r of data ?? []) {
      const ref = String(r.ref ?? "");
      if (!ref) continue;
      if (!seen.has(ref) || !seen.get(ref)) {
        seen.set(ref, (r.contact as string | null) ?? null);
      }
    }
    return [...seen.entries()].map(([ref, contact]) => ({ ref, contact }));
  } catch {
    return [];
  }
}

/** Insert the same coach message into many threads in one round trip. */
export async function postToMany(refs: string[], body: string): Promise<number> {
  const client = db();
  if (!client || refs.length === 0) return 0;
  try {
    const rows = refs.map((ref) => ({
      ref,
      sender: "coach" as const,
      body: body.slice(0, 4000),
      read_by_admin: true,
      read_by_user: false,
    }));
    const { error } = await client.from("threads").insert(rows);
    if (error) {
      console.error("[supabase] postToMany", error.message);
      return 0;
    }
    return rows.length;
  } catch {
    return 0;
  }
}

/** Record what went out, so a send can be audited rather than reconstructed. */
export async function recordBroadcast(input: {
  audience: string;
  subject: string | null;
  body: string;
  viaApp: boolean;
  viaEmail: boolean;
  recipients: number;
  emailed: number;
}): Promise<void> {
  const client = db();
  if (!client) return;
  try {
    await client.from("broadcasts").insert({
      audience: input.audience,
      subject: input.subject,
      body: input.body.slice(0, 4000),
      via_app: input.viaApp,
      via_email: input.viaEmail,
      recipients: input.recipients,
      emailed: input.emailed,
    });
  } catch {
    /* the send already happened; losing the audit row must not fail it */
  }
}

/**
 * Every conversation, whether or not the man is a paid customer.
 *
 * The admin could only open a thread from the Customers tab, which reads the
 * `activity` view — and that view is gated on stage = 'paid'. So a message
 * from anyone whose payment had not reconciled, or who got into the app some
 * other way, was stored correctly and displayed nowhere. It looked exactly
 * like the message had never arrived.
 *
 * Grouped in JS rather than SQL because Supabase's REST layer has no DISTINCT
 * ON, and the alternative is another view to keep in step with this one.
 */
export async function allConversations(): Promise<
  {
    ref: string;
    last_body: string;
    last_sender: string;
    last_at: string;
    unread: number;
    total: number;
  }[]
> {
  const client = db();
  if (!client) return [];
  try {
    const { data } = await client
      .from("threads")
      .select("ref, sender, body, created_at, read_by_admin")
      .order("created_at", { ascending: false })
      .limit(1000);

    const byRef = new Map<string, {
      ref: string; last_body: string; last_sender: string; last_at: string;
      unread: number; total: number;
    }>();
    for (const row of data ?? []) {
      const ref = String(row.ref);
      const existing = byRef.get(ref);
      if (!existing) {
        // Rows arrive newest first, so the first one seen for a ref is its
        // latest message.
        byRef.set(ref, {
          ref,
          last_body: String(row.body ?? ""),
          last_sender: String(row.sender ?? ""),
          last_at: String(row.created_at ?? ""),
          unread: row.sender === "user" && !row.read_by_admin ? 1 : 0,
          total: 1,
        });
      } else {
        existing.total += 1;
        if (row.sender === "user" && !row.read_by_admin) existing.unread += 1;
      }
    }
    return [...byRef.values()].sort((a, b) => b.last_at.localeCompare(a.last_at));
  } catch {
    return [];
  }
}

/** How many coach messages he has not opened. Drives the badge in the header. */
export async function unreadForUser(ref: string): Promise<number> {
  const client = db();
  if (!client) return 0;
  try {
    const { count } = await client
      .from("threads")
      .select("id", { count: "exact", head: true })
      .eq("ref", ref)
      .eq("sender", "coach")
      .eq("read_by_user", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** He opened his messages; stop showing the badge. */
export async function markReadByUser(ref: string): Promise<void> {
  const client = db();
  if (!client) return;
  try {
    await client
      .from("threads")
      .update({ read_by_user: true })
      .eq("ref", ref)
      .eq("sender", "coach")
      .eq("read_by_user", false);
  } catch {
    /* a stale badge is not worth an error */
  }
}

export async function readThread(ref: string): Promise<
  { sender: string; body: string; created_at: string }[]
> {
  const client = db();
  if (!client) return [];
  try {
    const { data } = await client
      .from("threads")
      .select("sender, body, created_at")
      .eq("ref", ref)
      .order("created_at", { ascending: true })
      .limit(200);
    return (data ?? []) as { sender: string; body: string; created_at: string }[];
  } catch {
    return [];
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
