"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMetron } from "@/components/useMetron";
import { planOf, toProgress, toggleTask } from "@/lib/store";
import { dayState } from "@/lib/gating";
import { getProgramDay, getProgram } from "@/lib/content/program";
import { Retest } from "./Retest";
import { Day1 } from "./Day1";
import { track } from "@/lib/track";

/**
 * A day, run. Two shapes:
 *
 *   Day 1 — Section 5.2 as amended by Brief 2, in ./Day1.tsx. Ends at the
 *   paywall, not at Today. No 18-hour lock for a free man.
 *
 *   Days 2+ — Section 5.6. Lesson if there is one, two minutes of breathing,
 *   the session block from the source with an elapsed timer, then Complete.
 *
 * Days 12 and 30 are the retest, in ./Retest.tsx.
 */

const T = {
  en: {
    of: (n: number, total: number) => `${n}/${total}`,
    skip: "Skip",
    breatheH: "Breathe. Relax. Get ready.",
    breathe2P: "Two minutes. In through the nose for four, out through the mouth for six.",
    inhale: "Inhale", hold: "Hold", exhale: "Exhale",
    cont: "Continue →",
    lessonRead: "Mark as read →",
    sessionH: "The session",
    duration: "Duration", ceiling: "Ceiling", cycles: "Cycles", ending: "Ending", guard: "If it goes wrong",
    startTimer: "Start timer", elapsed: "Elapsed",
    complete: "Complete session →",
    locked: "This day is not open yet.",
    back: "← Today",
  },
  fr: {
    of: (n: number, total: number) => `${n}/${total}`,
    skip: "Passer",
    breatheH: "Respirez. Détendez-vous. Préparez-vous.",
    breathe2P: "Deux minutes. Inspirez par le nez sur quatre, expirez par la bouche sur six.",
    inhale: "Inspirez", hold: "Retenez", exhale: "Expirez",
    cont: "Continuer →",
    lessonRead: "Marquer comme lu →",
    sessionH: "La séance",
    duration: "Durée", ceiling: "Plafond", cycles: "Cycles", ending: "Fin", guard: "Si ça dérape",
    startTimer: "Lancer le chrono", elapsed: "Écoulé",
    complete: "Terminer la séance →",
    locked: "Ce jour n'est pas encore ouvert.",
    back: "← Aujourd'hui",
  },
} as const;

/* ── the circular breathing timer ─────────────────────────────────────── */
function Breath({ seconds, labels, onDone }: { seconds: number; labels: { inhale: string; hold: string; exhale: string }; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const done = useRef(false);
  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      const el = Math.floor((Date.now() - start) / 1000);
      const t = el % 12; // 4 in · 2 hold · 6 out
      setPhase(t < 4 ? "inhale" : t < 6 ? "hold" : "exhale");
      const l = Math.max(0, seconds - el);
      setLeft(l);
      if (l === 0 && !done.current) {
        done.current = true;
        window.clearInterval(id);
        onDone();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [seconds, onDone]);
  const r = 54, c = 2 * Math.PI * r, p = left / seconds;
  const m = Math.floor(left / 60), s = left % 60;
  return (
    <div className="mx-auto mt-8 grid place-items-center">
      <svg viewBox="0 0 128 128" className="h-44 w-44">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgb(255 255 255 / .1)" strokeWidth="6" />
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--color-jade)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform="rotate(-90 64 64)" style={{ transition: "stroke-dashoffset .25s linear" }} />
        <text x="64" y="60" textAnchor="middle" className="metric" fill="#fff" fontSize="22" fontWeight="700">{m}:{String(s).padStart(2, "0")}</text>
        <text x="64" y="80" textAnchor="middle" fill="var(--color-jade)" fontSize="11" fontWeight="700" letterSpacing="1.5">{labels[phase].toUpperCase()}</text>
      </svg>
    </div>
  );
}

/* ── the 1–10 scale, 6 = your stop, 9 = too late. Never places him. ───── */
function Scale({ stop, late }: { stop: string; late: string }) {
  return (
    <div className="my-6">
      <div className="relative h-3 rounded-full bg-gradient-to-r from-white/15 via-jade/70 to-alert" />
      <div className="relative mt-2 flex justify-between text-[11px] text-white/50">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`w-4 text-center ${i + 1 === 6 ? "font-bold text-jade" : i + 1 === 9 ? "font-bold text-alert" : ""}`}>{i + 1}</span>
        ))}
      </div>
      <div className="relative mt-1 h-5 text-[11px] font-bold">
        <span className="absolute -translate-x-1/2 text-jade" style={{ left: "55.5%" }}>{stop}</span>
        <span className="absolute -translate-x-1/2 text-alert" style={{ left: "88.9%" }}>{late}</span>
      </div>
    </div>
  );
}

