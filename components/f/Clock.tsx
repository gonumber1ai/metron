"use client";

import { useEffect, useState } from "react";

/**
 * The countdown. A display and nothing more — the deadline comes from the
 * server's offer row via useOffer, and this only draws the distance to it.
 * When it reaches zero it stays on screen at 00:00:00 with the label
 * switched: a timer that vanishes looks like a bug.
 */
export function Clock({
  until,
  label,
  expiredLabel,
  units,
  compact = false,
}: {
  until: number;
  label: string;
  expiredLabel: string;
  units: [string, string, string];
  compact?: boolean;
}) {
  const [left, setLeft] = useState(() => Math.max(0, until - Date.now()));
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, until - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [until]);

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
          <path d="M12 9.5V13l2.5 1.5M9.5 2.5h5M19 5l1.5 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        {!compact && (
          <p className="text-[9.5px] font-bold uppercase leading-none tracking-[0.1em] text-white/70">
            {expired ? expiredLabel : label}
          </p>
        )}
        <div className="flex items-end gap-1.5">
          {([[pad(h), units[0]], [pad(m), units[1]], [pad(s), units[2]]] as const).map(([v, unit], i) => (
            <span key={unit} className="flex items-end gap-1.5">
              {i > 0 && <span className="metric pb-[3px] text-[15px] font-bold text-lime/60">:</span>}
              <span className="text-center">
                <span className={`metric block font-bold text-lime ${compact ? "text-[15px]" : "text-[19px]"}`}>{v}</span>
                {!compact && (
                  <span className="block text-[8px] font-bold uppercase tracking-wide text-white/45">{unit}</span>
                )}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
