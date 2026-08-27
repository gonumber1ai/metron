import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdmin, adminCookie } from "@/lib/admin";
import { audienceFor, postToMany, recordBroadcast } from "@/lib/supabase/server";
import { sendBroadcast, looksLikeEmail } from "@/lib/email/send";
import { isLocale, defaultLocale } from "@/lib/i18n";

export const runtime = "nodejs";
// Emails go out one at a time against a rate limit, so a large audience takes
// real seconds. The default serverless timeout would cut it off halfway and
// leave half the list messaged with no record of where it stopped.
export const maxDuration = 300;

type Audience = "all" | "paid" | "leads" | "inactive";
const AUDIENCES: Audience[] = ["all", "paid", "leads", "inactive"];

/**
 * Send one message to many people.
 *
 * Two channels, chosen independently:
 *
 *   in-app  — a coach message dropped into each man's thread. Private by
 *             construction: it is behind his login and shows only as a badge.
 *   email   — carries the actual text, which means the SUBJECT lands on a lock
 *             screen where someone else may read it. The admin screen says so.
 *
 * Order matters. The in-app copy is written first and in one round trip, so if
 * the email half fails partway nobody is missed in the app — the channel that
 * is guaranteed to reach a paying customer.
 */
export async function POST(req: Request) {
  const jar = await cookies();
  if (!verifyAdmin(jar.get(adminCookie)?.value)) {
    // 404, not 403: an admin endpoint should not confirm it exists.
    return new NextResponse("Not found", { status: 404 });
  }

  let body: {
    audience?: string;
    subject?: string;
    text?: string;
    viaApp?: boolean;
    viaEmail?: boolean;
    locale?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const audience = (body.audience ?? "") as Audience;
  const viaApp = body.viaApp !== false;
  const viaEmail = body.viaEmail === true;
  const locale = isLocale(body.locale ?? "") ? (body.locale as "en" | "fr") : defaultLocale;

  if (!text) {
    return NextResponse.json({ ok: false, error: "Write something first." }, { status: 400 });
  }
  if (text.length > 4000) {
    return NextResponse.json({ ok: false, error: "Too long — 4000 characters max." }, { status: 400 });
  }
  if (!AUDIENCES.includes(audience)) {
    return NextResponse.json({ ok: false, error: "Pick who it goes to." }, { status: 400 });
  }
  if (!viaApp && !viaEmail) {
    return NextResponse.json({ ok: false, error: "Pick at least one channel." }, { status: 400 });
  }
  if (viaEmail && !subject) {
    return NextResponse.json(
      { ok: false, error: "An email needs a subject line." },
      { status: 400 },
    );
  }

  const people = await audienceFor(audience);
  if (people.length === 0) {
    return NextResponse.json({ ok: true, recipients: 0, emailed: 0, note: "Nobody matched." });
  }

  let recipients = 0;
  if (viaApp) {
    recipients = await postToMany(
      people.map((p) => p.ref),
      text,
    );
  }

  let emailed = 0;
  const failed: string[] = [];
  if (viaEmail) {
    for (const person of people) {
      const to = person.contact ?? "";
      // Plenty of leads left a phone number rather than an email. Skipping is
      // correct — they still have the in-app copy if that channel was on.
      if (!looksLikeEmail(to)) continue;
      const ok = await sendBroadcast({ to, locale, subject, body: text });
      if (ok) emailed += 1;
      else failed.push(person.ref);
    }
  }

  await recordBroadcast({
    audience,
    subject: subject || null,
    body: text,
    viaApp,
    viaEmail,
    recipients: viaApp ? recipients : people.length,
    emailed,
  });

  return NextResponse.json({
    ok: true,
    matched: people.length,
    recipients,
    emailed,
    failed: failed.length,
  });
}
