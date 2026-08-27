import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie, "", { path: "/", maxAge: 0 });
  return res;
}