export function DayClient({ locale, day }: { locale: string; day: number }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const router = useRouter();
  const { state, ready, mutate } = useMetron(locale);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const d = getProgramDay(locale, day);
  const lesson = d?.lesson ? getProgram(locale).lessons.find((l) => l.slug === d.lesson) : undefined;
  const base = `/${locale}/app`;

  useEffect(() => {
    if (!ready) return;
    track(day === 1 ? "day1_start" : "day_open", String(day), locale);
  }, [ready, day, locale]);

  useEffect(() => {
    if (elapsed === null) return;
    const start = Date.now();
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [elapsed === null]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready || !d) return <div className="grid min-h-[60vh] place-items-center text-white/40">…</div>;
  const st = dayState(day, planOf(state), toProgress(state));
  if (st.state === "locked") {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-white/70">{t.locked}</p>
        <button type="button" onClick={() => router.push(base)} className="mt-4 text-jade">{t.back}</button>
      </div>
    );
  }

  const Bar = ({ n, total }: { n: number; total: number }) => (
    <div className="flex items-center justify-between">
      <button type="button" onClick={() => router.push(base)} className="text-[13px] text-white/50">{t.back}</button>
      <span className="metric text-[13px] text-white/50">{t.of(n, total)}</span>
    </div>
  );
  const Btn = ({ label, onClick, ghost = false }: { label: string; onClick: () => void; ghost?: boolean }) => (
    <button type="button" onClick={onClick} className={ghost ? "mt-3 w-full py-2 text-center text-[13px] text-white/45" : "btn-go mt-6 flex w-full items-center justify-center rounded-xl px-5 py-4 text-[16px] font-bold"}>
      {label}
    </button>
  );

  /* ═══════════════════════════════════════════ DAY 12 · DAY 30 ═══ */
  if (day === 12 || day === 30) {
    return <Retest locale={locale} day={day} Breath={Breath} Bar={Bar} Btn={Btn} />;
  }

  /* ═══════════════════════════════════════════════════════ DAY 1 ═══ */
  if (day === 1) return <Day1 locale={locale} Breath={Breath} Scale={Scale} />;

  /* ═════════════════════════════════════════════════ DAYS 2+ ═══ */
  const steps = [lesson ? "lesson" : null, "breathe", d.session ? "session" : null].filter(Boolean) as string[];
  const cur = steps[step] ?? "done";
  const total = steps.length;
  const complete = () => {
    mutate((s) => {
      let out = toggleTask(s, day, "session");
      if (!out.done[String(day)]?.includes("session")) out = toggleTask(out, day, "session");
      return out;
    });
    track("session_complete", String(day), locale);
    router.push(base);
  };

  return (
    <div className="px-5 pt-5">
      <Bar n={Math.min(step + 1, total)} total={total} />
      <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.18em] text-jade">Day {day} · {d.title}</p>

      {cur === "lesson" && lesson && (
        <>
          <h1 className="mt-2 text-[1.4rem] font-bold text-bone">{lesson.title}</h1>
          {lesson.body.map((p, i) => <p key={i} className="mt-3 text-[0.98rem] leading-relaxed text-white/80">{p}</p>)}
          <Btn label={t.lessonRead} onClick={() => { mutate((s) => ({ ...s, readLessons: [...new Set([...s.readLessons, lesson.slug])] })); setStep(step + 1); }} />
        </>
      )}
      {cur === "breathe" && (
        <>
          <h1 className="mt-2 text-[1.4rem] font-bold text-bone">{t.breatheH}</h1>
          <p className="mt-2 text-[0.95rem] text-white/70">{t.breathe2P}</p>
          <Breath seconds={120} labels={{ inhale: t.inhale, hold: t.hold, exhale: t.exhale }} onDone={() => {}} />
          <Btn label={t.cont} onClick={() => setStep(step + 1)} />
        </>
      )}
      {cur === "session" && d.session && (
        <>
          <h1 className="mt-2 text-[1.4rem] font-bold text-bone">{d.session.title}</h1>
          {d.brief.map((p, i) => <p key={i} className="mt-3 text-[0.95rem] leading-relaxed text-white/75">{p}</p>)}
          <dl className="mt-5 grid grid-cols-3 gap-2 text-[0.85rem]">
            {[[t.duration, d.session.duration], [t.ceiling, d.session.ceiling], [t.cycles, d.session.cycles]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 p-3"><dt className="text-white/50">{k}</dt><dd className="mt-0.5 font-semibold text-bone">{v}</dd></div>
            ))}
          </dl>
          <ol className="mt-5 space-y-3">
            {d.session.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed text-white/85"><span className="metric shrink-0 font-bold text-jade">{i + 1}</span>{s}</li>
            ))}
          </ol>
          <p className="mt-5 rounded-xl border border-jade/30 bg-jade-050/40 px-4 py-3 text-[0.92rem] text-bone"><b>{t.ending}:</b> {d.session.ending}</p>
          {d.session.guard && <p className="mt-2 rounded-xl border border-amber/40 bg-amber-050 px-4 py-3 text-[0.9rem] text-white/85"><b>{t.guard}:</b> {d.session.guard}</p>}
          {elapsed === null ? (
            <Btn label={t.startTimer} onClick={() => setElapsed(0)} />
          ) : (
            <p className="metric mt-6 text-center text-[2rem] font-bold text-bone">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}<span className="ml-2 text-[12px] font-normal text-white/45">{t.elapsed}</span></p>
          )}
          <Btn label={t.complete} onClick={complete} />
        </>
      )}
      {cur === "done" && <Btn label={t.complete} onClick={complete} />}
    </div>
  );
}
