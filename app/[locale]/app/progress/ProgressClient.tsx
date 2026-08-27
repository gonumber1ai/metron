"use client";

import { getDict } from "@/lib/i18n";
import { useMetron } from "@/components/useMetron";
import { baseline, formatDuration, latest, type Markers } from "@/lib/store";

const MARKER_KEYS: (keyof Markers)[] = [
  "control",
  "erection",
  "energy",
  "sleep",
  "libido",
  "stomach",
  "stress",
];

export function ProgressClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const { state, ready } = useMetron(locale);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-mute">{t.common.loading}</p>
      </div>
    );
  }

  const b = baseline(state);
  const l = latest(state);
  const points = [...state.measurements].sort((a, b2) => a.day - b2.day);
  const logs = [...state.markerLogs].sort((a, b2) => a.day - b2.day);

  const delta = b && l && l.day !== b.day ? l.seconds - b.seconds : null;
  const pctChange = b && delta !== null ? Math.round((delta / b.seconds) * 100) : null;

  // Chart geometry
  const W = 320;
  const H = 140;
  const PAD = 8;
  const maxSec = Math.max(...points.map((p) => p.seconds), 60);
  const maxDay = 30;

  function x(day: number) {
    return PAD + (day / maxDay) * (W - PAD * 2);
  }
  function y(sec: number) {
    return H - PAD - (sec / maxSec) * (H - PAD * 2);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="text-[1.7rem] font-semibold tracking-tight">{t.progress.title}</h1>

      {/* -------------------------------------------------------- the number */}
      <section className="glow-jade mt-6 rounded-2xl card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          {t.progress.theNumber}
        </p>

        {l ? (
          <>
            <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
              <span className="metric text-[3.8rem] font-bold text-jade md:text-[4.8rem]">
                {formatDuration(l.seconds, locale)}
              </span>
              {delta !== null && (
                <span
                  className={`pb-3 text-[1.05rem] font-semibold ${
                    delta > 0 ? "text-jade-300" : delta < 0 ? "text-amber" : "text-mute"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {formatDuration(Math.abs(delta), locale)}
                  {pctChange !== null && ` (${pctChange > 0 ? "+" : ""}${pctChange}%)`}
                  <span className="ml-1.5 font-normal text-faint">{t.progress.vsBaseline}</span>
                </span>
              )}
            </div>

            {points.length > 1 && (
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="mt-6 w-full"
                role="img"
                aria-label={t.progress.theNumber}
              >
                {[0.25, 0.5, 0.75, 1].map((g) => (
                  <line
                    key={g}
                    x1={PAD}
                    x2={W - PAD}
                    y1={y(maxSec * g)}
                    y2={y(maxSec * g)}
                    stroke="var(--color-ink-600)"
                    strokeWidth="1"
                  />
                ))}
                <polyline
                  points={points.map((p) => `${x(p.day)},${y(p.seconds)}`).join(" ")}
                  fill="none"
                  stroke="var(--color-jade)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((p) => (
                  <g key={p.day}>
                    <circle cx={x(p.day)} cy={y(p.seconds)} r="4.5" fill="var(--color-jade)" />
                    <text
                      x={x(p.day)}
                      y={H - 1}
                      textAnchor="middle"
                      className="fill-[var(--color-faint)]"
                      style={{ fontSize: 9 }}
                    >
                      {t.common.day} {p.day}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </>
        ) : (
          <p className="mt-3 text-[0.95rem] text-mute">{t.progress.noData}</p>
        )}
      </section>

      {/* ---------------------------------------------------------- markers */}
      {logs.length > 0 && (
        <section className="mt-6 rounded-2xl card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            {t.progress.markersTrend}
          </p>

          <div className="mt-4 space-y-3.5">
            {MARKER_KEYS.map((k) => {
              const first = logs[0].markers[k];
              const lastVal = logs[logs.length - 1].markers[k];
              const diff = lastVal - first;
              return (
                <div key={k}>
                  <div className="flex items-center justify-between text-[0.9rem]">
                    <span className="text-mute">{t.measure[k]}</span>
                    <span className="tabular-nums text-bone">
                      {first} → {lastVal}
                      {diff !== 0 && (
                        <span className={diff > 0 ? "ml-2 text-jade" : "ml-2 text-amber"}>
                          {diff > 0 ? "+" : ""}
                          {diff}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    {logs.map((log) => (
                      <div
                        key={log.day}
                        title={`${t.common.day} ${log.day}: ${log.markers[k]}`}
                        className="flex h-6 flex-1 flex-col justify-end rounded-sm bg-ink-700"
                      >
                        <div
                          className="rounded-sm bg-jade transition-all"
                          style={{ height: `${(log.markers[k] / 5) * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- share */}
      <section className="mt-6 rounded-2xl card p-5">
        <p className="text-[0.98rem] font-semibold text-bone">{t.progress.shareTitle}</p>
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-mute">{t.progress.shareBody}</p>
      </section>
    </div>
  );
}
