import crypto from "node:crypto";

/**
 * Proof of purchase, without a database.
 *
 * The client keeps `plan` in localStorage so the UI is instant, but that is a
 * convenience, not a permission — anyone can set it from devtools. The real
 * grant is this: an HttpOnly, signed cookie that only the server can mint, and
 * only after Fapshi's own payment-status endpoint has confirmed the payment.
 *
 * When Supabase lands, entitlement moves to a row in the database and this
 * becomes a session cookie instead. Until then it is a genuine gate rather
 * than a decoration, and it costs nothing to run.
 */

const COOKIE = "metron_ent";
const MAX_AGE = 60 * 60 * 24 * 365; // a year — the programme is not a subscription

export type Entitlement = {
  /** the anonymous device ref this was bought against */
  ref: string;
  plan: "test" | "sprint";
  /** Fapshi transId or Whop receipt id, so a refund can be traced back */
  txId: string;
  /** issued-at, seconds */
  iat: number;
};

function secret(): string {
  const s = process.env.ENTITLEMENT_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ENTITLEMENT_SECRET must be set and at least 32 chars");
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payload: string): string {
  return b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
}

export function issue(ent: Entitlement): string {
  const payload = b64url(Buffer.from(JSON.stringify(ent)));
  return `${payload}.${sign(payload)}`;
}

export function verify(token: string | undefined): Entitlement | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = sign(payload);
  // Constant-time compare — a plain !== leaks timing information.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as Entitlement;
  } catch {
    return null;
  }
}

export const cookieName = COOKIE;

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
