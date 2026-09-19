"use client";

import Link from "next/link";
import Image from "next/image";
import { useMetron } from "@/components/useMetron";
import { planOf, toProgress, isDone, toggleTask, completeDay, baseline } from "@/lib/store";
import { currentDay, dayState, hoursUntil, canLogMarkers } from "@/lib/gating";
import { getProgramDay, getProgram } from "@/lib/content/program";

/**
 * Today — Section 5.1, 5.4, 5.5.
 *
 * One primary action. Three checklist items, never more. The session is
 * one item however many steps it has inside. Rest days pre-check the first
 * item. A free man who has finished Day 1 sees the three ticks and the lock
 * on Day 2 — and still gets sleep and markers, which are his for good.
 */

const T = {
  en: {
    tasks: "Today's tasks",
    start: "Start today's session →",
    done: "Completed",
    first: "You've taken your first step.",
    locked2: "Day 2 is ready when you are.",
    locked2p: "Unlock to continue your training and build real progress.",
    unlock: "Unlock Days 2–10 →",
    wait: (n: number) => `Tomorrow opens in ${n}h`,
    waitWhy: "Days are 18 hours apart on purpose. If you rush them, your Day 12 number means nothing.",
    kegels: "Pelvic floor: 3 sets of 10, twice today",
    markers: "Log your daily markers →",
    markersWait: (n: number) => `You already logged today. Next one in ${n}h.`,
    d1: ["Breathing exercise", "Measurement", "Why you finish when you do"],
    read: (title: string, min: number) => `Read: ${title} (~${min} min)`,
    day: "Day",
  },
  fr: {
    tasks: "Les tâches du jour",
    start: "Commencer la séance du jour →",
    done: "Terminé",
    first: "Vous avez fait le premier pas.",
    locked2: "Le jour 2 vous attend.",
    locked2p: "Débloquez pour continuer l'entraînement et construire un vrai progrès.",
    unlock: "Débloquer les jours 2–10 →",
    wait: (n: number) => `Demain s'ouvre dans ${n}h`,
    waitWhy: "Les jours sont espacés de 18 heures exprès. Si vous les précipitez, votre chiffre du jour 12 ne veut rien dire.",
    kegels: "Plancher pelvien : 3 séries de 10, deux fois aujourd'hui",
    markers: "Noter vos marqueurs du jour →",
    markersWait: (n: number) => `Vous avez déjà noté aujourd'hui. Prochain dans ${n}h.`,
    d1: ["Exercice de respiration", "Mesure", "Pourquoi vous finissez quand vous finissez"],
    read: (title: string, min: number) => `Lire : ${title} (~${min} min)`,
    day: "Jour",
  },
} as const;

export function TodayClient({ locale }: { locale: string }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const { state, ready, mutate } = useMetron(locale);
  if (!ready) return <div className="grid min-h-[60vh] place-items-center text-white/40">…</div>;

  const plan = planOf(state);
  const prog = toProgress(state);
  const day = currentDay(plan, prog);
  const d = getProgramDay(locale, day);
  if (!d) return null;
  const st = dayState(day, plan, prog);
  const base = `/${locale}/app`;
  const lesson = d.lesson ? getProgram(locale).lessons.find((l) => l.slug === d.lesson) : undefined;

  const ticks = d.tasks.map((task) => Boolean(task.fixed) || isDone(state, day, task.key));
  const n = ticks.filter(Boolean).length;
  const day1Done = day === 1 && Boolean(baseline(state)) && Boolean(prog.completed[1]);
  const nextDay = day === 10 ? 12 : day + 1;
  const next = day1Done || day >= 30 ? null : dayState(nextDay, plan, prog);
  const mk = canLogMarkers(prog);

  function tick(key: string) {
    mutate((s) => {
      let out = toggleTask(s, day, key);
      const all = d!.tasks.every((task) => task.fixed || out.done[String(day)]?.includes(task.key));
      if (all && !out.dayCompletedAt[String(day)]) out = completeDay(out, day, 30);
      return out;
    });
  }

  return (
    <div className="relative min-h-[70vh] px-5 pt-6">
      <Image src="/app/door.jpg" alt="" fill priority sizes="640px" className="pointer-events-none -z-10 object-cover object-top opacity-[.22]" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-jade">{t.day} {day}</p>
          <h1 className="mt-1 text-[1.5rem] font-bold leading-tight text-bone">{day1Done ? t.done : d.title}</h1>
          <p className="mt-1.5 text-[0.95rem] text-white/70">{day1Done ? t.first : d.focus}</p>
        </div>
        <span className="metric text-[13px] text-white/40">{day1Done ? 3 : n}/3</span>
      </div>

      {day1Done && plan === "free" ? (
        <>
          <ul className="mt-6 space-y-2">
            {t.d1.map((s) => (
              <li key={s} className="flex items-center gap-3 rounded-xl border border-jade/25 bg-jade-050/40 px-4 py-3 text-[0.95rem] text-bone">
                <span className="text-jade">✓</span>
                {s}
              </li>
            ))}
          </ul>
          <section className="mt-6 rounded-2xl border border-jade/40 bg-black/50 p-5">
            <p className="text-[1.05rem] font-bold text-bone">🔒 {t.locked2}</p>
            <p className="mt-1.5 text-[0.92rem] text-white/70">{t.locked2p}</p>
            <Link href={`${base}/unlock`} className="btn-go mt-4 flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-[15px] font-bold">
              {t.unlock}
            </Link>
          </section>
        </>
      ) : (
        <>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{t.tasks}</p>
          <ul className="mt-2 space-y-2">
            {d.tasks.map((task, i) => {
              const on = ticks[i];
              const isSession = i === 0;
              return (
                <li key={task.key}>
                  <button
                    type="button"
                    disabled={Boolean(task.fixed) || isSession}
                    onClick={() => !isSession && tick(task.key)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left disabled:cursor-default ${
                      on ? "border-jade/30 bg-jade-050/40" : "border-white/10 bg-white/[.03]"
                    }`}
                  >
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-[11px] ${on ? "border-jade bg-jade text-black" : "border-white/25"}`}>
                      {on ? "✓" : ""}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.98rem] font-semibold text-bone">{task.label}</span>
                      {task.detail && <span className="block text-[0.85rem] text-white/55">{task.detail}</span>}
                      {isSession && lesson && !on && <span className="mt-1 block text-[0.82rem] text-jade/80">{t.read(lesson.title, lesson.minutes)}</span>}
                      {isSession && d.kegels && <span className="mt-1 block text-[0.82rem] text-white/50">{t.kegels}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {st.state === "open" && !ticks[0] && (
            <Link href={`${base}/day/${day}`} className="btn-go mt-6 flex w-full items-center justify-center rounded-xl px-5 py-4 text-[16px] font-bold">
              {t.start}
            </Link>
          )}
          {next?.state === "locked" && next.reason === "wait" && next.opensAt && (
            <p className="mt-5 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-[0.88rem] text-white/60">
              <b className="text-bone">{t.wait(hoursUntil(next.opensAt))}</b> · {t.waitWhy}
            </p>
          )}
        </>
      )}

      <Link href={`${base}/markers`} className="mt-6 block text-center text-[0.9rem] font-semibold text-jade underline-offset-4 hover:underline">
        {mk.ok ? t.markers : t.markersWait(hoursUntil(Date.now() + mk.nextIn))}
      </Link>
    </div>
  );
}
