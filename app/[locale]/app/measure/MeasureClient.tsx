"use client";

import { useState } from "react";
import { getDict } from "@/lib/i18n";
import { useMetron } from "@/components/useMetron";
import { MeasureTimer } from "@/components/MeasureTimer";
import {
  baseline,
  retest,
  finalTest,
  formatDuration,
  type Markers,
  markerGate,
  type Mode,
} from "@/lib/store";

const MARKER_KEYS: (keyof Markers)[] = [
  "control",
  "erection",
  "energy",
  "sleep",
  "libido",
  "stress",
  "stomach",
];

const DEFAULT_MARKERS: Markers = {
  erection: 3,
  energy: 3,
  libido: 3,
  stress: 3,
  sleep: 3,
  stomach: 3,
  control: 3,
};

export function MeasureClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const { state, mutate, ready } = useMetron(locale);
  const fr = locale === "fr";

  const [open, setOpen] = useState(false);
  const [conds, setConds] = useState([false, false, false, false]);
  const [mode, setMode] = useState<Mode>("solo");
  const [markers, setMarkers] = useState<Markers>(DEFAULT_MARKERS);
  const [savedMarkers, setSavedMarkers] = useState(false);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-mute">{t.common.loading}</p>
      </div>
    );
  }

  const b = baseline(state);
  const r = retest(state);
  const f = finalTest(state);

  const targetDay = !b ? 1 : !r && state.day >= 12 ? 12 : !f && state.day >= 30 ? 30 : null;
  const lockedMode = b?.mode;
  const allConds = conds.every(Boolean);

  function record(seconds: number) {
    if (!targetDay) return;
    mutate((s) => ({
      ...s,
      measurements: [
        ...s.measurements.filter((m) => m.day !== targetDay),
        { day: targetDay, seconds, mode: lockedMode ?? mode, at: new Date().toISOString() },
      ],
    }));
    setOpen(false);
    setConds([false, false, false, false]);
  }

  function saveMarkers() {
    if (!mGate.ok) return;
    mutate((s) => ({
      ...s,
      markerLogs: [
        ...s.markerLogs.filter((l) => l.day !== s.day),
        { day: s.day, at: new Date().toISOString(), markers },
      ],
    }));
    setSavedMarkers(true);
    window.setTimeout(() => setSavedMarkers(false), 2000);
  }

  const delta = b && (f ?? r) ? (f ?? r)!.seconds - b.seconds : null;
  // One honest marker entry per day. Same reason as the day gate.
  const mGate = markerGate(state);

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="text-[1.7rem] font-bold tracking-tight">{t.measure.title}</h1>

      {/* ------------------------------------------------------ the numbers */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: `${t.common.day} 1`, sub: t.measure.baseline, m: b, day: 1 },
          { label: `${t.common.day} 12`, sub: t.measure.retest, m: r, day: 12 },
          { label: `${t.common.day} 30`, sub: fr ? "Final" : "Final", m: f, day: 30 },
        ].map((card) => (
          <div
            key={card.day}
            className={`rounded-2xl border p-4 ${
              card.m ? "border-jade/40 bg-jade-050" : "border-ink-700 bg-ink-800/40"
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
              {card.label}
            </p>
            {card.m ? (
              <>
                <p className="metric mt-1.5 text-[2.4rem] font-bold text-jade">
                  {formatDuration(card.m.seconds, locale)}
                </p>
                <p className="mt-0.5 text-[12px] text-faint">
                  {card.m.mode === "solo" ? t.measure.modeSolo : t.measure.modePartner}
                </p>
              </>
            ) : (
              <p className="mt-2 text-[0.88rem] text-faint">{t.measure.notYet}</p>
            )}
          </div>
        ))}
      </div>

      {delta !== null && (
        <div className="mt-3 rounded-2xl border border-jade bg-jade-050 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-jade">
            {t.measure.change}
          </p>
          <p className="metric mt-1 text-[2.6rem] font-bold text-bone">
            {delta > 0 ? "+" : ""}
            {formatDuration(Math.abs(delta), locale)}
          </p>
          <p className="mt-1 text-[0.95rem] text-mute">
            {delta > 15 ? t.measure.improved : delta < -15 ? t.measure.down : t.measure.noChange}
          </p>
        </div>
      )}

      {/* ---------------------------------------------------------- record */}
      {targetDay && (
        <section className="mt-6">
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full rounded-2xl btn-go py-5 text-[1.05rem] font-bold"
            >
              {targetDay === 1 ? t.measure.recordBaseline : t.measure.recordRetest}
            </button>
          ) : (
            <div className="space-y-4">
              {/* --- how to, in four steps --- */}
              <div className="rounded-2xl card p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
                  {t.measure.howTo}
                </p>
                <ol className="mt-3 space-y-2.5">
                  {[t.measure.step1, t.measure.step2, t.measure.step3, t.measure.step4].map(
                    (step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="metric grid h-6 w-6 shrink-0 place-items-center rounded-full bg-jade text-[13px] font-bold text-ink-900">
                          {i + 1}
                        </span>
                        <span className="text-[0.96rem] leading-snug text-bone">{step}</span>
                      </li>
                    ),
                  )}
                </ol>
                <p className="mt-4 rounded-xl border-l-2 border-amber bg-amber-050 px-3 py-2.5 text-[0.9rem] font-medium leading-snug text-bone">
                  {t.measure.whyNormal}
                </p>
              </div>

              {/* --- the 4 checks --- */}
              <div className="rounded-2xl card p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
                  {t.measure.conditions}
                </p>
                <p className="mt-1.5 text-[0.88rem] text-faint">{t.measure.confirmAll}</p>

                <ul className="mt-3 space-y-2">
                  {[t.measure.cond1, t.measure.cond2, t.measure.cond3, t.measure.cond4].map(
                    (c, i) => (
                      <li key={c}>
                        <button
                          type="button"
                          onClick={() =>
                            setConds((prev) => {
                              const next = [...prev];
                              next[i] = !next[i];
                              return next;
                            })
                          }
                          aria-pressed={conds[i]}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                            conds[i] ? "border-jade bg-jade-050" : "border-ink-600 bg-ink-900"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${
                              conds[i] ? "border-jade bg-jade" : "border-ink-500"
                            }`}
                          >
                            {conds[i] && (
                              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 text-ink-900" fill="none">
                                <path
                                  d="M2.5 6.2 4.8 8.5 9.5 3.8"
                                  stroke="currentColor"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span className="text-[0.96rem] font-medium leading-snug text-bone">
                            {c}
                          </span>
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* --- mode: solo first, it is what almost everyone does --- */}
              <div className="rounded-2xl card p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
                  {t.measure.mode}
                </p>
                {lockedMode ? (
                  <div className="mt-2.5 rounded-xl border border-amber/50 bg-amber-050 px-4 py-3">
                    <p className="text-[0.96rem] font-bold text-bone">
                      {lockedMode === "solo" ? t.measure.modeSolo : t.measure.modePartner}
                    </p>
                    <p className="mt-1 text-[0.88rem] leading-snug text-mute">
                      {t.measure.modeLocked}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2.5 flex gap-2">
                    {(["solo", "partner"] as Mode[]).map((mo) => (
                      <button
                        key={mo}
                        type="button"
                        onClick={() => setMode(mo)}
                        className={`flex-1 rounded-xl border px-4 py-3.5 text-[0.96rem] font-bold ${
                          mode === mo
                            ? "border-jade bg-jade-050 text-bone"
                            : "border-ink-600 bg-ink-900 text-mute"
                        }`}
                      >
                        {mo === "solo" ? t.measure.modeSolo : t.measure.modePartner}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* --- the timer, unlocked once the checks pass --- */}
              {allConds ? (
                <MeasureTimer locale={locale} onDone={record} />
              ) : (
                <div className="rounded-2xl border border-dashed border-ink-600 p-6 text-center">
                  <p className="text-[0.94rem] text-faint">{t.measure.confirmAll}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-xl border border-ink-600 py-3 text-[0.92rem] text-mute"
              >
                {t.nav.close}
              </button>
            </div>
          )}
        </section>
      )}

      {/* --------------------------------------------------------- markers */}
      <section id="markers" className="mt-10 scroll-mt-20">
        <h2 className="text-[1.15rem] font-bold tracking-tight">{t.measure.markers}</h2>
        <p className="mt-1 text-[0.88rem] text-faint">{t.measure.scale}</p>

        <div className="mt-4 space-y-2.5">
          {MARKER_KEYS.map((k) => (
            <div key={k} className="rounded-xl card px-4 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[0.95rem] font-medium text-bone">{t.measure[k]}</span>
                <span className="metric text-[1.1rem] font-bold text-jade">{markers[k]}</span>
              </div>
              <div className="mt-2.5 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${t.measure[k]}: ${n}`}
                    onClick={() => setMarkers((prev) => ({ ...prev, [k]: n }) as Markers)}
                    className={`h-10 flex-1 rounded-lg border-2 text-[13px] font-bold transition-colors ${
                      markers[k] >= n
                        ? "border-jade bg-jade-050 text-jade"
                        : "border-ink-600 bg-ink-900 text-faint"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={saveMarkers}
          disabled={!mGate.ok}
          className="mt-4 w-full rounded-2xl btn-go py-4 text-[1rem] font-bold disabled:opacity-40"
        >
          {savedMarkers ? t.cta.saved : `${t.cta.save} — ${t.common.day} ${state.day}`}
        </button>
        {!mGate.ok && mGate.reason === "too-soon" && (
          <p className="mt-2 text-center text-[0.86rem] text-faint">
            {t.app.markerTooSoon.replace("{n}", String(mGate.hoursLeft))}
          </p>
        )}
      </section>
    </div>
  );
}
