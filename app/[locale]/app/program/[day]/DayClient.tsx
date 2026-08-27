"use client";

import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getDay } from "@/lib/content/protocol";
import { useMetron } from "@/components/useMetron";
import { isDone, toggleTask, tasksDone } from "@/lib/store";

export function DayClient({ locale, day: dayNumber }: { locale: string; day: number }) {
  const t = getDict(locale);
  const { state, mutate, ready } = useMetron(locale);
  const day = getDay(locale, dayNumber);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-mute">{t.common.loading}</p>
      </div>
    );
  }

  if (!day) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <p className="text-mute">{t.app.lockedTitle}</p>
      </div>
    );
  }

  if (dayNumber > state.day) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10">
        <Link href={`/${locale}/app/program`} className="text-[13px] text-mute hover:text-bone">
          ← {t.nav.program}
        </Link>
        <div className="mt-6 rounded-2xl card p-6 text-center">
          <p className="text-[1.05rem] font-semibold text-bone">{t.app.lockedTitle}</p>
          <p className="mt-2 text-[0.94rem] text-mute">
            {t.app.lockedBody.replace("{day}", String(dayNumber))}
          </p>
        </div>
      </div>
    );
  }

  const done = tasksDone(state, day.day);

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <Link href={`/${locale}/app/program`} className="text-[13px] text-mute hover:text-bone">
        ← {t.nav.program}
      </Link>

      <header className="mt-5">
        <p className="metric text-[11px] font-semibold uppercase tracking-[0.14em] text-jade">
          {t.common.day} {day.day}
          {day.phase ? ` · ${day.phase}` : ""}
        </p>
        <h1 className="mt-2 text-[1.7rem] font-semibold leading-tight tracking-tight md:text-[2.1rem]">
          {day.title}
        </h1>
        <p className="mt-2 text-[0.98rem] text-jade-300">{day.focus}</p>
      </header>

      <section className="mt-7 space-y-4">
        {day.brief.map((p, i) => (
          <p key={i} className="text-[1rem] leading-[1.75] text-mute">
            {p}
          </p>
        ))}
      </section>

      {day.session && (
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
      )}

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
                    on ? "border-jade/40 bg-jade-050" : "border-ink-600 bg-ink-800"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border ${
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

      {day.lesson && (
        <Link
          href={`/${locale}/app/lessons/${day.lesson}`}
          className="mt-6 block rounded-xl card px-4 py-3.5 text-[0.95rem] font-medium text-bone hover:border-jade"
        >
          {t.cta.readLesson} →
        </Link>
      )}
    </div>
  );
}
