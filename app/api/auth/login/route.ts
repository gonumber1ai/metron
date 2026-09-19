import { NextResponse } from "next/server";
import { checkPassword, findUserByPhone, issueSession, normalisePhone, sessionCookie, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { phone?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const phone = normalisePhone(body.phone ?? "");
  if (!phone) return NextResponse.json({ ok: false, error: "phone" }, { status: 400 });
  const user = await findUserByPhone(phone);
  // Same answer for a wrong number and a wrong password.
  if (!user || !checkPassword(body.password ?? "", user.password_hash)) {
    return NextResponse.json({ ok: false, error: "wrong" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, uid: user.id, lang: user.lang });
  res.cookies.set(sessionCookie, issueSession({ uid: user.id, phone, iat: Math.floor(Date.now() / 1000) }), sessionCookieOptions);
  return res;
}
