"use client";

import { load, update } from "./store";

/**
 * Fire a funnel event.
 *
 * Never awaited and never allowed to throw: measurement must not be able to
 * break the thing it measures. Uses sendBeacon where available so an event
 * fired as he navigates away still arrives.
 *
 * ── WHAT WAS WRONG BEFORE ─────────────────────────────────────────────────
 * Events had a visitor and a name and nothing else. So a man who came back
 * the next day was indistinguishable from one who refreshed; a button was
 * identified by whatever string the page happened to pass; a retry or a
 * double-render wrote the same event twice; and nothing said which funnel he
 * was in, so a purchase could be attributed by guesswork. Every event now
 * carries:
 *
 *   session   one per tab-session (sessionStorage), so a return is a new one
 *   funnel    read from his state — decided on the landing page, not here
 *   page      the path it fired on
 *   cta       a stable id for the control, passed explicitly, never its text
 *   eid       a client-generated id the server treats as unique
 *
 * ── SESSIONS AND RETURNS ──────────────────────────────────────────────────
 * The first event of a tab-session also fires session_started, and — if this
 * device has seen the site in an earlier session — visitor_returned. That is
 * what "returned" means here: a new session on a known device. It is not a
 * claim to recognise him on a different phone; nothing here can.
 */

const SID_KEY = "metron.sid";
const SESSIONS_KEY = "metron.sessions";

function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

/** The tab-session id, minted on first use. Returns [id, isNew]. */
function session(): [string, boolean] {
  try {
    const have = window.sessionStorage.getItem(SID_KEY);
    if (have) return [have, false];
    const id = uuid();
    window.sessionStorage.setItem(SID_KEY, id);
    return [id, true];
  } catch {
    return ["nosession", false];
  }
}

/** How many sessions this device has had, incremented once per new session. */
function bumpSessions(): number {
  try {
    const n = Number(window.localStorage.getItem(SESSIONS_KEY) ?? "0") + 1;
    window.localStorage.setItem(SESSIONS_KEY, String(n));
    return n;
  } catch {
    return 1;
  }
}

let opened = false;

function post(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

export function track(
  name: string,
  detail?: string,
  locale = "en",
  opts: { cta?: string; funnel?: string } = {},
): void {
  try {
    const s = load(locale);
    const [sid, fresh] = session();
    const base = {
      ref: s.ref,
      locale,
      country: s.country,
      campaign: s.campaign,
      session: sid,
      funnel: opts.funnel ?? s.funnel,
      page: typeof location !== "undefined" ? location.pathname : undefined,
    };

    // The first event of a session opens it, and says whether he is back.
    if (fresh && !opened) {
      opened = true;
      const n = bumpSessions();
      post({ ...base, name: "session_started", detail: String(n), eid: uuid() });
      if (n > 1 || (s.firstSeen && Date.now() - Date.parse(s.firstSeen) > 30 * 60_000)) {
        post({ ...base, name: "visitor_returned", detail: String(n), eid: uuid() });
      }
    }

    post({ ...base, name, detail, cta: opts.cta, eid: uuid() });
  } catch {
    /* ignore */
  }
}

/** A button press. `cta` is the stable id; `detail` is free. */
export function tapped(cta: string, locale = "en", detail?: string): void {
  track("cta_clicked", detail ?? cta, locale, { cta });
}

/**
 * Called by a funnel landing page. Records which funnel this device is in —
 * last touch for pricing, first touch kept for attribution — and mirrors the
 * last one to a cookie the payment route can read.
 */
export function enterFunnel(funnelId: string, locale = "en"): void {
  update((s) => ({
    ...s,
    funnel: funnelId,
    firstFunnel: s.firstFunnel ?? funnelId,
    firstSeen: s.firstSeen ?? new Date().toISOString(),
  }), locale);
  try {
    document.cookie = `metron_funnel=${funnelId}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {}
}
