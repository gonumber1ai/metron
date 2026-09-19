"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMetron } from "@/components/useMetron";
import { planOf, toggleTask, completeDay, baseline, estimate, type Mode, type EstimateBucket, type Measurement } from "@/lib/store";
import { getProgram } from "@/lib/content/program";
import { BUCKETS, bucketSeconds, aboutLabel } from "@/lib/estimate";
import { mmss } from "@/lib/format";
import { MeasureTimer } from "@/components/MeasureTimer";
import { track } from "@/lib/track";

/**
 * Day 1 — START → STOP → the time on screen → one tap → lesson → Open Day 2.
 *
 * Nothing before START. The first thing he sees in the app is "Time how
 * long you last" and the button. The conditions questions that used to sit
 * in front of the timer mattered for Day 12, not for the sale, and the sale
 * is what the first screen is for — so the one condition that changes the
 * comparison enough to matter (alone / with a partner) is a single tap
 * under the time, after he is done, and skippable. "How long since you
 * last finished" is gone; Day 12 asks "same conditions as Day 1?" instead.
 *
 * The estimate path is a link under START: a man who cannot do it now
 * picks a bucket in place of the timer, same screen. It unlocks everything
 * a measurement does except Day 2 itself. One estimate per man.
 *
 * "Remind me tonight" stores a time and sends him to Today; the WhatsApp
 * send behind it waits on the Cloud API.
 */

