"use client";

import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getDay, getProtocol, totalDays } from "@/lib/content/protocol";
import { useMetron } from "@/components/useMetron";
import { isDone, toggleTask, tasksDone, streak } from "@/lib/store";
import { Onboarding } from "@/components/Onboarding";
import { SessionTimer } from "@/components/SessionTimer";
import { ScaleCard } from "@/components/ScaleCard";
import { sessionsFor, formatDuration, dayGate, completeDay } from "@/lib/store";
import { useState } from "react";

const KIND_LABEL: Record<string, { en: string; fr: string; tone: string }> = {
  reset: { en: "Reset", fr: "Remise à zéro", tone: "text-mute" },
  baseline: { en: "Measurement", fr: "Mesure", tone: "text-amber" },
  training: { en: "Training", fr: "Entraînement", tone: "text-jade" },
  rest: { en: "Rest", fr: "Repos", tone: "text-mute" },
  retest: { en: "Measurement", fr: "Mesure", tone: "text-amber" },
  review: { en: "Review", fr: "Bilan", tone: "text-amber" },
};

/** "4 cycles, 20-second holds" -> 4 */
function cycleCount(spec: string): number {
  const m = spec.match(/(\d+)/);
  return m ? Number(m[1]) : 3;
}

export function TodayClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const { state, mutate, ready } = useMetron(locale);
  const [rulesOpen, setRulesOpen] = useState(false);

  const protocol = getProtocol(locale);
  const day = getDay(locale, state.day) ?? protocol.days[0];
  const plan = state.plan ?? "test";
  const last = totalDays(plan);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-mute">{t.common.loading}</p>
      </div>
    );
  }

  // First run — orient him before dropping him on "Day 0: do nothing".
  if (!state.startedAt) {
    return <Onboarding locale={locale} onStart={(patch) => mutate((s) => ({ ...s, ...patch }))} />;
  }

  const done = tasksDone(state, day.day);
  const pct = day.tasks.length ? Math.round((done.length / day.tasks.length) * 100) : 0;
  const kind = KIND_LABEL[day.kind] ?? KIND_LABEL.training;
  // Medical tasks ("get your blood pressure checked") are advice, not homework,
  // so they never block progress.
  const requiredIds = day.tasks.filter((x) => x.kind !== "medical").map((x) => x.id);
  const gate = dayGate(state, day.day, requiredIds);
  const allDone = done.length === day.tasks.length && day.tasks.length > 0;

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      {/* ------------------------------------------------------- day header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${kind.tone}`}>
            {locale === "fr" ? kind.fr : kind.en}
          </p>
          <h1 className="mt-1.5 flex items-baseline gap-2.5 text-[1.7rem] font-semibold leading-tight tracking-tight md:text-[2.1rem]">
            <span className="metric text-jade">{t.common.day} {day.day}</span>
          </h1>
          <p className="mt-1 text-[1.05rem] leading-snug text-bone">{day.title}</p>
        </div>

        {/* completion ring */}
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <svg viewBox="0 0 36 36" className="absolute h-16 w-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-ink-600)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="var(--color-jade)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
              className="transition-all duration-500"
            />
          </svg>
          <span className="metric text-[13px] font-semibold text-bone">{pct}%</span>
        </div>
      </div>

      <p className="mt-4 text-[0.98rem] leading-relaxed text-jade-300">{day.focus}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-faint">
        <span className="rounded-full border border-ink-600 px-2.5 py-1">
          {t.common.day} {day.day} {t.common.of} {last}
        </span>
        {streak(state) > 1 && (
          <span className="rounded-full border border-ink-600 px-2.5 py-1 text-jade">
            {t.app.streak.replace("{n}", String(streak(state)))}
          </span>
        )}
        {day.phase && (
          <span className="rounded-full border border-ink-600 px-2.5 py-1">{day.phase}</span>
        )}
      </div>

      {/* ------------------------------------------------------------ brief */}
      <section className="mt-8 space-y-4">
        {day.brief.map((p, i) => (
          <p key={i} className="text-[1rem] leading-[1.75] text-mute">
            {p}
          </p>
        ))}
      </section>

      {/* ---------------------------------------------------------- session */}
      {day.session ? (
        <section className="mt-8 rounded-2xl border border-jade/30 bg-jade-050 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-jade">
            {t.app.session}
          </p>
          <h2 className="mt-2 text-[1.1rem] font-semibold leading-snug">{day.session.title}</h2>

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              [locale === "fr" ? "Durée" : "Duration", day.session.duration],
              [locale === "fr" ? "Plafond" : "Ceiling", day.session.ceiling],
              [locale === "fr" ? "Cycles" : "Cycles", day.session.cycles],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-ink-900/50 px-3 py-2.5">
                <dt className="text-[10.5px] uppercase tracking-wide text-faint">{k}</dt>
                <dd className="mt-0.5 text-[13px] leading-snug text-bone">{v}</dd>
              </div>
            ))}
          </dl>

          <ol className="mt-5 space-y-3">
            {day.session.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed text-mute">
                <span className="metric mt-0.5 w-5 shrink-0 text-[13px] font-semibold text-jade">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>

          <p className="mt-5 border-t border-jade/20 pt-4 text-[0.93rem] leading-relaxed text-bone">
            <span className="font-semibold">{locale === "fr" ? "Fin : " : "Ending: "}</span>
            {day.session.ending}
          </p>

          {day.session.guard && (
            <p className="mt-3 rounded-lg border-l-2 border-amber bg-amber-050 px-3 py-2.5 text-[0.9rem] leading-relaxed text-mute">
              {day.session.guard}
            </p>
          )}
        </section>
      ) : (
        <p className="mt-8 rounded-xl card px-4 py-3.5 text-[0.94rem] text-mute">
          {t.app.noSession}
        </p>
      )}

      {/* ------------------------------------------------------ the timer */}
      {day.session && (
        <section className="mt-4 space-y-4">
          {/* The scale first — he cannot use the timer without it. Full detail
              for the first three sessions, compact once he knows it. */}
          <ScaleCard locale={locale} compact={day.day > 4} />

          <SessionTimer
            locale={locale}
            day={day.day}
            targetCycles={cycleCount(day.session.cycles)}
            onSave={(log) =>
              mutate((s) => ({
                ...s,
                sessions: [...s.sessions, { ...log, id: crypto.randomUUID() }],
              }))
            }
          />

          {/* what he already did today */}
          {sessionsFor(state, day.day).length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {sessionsFor(state, day.day).map((sess, i) => (
                <li
                  key={sess.id}
                  className="flex items-center justify-between rounded-xl card px-4 py-3 text-[0.9rem]"
                >
                  <span className="text-mute">
                    {locale === "fr" ? "Séance" : "Session"} {i + 1} &middot;{" "}
                    {sess.cycles.length} {locale === "fr" ? "cycles" : "cycles"}
                  </span>
                  <span className="metric font-bold text-jade">
                    {formatDuration(sess.totalSeconds, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------ tasks */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            {t.app.todayTasks}
          </h2>
          <span className="text-[12px] tabular-nums text-faint">
            {t.app.completed
              .replace("{done}", String(done.length))
              .replace("{total}", String(day.tasks.length))}
          </span>
        </div>

        <ul className="mt-3 space-y-2">
          {day.tasks.map((task) => {
            const on = isDone(state, day.day, task.id);
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => mutate((s) => toggleTask(s, day.day, task.id))}
                  aria-pressed={on}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                    on
                      ? "border-jade/40 bg-jade-050"
                      : "border-ink-600 bg-ink-800 hover:border-ink-500"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition-colors ${
                      on ? "border-jade bg-jade" : "border-ink-500"
                    }`}
                  >
                    {on && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 text-ink-900" fill="none">
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-[0.96rem] leading-snug ${
                        on ? "text-mute line-through decoration-ink-500" : "text-bone"
                      }`}
                    >
                      {task.label}
                    </span>
                    {task.detail && (
                      <span className="mt-1 block text-[0.86rem] leading-relaxed text-faint">
                        {task.detail}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------ quick links */}
      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {day.lesson && (
          <Link
            href={`/${locale}/app/lessons/${day.lesson}`}
            className="rounded-xl card px-4 py-3.5 text-[0.95rem] font-medium text-bone hover:border-jade"
          >
            {t.cta.readLesson} →
          </Link>
        )}
        {(day.kind === "baseline" || day.kind === "retest") && (
          <Link
            href={`/${locale}/app/measure`}
            className="rounded-xl bg-jade px-4 py-3.5 text-center text-[0.95rem] font-semibold text-ink-900"
          >
            {day.day === 1 ? t.measure.recordBaseline : t.measure.recordRetest} →
          </Link>
        )}
        <Link
          href={`/${locale}/app/measure#markers`}
          className="rounded-xl card px-4 py-3.5 text-[0.95rem] font-medium text-bone hover:border-jade"
        >
          {t.measure.markers} →
        </Link>
      </div>

      {/* ------------------------------------------------------ daily rules */}
      <section className="mt-8 rounded-2xl card">
        <button
          type="button"
          onClick={() => setRulesOpen(!rulesOpen)}
          aria-expanded={rulesOpen}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-[0.98rem] font-semibold text-bone">{t.app.dailyRules}</span>
          <span
            aria-hidden
            className={`text-mute transition-transform ${rulesOpen ? "rotate-45" : ""}`}
          >
            +
          </span>
        </button>

        {rulesOpen && (
          <div className="border-t border-ink-700 px-5 py-4">
            <div className="space-y-3">
              {protocol.rulesIntro.map((p, i) => (
                <p key={i} className="text-[0.93rem] leading-relaxed text-faint">
                  {p}
                </p>
              ))}
            </div>
            <ul className="mt-5 space-y-4">
              {protocol.rules.map((r) => (
                <li key={r.id}>
                  <p className="text-[0.95rem] font-medium text-bone">{r.label}</p>
                  <p className="mt-1 text-[0.89rem] leading-relaxed text-mute">{r.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------- day nav */}
      {/* Advancing is gated twice: today's required work must be ticked, and
          at least 18 real hours must have passed since the previous day was
          finished. Otherwise a man taps through the whole programme in one
          evening, logs a flattering Day 12, and claims the refund. */}
      <div className="mt-8 border-t border-ink-700 pt-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={state.day <= 0}
            onClick={() => mutate((s) => ({ ...s, day: Math.max(0, s.day - 1) }))}
            className="rounded-full border border-ink-600 px-5 py-2.5 text-[14px] font-medium text-mute disabled:opacity-30"
          >
            ← {day.day > 0 ? `${t.common.day} ${day.day - 1}` : t.common.day}
          </button>

          <button
            type="button"
            disabled={state.day >= last || !gate.ok}
            onClick={() => mutate((s) => completeDay(s, day.day, last))}
            className={`rounded-full px-5 py-2.5 text-[14px] font-bold disabled:opacity-40 ${
              gate.ok ? "bg-jade text-ink-900" : "border border-ink-600 text-mute"
            }`}
          >
            {day.day < last
              ? `${t.app.nextUp}: ${t.common.day} ${day.day + 1}`
              : t.app.dayComplete.replace("{day}", String(day.day))}{" "}
            →
          </button>
        </div>

        {!gate.ok && (
          <div className="mt-3 rounded-xl border border-ink-600 bg-ink-850 px-4 py-3">
            <p className="text-[0.92rem] font-semibold text-bone">
              {gate.reason === "incomplete"
                ? t.app.gateIncomplete.replace("{n}", String(gate.missing))
                : t.app.gateTooSoon.replace("{n}", String(gate.hoursLeft))}
            </p>
            {gate.reason === "too-soon" && (
              <p className="mt-1.5 text-[0.86rem] leading-snug text-faint">{t.app.gateWhy}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
