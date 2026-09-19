"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMetron } from "@/components/useMetron";
import { planOf, toggleTask, completeDay, baseline, estimate, type Mode, type Gap, type EstimateBucket, type Measurement } from "@/lib/store";
import { getProgram } from "@/lib/content/program";
import { BUCKETS, bucketSeconds, aboutLabel } from "@/lib/estimate";
import { mmss } from "@/lib/format";
import { MeasureTimer } from "@/components/MeasureTimer";
import { track } from "@/lib/track";

/**
 * Day 1 — main brief 5.2 as amended by Brief 2.
 *
 * Order (Brief 2, 2.1): setup → measurement → result → the scale lesson →
 * two minutes of breathing, skippable. The breathing used to open the day;
 * three minutes of "inhale" between a man and the thing he came for was
 * friction, so it closes it instead.
 *
 * The estimate path (Brief 2, 1): a man who cannot measure right now picks
 * a bucket. It unlocks everything a measurement does — result, lesson,
 * paywall, payment — except Day 2 itself, which waits for the real number.
 * He can estimate once. Back on this screen with an estimate and no
 * measurement, he gets the measurement and one line saying so.
 *
 * "Remind me tonight" (Brief 2, 2.2) stores the time and sends him to
 * Today. The WhatsApp send behind it waits on the Cloud API.
 */

const T = {
  en: {
    of: (n: number, total: number) => `${n}/${total}`,
    back: "← Today",
    skip: "Skip",
    setupH: "Your measurement",
    setupP: "Two quick questions first. They let you compare fairly on Day 12.",
    how: "How will you do it?", solo: "On my own (solo)", partner: "With a partner",
    since: "How long since you last finished?", today: "Today", yesterday: "Yesterday", twoPlus: "2+ days",
    cont: "Continue →",
    cantH: "Can't measure right now?",
    estBtn: "I'll estimate for today",
    remindBtn: "Remind me tonight",
    already: "You already estimated. Take the real one — about 5 minutes.",
    estH: "Roughly how long do you last?",
    estP: "A guess is enough for tonight.",
    remindH: "What time tonight?",
    remindP: "Your first session takes about 5 minutes.",
    remindSet: "Set reminder →",
    timerP: "Do it normally. Don't hold back. Don't use any technique.",
    timerInfo: "This is not a test. It's your starting point. An honest number helps you see real progress.",
    numberH: "Your number today",
    thats: "That's your number today.",
    notJudge: "It's not a judgment. It's the thing you're going to change.",
    method: "Method", last: "Last time",
    nextMeans: (n: string) => `Why it's ${n} →`,
    // 1.3 — the estimate result
    estThink: (a: string) => `You think it's ${a}.`,
    estTruth: "Day 1 tells you the truth. Most men have never measured it.",
    estWhy: (a: string) => `Why it's ${a} →`,
    meansH: "Why you finish when you do",
    scaleStop: "your stop", scaleLate: "too late",
    close: (n: string) => [
      `You finish at ${n} because you notice you're close at 9. By then it's already decided.`,
      "Men who last notice at 6. That's not talent. It's a skill, and it's trained in about 15 minutes a day.",
      "Day 2 is where you learn to feel 6.",
    ],
    next: "Next →",
    breatheH: "Before you go: 2 minutes.",
    breatheP: "In through the nose for four, out through the mouth for six. Then Day 2.",
    inhale: "Inhale", hold: "Hold", exhale: "Exhale",
    openDay2: "Open Day 2 →",
    doneH: "Day 1 — done.",
    yourNumber: "Your number:",
  },
  fr: {
    of: (n: number, total: number) => `${n}/${total}`,
    back: "← Aujourd'hui",
    skip: "Passer",
    setupH: "Votre mesure",
    setupP: "Deux questions rapides d'abord. Elles servent à comparer honnêtement au jour 12.",
    how: "Comment allez-vous le faire ?", solo: "Seul", partner: "Avec une partenaire",
    since: "Depuis combien de temps avez-vous fini pour la dernière fois ?", today: "Aujourd'hui", yesterday: "Hier", twoPlus: "2 jours ou plus",
    cont: "Continuer →",
    cantH: "Vous ne pouvez pas mesurer maintenant ?",
    estBtn: "J'estime pour aujourd'hui",
    remindBtn: "Me rappeler ce soir",
    already: "Vous avez déjà estimé. Faites la vraie mesure — environ 5 minutes.",
    estH: "En gros, combien de temps tenez-vous ?",
    estP: "Une estimation suffit pour ce soir.",
    remindH: "À quelle heure ce soir ?",
    remindP: "Votre première séance prend environ 5 minutes.",
    remindSet: "Programmer le rappel →",
    timerP: "Faites-le normalement. Ne vous retenez pas. N'utilisez aucune technique.",
    timerInfo: "Ce n'est pas un test. C'est votre point de départ. Un chiffre honnête vous permet de voir de vrais progrès.",
    numberH: "Votre chiffre aujourd'hui",
    thats: "C'est votre chiffre aujourd'hui.",
    notJudge: "Ce n'est pas un jugement. C'est la chose que vous allez changer.",
    method: "Méthode", last: "Dernière fois",
    nextMeans: (n: string) => `Pourquoi c'est ${n} →`,
    estThink: (a: string) => `Vous pensez que c'est ${a}.`,
    estTruth: "Le jour 1 vous dit la vérité. La plupart des hommes ne l'ont jamais mesuré.",
    estWhy: (a: string) => `Pourquoi c'est ${a} →`,
    meansH: "Pourquoi vous finissez quand vous finissez",
    scaleStop: "votre arrêt", scaleLate: "trop tard",
    close: (n: string) => [
      `Vous finissez à ${n} parce que vous remarquez que vous êtes proche à 9. À ce moment-là, c'est déjà décidé.`,
      "Les hommes qui tiennent le remarquent à 6. Ce n'est pas un talent. C'est une compétence, et elle s'entraîne en 15 minutes par jour environ.",
      "Le jour 2, vous apprenez à sentir 6.",
    ],
    next: "Suite →",
    breatheH: "Avant de partir : 2 minutes.",
    breatheP: "Inspirez par le nez sur quatre, expirez par la bouche sur six. Ensuite, le jour 2.",
    inhale: "Inspirez", hold: "Retenez", exhale: "Expirez",
    openDay2: "Ouvrir le jour 2 →",
    doneH: "Jour 1 — fait.",
    yourNumber: "Votre chiffre :",
  },
} as const;

