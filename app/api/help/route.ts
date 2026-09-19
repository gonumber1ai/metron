import { NextResponse } from "next/server";
import { sendAdminAlert } from "@/lib/email/send";
import { db } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Help & Support. Emails the owner and records the request. The only
 * support surface in the app; there is no chat.
 */
export async function POST(req: Request) {
  let body: { category?: string; message?: string; contact?: string; locale?: string; ref?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const category = ["payment", "training", "account", "other"].includes(body.category ?? "") ? body.category! : "other";
  const message = (body.message ?? "").trim().slice(0, 4000);
  const contact = (body.contact ?? "").replace(/\D/g, "").slice(0, 15) || null;
  const ref = (body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64) || null;
  if (message.length < 5) return NextResponse.json({ ok: false }, { status: 400 });

  const client = db();
  if (client) {
    // Table from supabase/016_help.sql. A missing table must not lose the
    // request — the email below still goes.
    await client.from("help_requests").insert({ ref, category, message, contact, locale: body.locale === "fr" ? "fr" : "en", status: "open" }).then(() => {}, () => {});
  }
  void sendAdminAlert({
    subject: `Help · ${category}${contact ? ` · +237 ${contact}` : ""}`,
    lines: [`category  ${category}`, contact ? `whatsapp  +237 ${contact}` : "", ref ? `ref       ${ref}` : "", "", message].filter(Boolean),
  });
  return NextResponse.json({ ok: true });
}
