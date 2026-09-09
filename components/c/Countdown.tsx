"use client";

import { useEffect, useState } from "react";

export const OFFER_KEY = "metron.c.deadline";
const KEY = OFFER_KEY;
const WINDOW_MS = 7 * 60 * 60 * 1000; // 7 hours

/**
 * The seven-hour offer clock.
 *
 * ── WHY IT PERSISTS ───────────────────────────────────────────────────────
 * A countdown that restarts on reload is a lie a man catches in one tap, and
 * the moment he catches it every other number on the page becomes suspect —
 * including the price and the results. So the deadline is written to
 * localStorage the first time he lands and read back on every visit after
 * that. Leave, come back, refresh, reopen tomorrow: it is the same clock, and
 * once it is gone it stays gone for him.
 *
 * ── AND WHY IT IS NOT A FAKE ──────────────────────────────────────────────
 * It counts down to a real thing: at zero the price on the page goes back to
 * 7 500, which is what the plan was listed at before. The clock is not
 * decoration and it is not a trick — the number it is protecting genuinely
 * changes, and it changes once, for him, and stays changed.
 *
 * Renders nothing at all until it has read localStorage, because the server
 * has no idea what his deadline is and rendering 07:00:00 first would flash
 * the wrong number on every load.
 */
export function Countdown({
  label,
  hrs,
  mins,
  secs,
  compact = false,
  expiredLabel = "OFFER EXPIRED",
}: {
  label: string;
  hrs: string;
  mins: string;
  secs: string;
  compact?: boolean;
  /** shown in place of `label` once the clock has run out */
  expiredLabel?: string;
}) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    let deadline: number;
    try {
      const saved = Number(window.localStorage.getItem(KEY));
      // A saved value in the future is his clock. Anything else — no value, a
      // corrupted one, or a deadline further out than the window could ever
      // be — starts a fresh one.
      if (Number.isFinite(saved) && saved > Date.now() && saved < Date.now() + WINDOW_MS + 60_000) {
        deadline = saved;
      } else if (Number.isFinite(saved) && saved > 0 && saved <= Date.now()) {
        deadline = saved; // already expired; stays expired
      } else {
        deadline = Date.now() + WINDOW_MS;
        window.localStorage.setItem(KEY, String(deadline));
      }
    } catch {
      // Private mode. Fall back to a session-only clock rather than breaking
      // the page — he still sees a real countdown, it just will not survive.
      deadline = Date.now() + WINDOW_MS;
    }

    // Mirror the deadline into a cookie. The checkout prices on the server,
    // which cannot see localStorage — so without this the page said 7 500
    // after expiry while the server still charged 2 500.
    try {
      document.cookie = `metron_offer_until=${deadline}; path=/; max-age=2592000; SameSite=Lax`;
    } catch {
      /* cookies blocked; the page still shows the right price */
    }

    const tick = () => setLeft(Math.max(0, deadline - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Null only while localStorage is still being read. Once the clock has run
  // out it stays on screen at 00:00:00 with the label switched to "expired" —
  // a timer that simply vanishes looks like a bug, and a visitor who watched
  // it count down deserves to see it hit zero rather than wonder where it went.
  if (left === null) return null;
  const expired = left <= 0;

  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-lime/35 bg-black/60 ${
        compact ? "px-3 py-1.5" : "px-4 py-2"
      }`}
    >
      <span aria-hidden className="text-lime">
        <svg viewBox="0 0 24 24" className={compact ? "h-5 w-5" : "h-6 w-6"} fill="none">
          <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 9.5V13l2.5 1.5M9.5 2.5h5M19 5l1.5 1.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <div>
        {!compact && (
          <p className="text-[9.5px] font-bold uppercase leading-none tracking-[0.1em] text-white/70">
            {expired ? expiredLabel : label}
          </p>
        )}
        <div className="flex items-end gap-1.5">
          {[
            [pad(h), hrs],
            [pad(m), mins],
            [pad(s), secs],
          ].map(([v, unit], i) => (
            <span key={unit} className="flex items-end gap-1.5">
              {i > 0 && (
                <span className="metric pb-[3px] text-[15px] font-bold text-lime/60">:</span>
              )}
              <span className="text-center">
                <span
                  className={`metric block font-bold text-lime ${
                    compact ? "text-[15px]" : "text-[19px]"
                  }`}
                >
                  {v}
                </span>
                {!compact && (
                  <span className="block text-[8px] font-bold uppercase tracking-wide text-white/45">
                    {unit}
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Has this man's seven hours run out?
 *
 * Reads the same stored deadline the clock does, so the two can never disagree.
 * Returns null until it has read localStorage — the server cannot know, and
 * rendering the discounted price and then swapping it a tick later is the
 * flicker that makes a price look made up.
 */
export function useOfferExpired(): boolean | null {
  const [expired, setExpired] = useState<boolean | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const saved = Number(window.localStorage.getItem(KEY));
        // No deadline yet means he has only just arrived: the offer is live.
        if (!Number.isFinite(saved) || saved <= 0) return false;
        return saved <= Date.now();
      } catch {
        return false;
      }
    };
    setExpired(read());
    const id = window.setInterval(() => setExpired(read()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return expired;
}