type Step = "setup" | "estimate" | "remind" | "measure" | "result" | "lesson" | "breathe";
const TOTAL = 5;
const BAR: Record<Step, number> = { setup: 1, estimate: 2, remind: 1, measure: 2, result: 3, lesson: 4, breathe: 5 };

/** "21:30" today in local time, or tomorrow if that has already passed. */
function tonightAt(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  const d = new Date();
  d.setHours(h || 21, m || 30, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

export function Day1({ locale, Breath, Scale }: {
  locale: string;
  Breath: React.ComponentType<{ seconds: number; labels: { inhale: string; hold: string; exhale: string }; onDone: () => void }>;
  Scale: React.ComponentType<{ stop: string; late: string }>;
}) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const router = useRouter();
  const { state, ready, mutate } = useMetron(locale);
  const [step, setStep] = useState<Step>("setup");
  const [mode, setMode] = useState<Mode | null>(null);
  const [gap, setGap] = useState<Gap | null>(null);
  const [bucket, setBucket] = useState<EstimateBucket | null>(null);
  const [time, setTime] = useState("21:30");
  const [result, setResult] = useState<Measurement | null>(null);
  // set when the real number lands on top of an estimate — the store flips
  // to "real" the moment it saves, so this is remembered here
  const [postEstimate, setPostEstimate] = useState(false);
  const base = `/${locale}/app`;
  const lesson = getProgram(locale).lessons.find((l) => l.slug === "why-you-finish-fast");

  useEffect(() => {
    if (ready) track("day1_start", undefined, locale);
  }, [ready, locale]);
  if (!ready) return <div className="grid min-h-[60vh] place-items-center text-white/40">…</div>;

  const plan = planOf(state);
  const b = baseline(state);
  const est = estimate(state);
  const afterEstimate = Boolean(est) && !b; // Brief 2, 1.5
  const isEstimate = result?.kind === "estimate";

  const Bar = ({ n }: { n: number }) => (
    <div className="flex items-center justify-between">
      <button type="button" onClick={() => router.push(base)} className="text-[13px] text-white/50">{t.back}</button>
      <span className="metric text-[13px] text-white/50">{t.of(n, TOTAL)}</span>
    </div>
  );
  const Btn = ({ label, onClick, ghost = false }: { label: string; onClick: () => void; ghost?: boolean }) => (
    <button type="button" onClick={onClick} className={ghost ? "mt-3 w-full py-2 text-center text-[13px] text-white/45" : "btn-go mt-6 flex w-full items-center justify-center rounded-xl px-5 py-4 text-[16px] font-bold"}>
      {label}
    </button>
  );
  const pick = (on: boolean) => `rounded-xl border px-3 py-3 text-[0.95rem] font-semibold ${on ? "border-jade bg-jade-050 text-bone" : "border-white/12 text-white/75"}`;

  /* Day 1 already measured and closed: nothing to redo. */
  if (b && state.dayCompletedAt["1"] && !result) {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-[1.2rem] font-bold text-bone">{t.doneH}</p>
        <p className="mt-2 text-white/70">{t.yourNumber} <span className="metric text-[1.4rem] font-bold text-bone">{mmss(b.seconds)}</span></p>
        <Btn label={t.back} onClick={() => router.push(base)} />
      </div>
    );
  }

  const saveMeasure = (secs: number) => {
    const m: Measurement = { day: 1, seconds: secs, mode: mode!, gap: gap!, at: new Date().toISOString() };
    setResult(m);
    setPostEstimate(afterEstimate);
    mutate((s) => ({ ...s, measurements: [...s.measurements.filter((x) => !(x.day === 1 && x.kind !== "estimate")), m], reminder: undefined }));
    track("day1_measured", String(secs), locale);
    if (afterEstimate && plan !== "free") track("day1_measured_after_pay", String(secs), locale);
    setStep("result");
  };

  const saveEstimate = () => {
    if (!bucket) return;
    const m: Measurement = { day: 1, seconds: bucketSeconds(bucket), kind: "estimate", bucket, at: new Date().toISOString() };
    setResult(m);
    mutate((s) => ({ ...s, measurements: [...s.measurements.filter((x) => x.kind !== "estimate"), m], reminder: undefined }));
    track("day1_estimate", bucket, locale);
    setStep("result");
  };

  const setReminder = () => {
    const at = tonightAt(time);
    mutate((s) => ({ ...s, reminder: { at: at.toISOString(), setAt: new Date().toISOString() } }));
    track("day1_reminder_set", time, locale);
    fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: state.ref, at: at.toISOString(), locale, kind: "session_ready" }),
      keepalive: true,
    }).catch(() => {});
    router.push(base);
  };

  /* Day 1 closes: the session ticked, the day completed, then the paywall
     for a free man or Today for a paid one. */
  const finish = () => {
    mutate((s) => {
      let out = s;
      if (!out.done["1"]?.includes("session")) out = toggleTask(out, 1, "session");
      if (!out.dayCompletedAt["1"]) out = completeDay(out, 1, 30);
      return out;
    });
    track("day1_lesson_done", isEstimate ? "estimate" : "real", locale);
    router.push(plan === "free" ? `${base}/unlock` : base);
  };

  const gapLabel = (g: Gap | null | undefined) => (g === "today" ? t.today : g === "yesterday" ? t.yesterday : t.twoPlus);
  const about = aboutLabel(result?.bucket, locale);

  return (
    <div className="px-5 pt-5">
      {step === "setup" && (<>
        <Bar n={BAR.setup} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.setupH}</h1>
        <p className="mt-2 text-[0.95rem] text-white/70">{afterEstimate ? t.already : t.setupP}</p>
        <p className="mt-6 text-[12px] font-bold uppercase tracking-wide text-white/50">{t.how}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["solo", "partner"] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={pick(mode === m)}>{m === "solo" ? t.solo : t.partner}</button>
          ))}
        </div>
        <p className="mt-5 text-[12px] font-bold uppercase tracking-wide text-white/50">{t.since}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["today", "yesterday", "2plus"] as Gap[]).map((g) => (
            <button key={g} type="button" onClick={() => setGap(g)} className={pick(gap === g).replace("px-3", "px-2")}>{gapLabel(g)}</button>
          ))}
        </div>
        {mode && gap && <Btn label={t.cont} onClick={() => { track("day1_measure_setup", `${mode}/${gap}`, locale); setStep("measure"); }} />}

        {!afterEstimate && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <p className="text-[0.95rem] font-bold text-bone">{t.cantH}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStep("estimate")} className="rounded-xl border border-jade/50 px-3 py-3 text-[0.9rem] font-semibold text-jade">{t.estBtn}</button>
              <button type="button" onClick={() => setStep("remind")} className="rounded-xl border border-white/15 px-3 py-3 text-[0.9rem] font-semibold text-white/80">{t.remindBtn}</button>
            </div>
          </div>
        )}
      </>)}

      {step === "estimate" && (<>
        <Bar n={BAR.estimate} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.estH}</h1>
        <p className="mt-2 text-[0.95rem] text-white/70">{t.estP}</p>
        <div className="mt-5 grid gap-2">
          {BUCKETS.map((k) => (
            <button key={k.id} type="button" onClick={() => setBucket(k.id)} className={pick(bucket === k.id) + " text-left"}>{locale === "fr" ? k.fr : k.en}</button>
          ))}
        </div>
        {bucket && <Btn label={t.cont} onClick={saveEstimate} />}
        <Btn label={t.back.replace("← ", "")} ghost onClick={() => setStep("setup")} />
      </>)}

      {step === "remind" && (<>
        <Bar n={BAR.remind} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.remindH}</h1>
        <p className="mt-2 text-[0.95rem] text-white/70">{t.remindP}</p>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value || "21:30")} className="metric mt-6 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-[1.6rem] font-bold text-bone focus:border-jade focus:outline-none" />
        <Btn label={t.remindSet} onClick={setReminder} />
        <Btn label={t.back.replace("← ", "")} ghost onClick={() => setStep("setup")} />
      </>)}

      {step === "measure" && (<>
        <Bar n={BAR.measure} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.setupH}</h1>
        <p className="mt-2 text-[0.95rem] text-white/70">{t.timerP}</p>
        <MeasureTimer locale={locale} onDone={saveMeasure} />
        <p className="mt-4 text-[0.85rem] text-white/50">{t.timerInfo}</p>
      </>)}

      {step === "result" && result && (<>
        <Bar n={BAR.result} />
        {isEstimate ? (
          <>
            <p className="mt-8 text-[1.6rem] font-bold leading-tight text-bone">{t.estThink(about)}</p>
            <p className="mt-4 text-[1rem] leading-relaxed text-white/75">{t.estTruth}</p>
            <Btn label={t.estWhy(about)} onClick={() => setStep("lesson")} />
          </>
        ) : (
          <>
            <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.18em] text-jade">{t.numberH}</p>
            <p className="metric mt-1 text-[3.2rem] font-bold leading-none text-bone">{mmss(result.seconds)}</p>
            <p className="mt-3 text-[1.05rem] font-bold text-bone">{t.thats}</p>
            <p className="mt-1 text-[0.95rem] text-white/70">{t.notJudge}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-[0.9rem]">
              <div className="rounded-xl border border-white/10 p-3"><dt className="text-white/50">{t.method}</dt><dd className="font-semibold text-bone">{result.mode === "solo" ? t.solo : t.partner}</dd></div>
              <div className="rounded-xl border border-white/10 p-3"><dt className="text-white/50">{t.last}</dt><dd className="font-semibold text-bone">{gapLabel(result.gap)}</dd></div>
            </dl>
            {postEstimate ? (
              // He already read the lesson on the estimate path. Day 2 is open now (paid) or one screen away (free).
              <Btn label={t.openDay2} onClick={() => router.push(plan === "free" ? `${base}/unlock` : base)} />
            ) : (
              <Btn label={t.nextMeans(mmss(result.seconds))} onClick={() => setStep("lesson")} />
            )}
          </>
        )}
      </>)}

      {step === "lesson" && result && (<>
        <Bar n={BAR.lesson} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.meansH}</h1>
        <Scale stop={t.scaleStop} late={t.scaleLate} />
        {lesson?.body.slice(0, 4).map((p, i) => <p key={i} className="mt-3 text-[0.98rem] leading-relaxed text-white/80">{p}</p>)}
        {t.close(isEstimate ? about : mmss(result.seconds)).map((p, i) => <p key={`c${i}`} className="mt-3 text-[1rem] font-semibold leading-relaxed text-bone">{p}</p>)}
        <Btn label={t.next} onClick={() => { mutate((s) => ({ ...s, readLessons: [...new Set([...s.readLessons, "why-you-finish-fast"])] })); setStep("breathe"); }} />
      </>)}

      {step === "breathe" && (<>
        <Bar n={BAR.breathe} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.breatheH}</h1>
        <p className="mt-2 text-[0.95rem] text-white/70">{t.breatheP}</p>
        <Breath seconds={120} labels={{ inhale: t.inhale, hold: t.hold, exhale: t.exhale }} onDone={() => track("day1_breathing_done", undefined, locale)} />
        <Btn label={t.openDay2} onClick={finish} />
        <Btn label={t.skip} ghost onClick={finish} />
      </>)}
    </div>
  );
}
