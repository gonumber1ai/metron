import { NextResponse } from "next/server";
import { db } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Funnel beacon.
 *
 * Records an action he took, never a page he merely saw. We deliberately have
 * no analytics vendor on this product — adding one would mean handing a third
 * party a list of men who visited a sexual-health site — so this is the whole
 * of our measurement, and it stays on our own database.
 *
 * Only an allow-listed set of names is accepted, so a leaked endpoint cannot
 * be used to write arbitrary rows into the table.
 */
const ALLOWED = new Set([
  "quiz_start",
  "quiz_answer",
  "quiz_complete",
  "result_view",
  "offer_view",
  "login_view",
  /* The direct funnel. gate_* is the age gate the ads point at; start_cta
     carries WHICH button he pressed in `detail`, which is the only part of
     that page's measurement worth having. */
  "gate_view",
  "gate_pass",
  "start_view",
  "start_cta",
  "pay_attempt",
]);

export async function POST(req: Request) {
  let body: {
    ref?: string;
    name?: string;
    detail?: string;
    locale?: string;
    country?: string;
    campaign?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  if (!ALLOWED.has(name) || !ref) return NextResponse.json({ ok: true });

  const client = db();
  if (!client) return NextResponse.json({ ok: true });

  try {
    await client.from("events").insert({
      ref,
      name,
      detail: (body.detail ?? "").toString().slice(0, 40) || null,
      // Free text from a URL, so it is filtered to what an ad tag can
      // legitimately contain and capped. It ends up in a GROUP BY.
      campaign:
        (body.campaign ?? "").toString().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || null,
      locale: body.locale === "fr" ? "fr" : "en",
      country: (body.country ?? "").slice(0, 8) || null,
    });
  } catch {
    /* measurement must never break the funnel it is measuring */
  }
  // Always 200 and always fast — the client does not wait on this.
  return NextResponse.json({ ok: true });
}
