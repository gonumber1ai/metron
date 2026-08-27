"use client";

import { useEffect, useState } from "react";

/**
 * His two numbers, drawn.
 *
 * The result page used to open with three paragraphs. He has just spent two
 * minutes typing his own numbers in, and the first thing he should see is
 * those numbers — not prose about them. One short bar, one long bar, and the
 * empty stretch between them is the whole pitch made without a sentence.
 *
 * Both bars are scaled against the target, so the "now" bar is genuinely short
 * when the gap is wide. No invented figures anywhere: everything here is what
 * he answered.
 */
export function GapGauge({
  now,
  want,
  labelNow,
  labelWant,
  unit,
  gapLabel,
}: {
  now: number;
  want: number;
  labelNow: string;
  labelWant: string;
  unit: string;
  gapLabel: string;
}) {
  // Grow the bars in on mount. The movement is what makes the short one read
  // as short — a static pair of bars is just a chart.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setGrown(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  const top = Math.max(want, now, 1);
  const nowPct = Math.max((now / top) * 100, 6);
  const gap = Math.max(want - now, 0);

  return (
    <div className="rounded-2xl card p-5">
      <Row
        label={labelNow}
        value={now}
        unit={unit}
        pct={grown ? nowPct : 0}
        tone="amber"
      />
      <div className="mt-4">
        <Row
          label={labelWant}
          value={want}
          unit={unit}
          pct={grown ? 100 : 0}
          tone="jade"
        />
      </div>

      {gap > 0 && (
        <div className="mt-5 border-t border-ink-700 pt-4">
          <span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-faint">
            {gapLabel}
          </span>
          <span className="metric mt-2 block text-[2.6rem] font-bold text-bone">
            +{gap}
            <span className="ml-1.5 text-[0.9rem] font-medium text-faint">{unit}</span>
          </span>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  unit,
  pct,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  pct: number;
  tone: "amber" | "jade";
}) {
  const bar = tone === "jade" ? "bg-jade" : "bg-amber";
  const text = tone === "jade" ? "text-jade" : "text-amber";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-faint">
          {label}
        </span>
        <span className={`metric text-[1.65rem] font-bold ${text}`}>
          {value}
          <span className="ml-1.5 text-[0.85rem] font-medium text-faint">{unit}</span>
        </span>
      </div>
      <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-ink-850">
        <div
          className={`h-full rounded-full ${bar} transition-[width] duration-[900ms] ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
