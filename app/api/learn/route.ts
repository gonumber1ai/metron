import { NextResponse } from "next/server";
import { recordLearnLead } from "@/lib/supabase/server";
import { sendAdminAlert } from "@/lib/email/send";

export const runtime = "nodejs";

const PHONE_RE = /^6\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Bootcamp signup. Name, number, email — saved, and the admin is mailed the
 * three of them so the "a representative will contact you" promise on the
 * page is something a person can actually keep, from a lock screen, while
 * the lead is still warm.
 */
export async function POST(req: Request) {
  let body: {
    name?: string;
    phone?: string;
    email?: string;
    locale?: string;
    ref?: string;
    campaign?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 80);
  const phone = (body.phone ?? "").replace(/\D/g, "");
  const email = (body.email ?? "").trim().slice(0, 120);
  const locale = body.locale === "fr" ? "fr" : "en";
  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64) || undefined;
  const campaign = (body.campaign ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || undefined;

  if (name.length < 2 || !PHONE_RE.test(phone) || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const saved = await recordLearnLead({ name, phone, email, locale, ref, campaign });
  if (!saved) {
    // Still alert — the mail is the fallback record if the database is down.
    console.error("[learn] lead not saved", { ref });
  }

  void sendAdminAlert({
    subject: `Bootcamp signup — ${name}`,
    lines: [
      `name      ${name}`,
      `whatsapp  +237 ${phone}`,
      `email     ${email}`,
      `language  ${locale}`,
      campaign ? `link      ${campaign}` : "",
      ref ? `ref       ${ref}` : "",
      "",
      "They were told a representative will contact them with the details.",
    ].filter(Boolean),
  });

  return NextResponse.json({ ok: true });
}
