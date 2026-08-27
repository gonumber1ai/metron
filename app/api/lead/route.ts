import { NextResponse } from "next/server";
import { sendLeadAck, looksLikeEmail } from "@/lib/email/send";
import { recordLead } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Fallback capture for when neither payment rail is live yet.
 * Writes nothing to disk here — swap the body for a Supabase insert
 * (or a webhook to wherever you keep leads) once the project exists.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    contact: string;
    plan: string;
    ref: string;
    locale: string;
  };

  if (!body.contact || body.contact.trim().length < 4) {
    return NextResponse.json({ ok: false, error: "invalid contact" }, { status: 400 });
  }

  // TODO: persist. Deliberately not logging the contact value — this is the
  // one field in the whole product that identifies anybody.
  console.log(`[lead] plan=${body.plan} ref=${body.ref} locale=${body.locale}`);

  // Leads arrive as either an email or a phone number. Only the first can be
  // acknowledged here; phone leads are followed up on WhatsApp by hand.
  const contact = body.contact.trim();

  void recordLead({ contact, ref: body.ref, plan: body.plan, locale: body.locale ?? "en" });

  if (looksLikeEmail(contact)) {
    // Deliberately not awaited-and-surfaced: a mail failure must never turn
    // into a failed capture. Losing the lead is worse than losing the email.
    void sendLeadAck({ to: contact, locale: body.locale === "fr" ? "fr" : "en" });
  }

  return NextResponse.json({ ok: true });
}
