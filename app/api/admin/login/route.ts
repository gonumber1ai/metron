import { NextResponse } from "next/server";
import { passwordMatches, issueAdmin, adminCookie, adminCookieOptions, isConfigured } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isConfigured()) return new NextResponse("Not found", { status: 404 });

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // A deliberate pause on failure. It is one shared password behind a URL
  // nobody is told about, so the realistic attack is slow guessing, and this
  // makes that expensive without inconveniencing the one person who knows it.
  if (!passwordMatches(body.password ?? "")) {
    await new Promise((r) => setTimeout(r, 1200));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookie, issueAdmin(), adminCookieOptions);
  return res;
}
