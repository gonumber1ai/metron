import { NextResponse } from "next/server";
import { createUser, issueSession, normalisePhone, sessionCookie, sessionCookieOptions } from "@/lib/auth";
import { db } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** WhatsApp number + password. Nothing else is asked, nothing else is stored. */
export async function POST(req: Request) {
  let body: { phone?: string; password?: string; locale?: string; ref?: string; campaign?: string; funnel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad" }, { status: 400 });
  }
  const phone = normalisePhone(body.phone ?? "");
  const password = body.password ?? "";
  if (!phone) return NextResponse.json({ ok: false, error: "phone" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ ok: false, error: "password" }, { status: 400 });

  const user = await createUser(phone, password, body.locale ?? "en");
  if (user === "exists") return NextResponse.json({ ok: false, error: "exists" }, { status: 409 });
  if (!user) return NextResponse.json({ ok: false, error: "db" }, { status: 503 });

  // The signup event, server-side, attributed to whatever the landing page
  // stamped on the device.
  const client = db();
  if (client) {
    await client
      .from("events")
      .insert({
        ref: user.id,
        name: "signup",
        detail: body.ref?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 64) || null,
        campaign: (body.campaign ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || null,
        funnel: (body.funnel ?? "").replace(/[^a-z0-9-]/g, "").slice(0, 16) || null,
        locale: user.lang,
        eid: `signup-${user.id}`,
      })
      .then(() => {}, () => {});
  }

  const res = NextResponse.json({ ok: true, uid: user.id });
  res.cookies.set(sessionCookie, issueSession({ uid: user.id, phone, iat: Math.floor(Date.now() / 1000) }), sessionCookieOptions);
  return res;
}
