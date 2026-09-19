import { NextResponse } from "next/server";
import { db } from "@/lib/supabase/server";

/**
 * Brief 2, 2.2 — "Remind me tonight".
 *
 * Stores when he asked to be reminded. Nothing reads it yet: the WhatsApp
 * `session_ready` template goes out from a scheduled job once the Cloud API
 * is approved (Section 14). Until then the row is the queue.
 */
export async function POST(req: Request) {
  let body: { ref?: string; at?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const ref = String(body.ref ?? "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  const at = Date.parse(String(body.at ?? ""));
  if (!ref || Number.isNaN(at)) return NextResponse.json({ ok: false }, { status: 400 });
  const client = db();
  if (!client) return NextResponse.json({ ok: true, stored: false });
  const { error } = await client.from("reminders").upsert(
    { ref, kind: "session_ready", at: new Date(at).toISOString(), locale: body.locale === "fr" ? "fr" : "en", status: "pending" },
    { onConflict: "ref,kind" },
  );
  return NextResponse.json({ ok: true, stored: !error });
}
