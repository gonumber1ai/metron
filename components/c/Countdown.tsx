"use client";

import { useEffect, useState } from "react";

const KEY = "metron.c.deadline";
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
 * It counts down to a real thing. When it hits zero the timer disappears and
 * the page keeps selling at the same price — it is a nudge, not a price gate.
 * That is the honest version of this pattern: nothing is claimed that stops
 * being true at 00:00:00.
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
}: {
  label: string;
  hrs: string;
  mins: string;
  secs: string;
  compact?: boolean;
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

    const tick = () => setLeft(Math.max(0, deadline - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (left === null || left <= 0) return null;

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
            {label}
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
