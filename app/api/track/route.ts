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
  /* He submitted Fapshi's own form and a prompt reached his handset. The
     only step between reaching the checkout and paying that we can see. */
  "pay_pushed",
  /* Fapshi's frame finished loading on his phone. The step between "the
     page around the frame rendered" and "he pushed", which were otherwise
     indistinguishable from a frame that never came up. */
  "checkout_form",
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
  /* Bootcamp signup form submitted and saved. */
  "learn_signup",
  /* He chose how to receive the programme and gave a number. detail = choice. */
  "delivery_pick",
  "pay_attempt",
  /* He pressed Pay with something missing. Separates "nobody wanted to buy"
     from "nobody could" — the distinction the disabled button was hiding. */
  "pay_blocked",
  /* ── the CRM set ───────────────────────────────────────────────────────
     session_started    first event of a tab-session; detail = session count
     visitor_returned   a new session on a device that has had one before
     page_view          a funnel page rendered
     cta_clicked        a control pressed; `cta` carries its stable id
     timer_started      the offer clock was created for this visitor
     timer_expired      the clock ran — written by the server, once
     last_chance_*      the recovery popup: shown, clicked, dismissed
     recovery_sent      a recovery message went out; detail = channel
     recovery_clicked   he arrived through a recovery link */
  "session_started",
  "visitor_returned",
  "page_view",
  "cta_clicked",
  "timer_started",
  "timer_expired",
  "last_chance_shown",
  "last_chance_clicked",
  "last_chance_dismissed",
  "recovery_sent",
  "recovery_clicked",
  /* He pressed play on a testimonial video; detail = which, cta = where. */
  "video_play",
]);

export async function POST(req: Request) {
  let body: {
    ref?: string;
    name?: string;
    detail?: string;
    locale?: string;
    country?: string;
    campaign?: string;
    session?: string;
    funnel?: string;
    page?: string;
    cta?: string;
    eid?: string;
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

  const clean = (v: unknown, re: RegExp, n: number) =>
    (v ?? "").toString().replace(re, "").slice(0, n) || null;

  const legacy = {
    ref,
    name,
    detail: (body.detail ?? "").toString().slice(0, 40) || null,
    // Free text from a URL, so it is filtered to what an ad tag can
    // legitimately contain and capped. It ends up in a GROUP BY.
    campaign: clean(body.campaign, /[^a-zA-Z0-9_-]/g, 40),
    locale: body.locale === "fr" ? "fr" : "en",
    country: (body.country ?? "").slice(0, 8) || null,
  };
  const full = {
    ...legacy,
    session: clean(body.session, /[^a-zA-Z0-9-]/g, 64),
    funnel: clean(body.funnel, /[^a-z0-9-]/g, 16),
    page: clean(body.page, /[^a-zA-Z0-9\/_-]/g, 80),
    cta: clean(body.cta, /[^a-zA-Z0-9_.-]/g, 40),
    eid: clean(body.eid, /[^a-zA-Z0-9-]/g, 64),
  };

  try {
    /* eid is unique, so a retry, a refresh or a double render that fires
       the same event twice lands once — the second is ignored, not errored. */
    const r = await client.from("events").upsert(full, { onConflict: "eid", ignoreDuplicates: true });
    if (r.error) {
      /* Migration 015 not run yet: the new columns do not exist. Write the
         old shape rather than lose the event — the live funnel must keep
         counting in the gap. */
      if (/column|schema cache|does not exist|eid/i.test(r.error.message)) {
        await client.from("events").insert(legacy);
      }
    }
  } catch {
    /* measurement must never break the funnel it is measuring */
  }
  // Always 200 and always fast — the client does not wait on this.
  return NextResponse.json({ ok: true });
}
