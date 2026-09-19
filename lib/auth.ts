import crypto from "node:crypto";
import { db } from "@/lib/supabase/server";

/**
 * Accounts: a WhatsApp number and a password. No name, no email, nothing
 * else — Section 13 of the brief. OTP over WhatsApp replaces the password
 * the day the Cloud API is approved; until then a password is the only
 * second factor that needs no third party to deliver it.
 *
 * ── THE USER ID IS HIS REF ────────────────────────────────────────────────
 * Everything in the app — progress, measurements, markers, payments, the
 * entitlement cookie — is keyed by `ref`, the anonymous id the device
 * minted on first visit. On signup or login the client adopts the user id
 * as its ref, so all of that keys to the account instead of the phone it
 * happened to be created on. Log in on another phone, adopt the same id,
 * and the progress endpoint hands his history back.
 *
 * Passwords: scrypt with a per-user salt, compared in constant time.
 */

const COOKIE = "metron_session";
const SECRET = () => process.env.ENTITLEMENT_SECRET ?? "";

export type Session = { uid: string; phone: string; iat: number };

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return `s1$${salt}$${hash}`;
}

export function checkPassword(pw: string, stored: string): boolean {
  const [v, salt, hash] = stored.split("$");
  if (v !== "s1" || !salt || !hash) return false;
  const got = crypto.scryptSync(pw, salt, 64);
  const want = Buffer.from(hash, "hex");
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET()).update(payload).digest("base64url");
}

export function issueSession(s: Session): string {
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token: string | undefined): Session | null {
  if (!token || !SECRET()) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const a = Buffer.from(sig), b = Buffer.from(sign(payload));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return s.uid && s.phone ? s : null;
  } catch {
    return null;
  }
}

export const sessionCookie = COOKIE;
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

/** Cameroonian mobile: nine digits starting with 6. Stored as +237… */
export function normalisePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("237")) d = d.slice(3);
  return /^6\d{8}$/.test(d) ? `+237${d}` : null;
}

/** A user id that doubles as his ref: same alphabet the device mints. */
export function newUserId(): string {
  const b = crypto.randomBytes(9);
  return Array.from(b, (x) => x.toString(36).padStart(2, "0")).join("");
}

export type UserRow = { id: string; phone: string; password_hash: string; lang: string; region: string; pin_hash: string | null; created_at: string; deleted_at: string | null };

export async function findUserByPhone(phone: string): Promise<UserRow | null> {
  const client = db();
  if (!client) return null;
  const { data } = await client.from("users").select("*").eq("phone", phone).is("deleted_at", null).maybeSingle();
  return (data as UserRow | null) ?? null;
}

export async function createUser(phone: string, password: string, lang: string): Promise<UserRow | "exists" | null> {
  const client = db();
  if (!client) return null;
  const row = { id: newUserId(), phone, password_hash: hashPassword(password), lang: lang === "fr" ? "fr" : "en", region: "cm" };
  const { error } = await client.from("users").insert(row);
  if (error) return /duplicate|unique|23505/i.test(error.message) ? "exists" : null;
  return { ...row, pin_hash: null, created_at: new Date().toISOString(), deleted_at: null };
}
