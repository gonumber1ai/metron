import crypto from "node:crypto";

/**
 * Admin access.
 *
 * One shared password, exchanged for a signed cookie — the same HMAC scheme
 * the entitlement cookie uses. No accounts, no roles, no password reset: there
 * is exactly one administrator and building a user system for him would be
 * three days spent on a problem nobody has.
 *
 * What it does need is to be genuinely closed, because behind it sits every
 * customer's assessment answers. So: constant-time compare, HttpOnly cookie,
 * and a 404 rather than a 403 anywhere the door is refused, so a prober cannot
 * even confirm the page exists.
 */

const COOKIE = "metron_admin";
const MAX_AGE = 60 * 60 * 12; // half a day — short, it holds real data

type Session = { iat: number };

function secret(): string {
  const s = process.env.ADMIN_PASSWORD;
  if (!s || s.length < 12) {
    throw new Error("ADMIN_PASSWORD must be set and at least 12 characters");
  }
  return s;
}

export function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueAdmin(): string {
  const payload = Buffer.from(JSON.stringify({ iat: Math.floor(Date.now() / 1000) })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyAdmin(token: string | undefined): boolean {
  if (!token || !isConfigured()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return Math.floor(Date.now() / 1000) - s.iat < MAX_AGE;
  } catch {
    return false;
  }
}

/** Constant-time password check, so a wrong guess reveals nothing by timing. */
export function passwordMatches(given: string): boolean {
  if (!isConfigured()) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(process.env.ADMIN_PASSWORD!);
  if (a.length !== b.length) {
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export const adminCookie = COOKIE;
export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