const T = {
  en: {
    of: (n: number, total: number) => `${n}/${total}`,
    back: "← Today",
    skip: "Skip",
    measureH: "Time how long you last",
    measureP: "Do it normally. Don't hold back. Don't use any technique. START when you begin, STOP when you finish.",
    already: "You already estimated. Take the real one — about 5 minutes.",
    cantEstimate: "Can't do it now? Estimate.",
    remind: "Remind me tonight",
    estH: "Roughly how long do you last?",
    cancel: "Back to the timer",
    remindH: "What time tonight?",
    remindP: "Your first session takes about 5 minutes.",
    remindSet: "Set reminder →",
    tonight: "Tonight",
    thats: "That's how long you lasted tonight.",
    notJudge: "It's not a judgment. It's the thing you're going to change.",
    how: "How was it?", alone: "Alone", partner: "With a partner",
    nextMeans: (n: string) => `Why it's ${n} →`,
    estThink: (a: string) => `You think it's ${a}.`,
    estTruth: "Day 1 tells you the truth. Most men have never checked.",
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
    measureH: "Chronométrez combien de temps vous tenez",
    measureP: "Faites-le normalement. Ne vous retenez pas. N'utilisez aucune technique. START quand vous commencez, STOP quand vous finissez.",
    already: "Vous avez déjà estimé. Faites la vraie mesure — environ 5 minutes.",
    cantEstimate: "Pas possible maintenant ? Estimez.",
    remind: "Me rappeler ce soir",
    estH: "En gros, combien de temps tenez-vous ?",
    cancel: "Retour au chrono",
    remindH: "À quelle heure ce soir ?",
    remindP: "Votre première séance prend environ 5 minutes.",
    remindSet: "Programmer le rappel →",
    tonight: "Ce soir",
    thats: "C'est le temps que vous avez tenu ce soir.",
    notJudge: "Ce n'est pas un jugement. C'est la chose que vous allez changer.",
    how: "C'était comment ?", alone: "Seul", partner: "Avec une partenaire",
    nextMeans: (n: string) => `Pourquoi c'est ${n} →`,
    estThink: (a: string) => `Vous pensez que c'est ${a}.`,
    estTruth: "Le jour 1 vous dit la vérité. La plupart des hommes ne l'ont jamais vérifié.",
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

type Step = "measure" | "remind" | "result" | "lesson" | "breathe";
const TOTAL = 4;
const BAR: Record<Step, number> = { measure: 1, remind: 1, result: 2, lesson: 3, breathe: 4 };

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
  const [step, setStep] = useState<Step>("measure");
  const [estimating, setEstimating] = useState(false);
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
  const afterEstimate = Boolean(est) && !b;
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
    const m: Measurement = { day: 1, seconds: secs, at: new Date().toISOString() };
    setResult(m);
    setPostEstimate(afterEstimate);
    mutate((s) => ({ ...s, measurements: [...s.measurements.filter((x) => !(x.day === 1 && x.kind !== "estimate")), m], reminder: undefined }));
    track("day1_measured", String(secs), locale);
    if (afterEstimate && plan !== "free") track("day1_measured_after_pay", String(secs), locale);
    setStep("result");
  };

  /* The one tap after STOP. Written onto the measurement he just saved. */
  const setMode = (mode: Mode) => {
    if (!result) return;
    const m = { ...result, mode };
    setResult(m);
    mutate((s) => ({ ...s, measurements: s.measurements.map((x) => (x.day === 1 && x.kind !== "estimate" ? m : x)) }));
    track("day1_mode", mode, locale);
  };

  const saveEstimate = (bucket: EstimateBucket) => {
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
      body: JSON.stringify({ ref: state.ref, at: at.toISOString(), locale }),
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

  const about = aboutLabel(result?.bucket, locale);

  return (
    <div className="px-5 pt-5">
      {step === "measure" && (<>
        <Bar n={BAR.measure} />
        <h1 className="mt-5 text-[1.5rem] font-bold leading-tight text-bone">{estimating ? t.estH : t.measureH}</h1>
        {!estimating && <p className="mt-2 text-[0.95rem] text-white/70">{afterEstimate ? t.already : t.measureP}</p>}
        {estimating ? (
          <>
            <div className="mt-5 grid gap-2">
              {BUCKETS.map((k) => (
                <button key={k.id} type="button" onClick={() => saveEstimate(k.id)} className={pick(false) + " text-left"}>{locale === "fr" ? k.fr : k.en}</button>
              ))}
            </div>
            <Btn label={t.cancel} ghost onClick={() => setEstimating(false)} />
          </>
        ) : (
          <>
            <MeasureTimer locale={locale} onDone={saveMeasure} />
            {!afterEstimate && (
              <div className="mt-5 flex items-center justify-center gap-5 text-[14px]">
                <button type="button" onClick={() => setEstimating(true)} className="font-semibold text-jade underline-offset-4 hover:underline">{t.cantEstimate}</button>
                <button type="button" onClick={() => setStep("remind")} className="text-white/55 underline-offset-4 hover:underline">{t.remind}</button>
              </div>
            )}
          </>
        )}
      </>)}

      {step === "remind" && (<>
        <Bar n={BAR.remind} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.remindH}</h1>
        <p className="mt-2 text-[0.95rem] text-white/70">{t.remindP}</p>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value || "21:30")} className="metric mt-6 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-[1.6rem] font-bold text-bone focus:border-jade focus:outline-none" />
        <Btn label={t.remindSet} onClick={setReminder} />
        <Btn label={t.cancel} ghost onClick={() => setStep("measure")} />
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
            <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.18em] text-jade">{t.tonight}</p>
            <p className="metric mt-1 text-[3.2rem] font-bold leading-none text-bone">{mmss(result.seconds)}.</p>
            <p className="mt-3 text-[1.05rem] font-bold text-bone">{t.thats}</p>
            <p className="mt-1 text-[0.95rem] text-white/70">{t.notJudge}</p>
            {/* one tap, skippable — the only condition that changes the Day 12 comparison enough to matter */}
            <p className="mt-6 text-[12px] font-bold uppercase tracking-wide text-white/50">{t.how}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["solo", "partner"] as Mode[]).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} className={pick(result.mode === m)}>{m === "solo" ? t.alone : t.partner}</button>
              ))}
            </div>
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
