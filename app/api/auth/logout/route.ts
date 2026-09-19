import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/auth";
import { cookieName } from "@/lib/entitlement";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie, "", { path: "/", maxAge: 0 });
  res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
  return res;
}
