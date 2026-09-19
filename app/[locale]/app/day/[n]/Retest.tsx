"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMetron } from "@/components/useMetron";
import { baseline, retest, toggleTask, completeDay, type Mode, type Gap, type Measurement } from "@/lib/store";
import { PRICE_P30 } from "@/lib/content/program";
import { mmss } from "@/lib/format";
import { MeasureTimer } from "@/components/MeasureTimer";
import { track, tapped } from "@/lib/track";

/**
 * Day 12 and Day 30 — Section 5.8 and 16.8.
 *
 * The same four steps as Day 1 minus the scale lesson. Then the two numbers
 * side by side with their conditions; one calm line if the conditions
 * differ, and no blocking. Then the one yes/no, the result lesson, and — on
 * Day 12 — the 30-day sale with both numbers on screen.
 *
 * ── THE SALE FOLLOWS THE NUMBER ───────────────────────────────────────────
 * Number moved: the standard copy. Number did not move but the markers did:
 * the markers-first copy. Nothing moved: no upsell at all — the bottleneck
 * lesson and Help. Selling a man a bigger programme on a result that did
 * not happen is how the refund conversations start.
 */

const T = {
  en: {
    breatheH: "Breathe. Relax. Get ready.", breatheP: "Same as Day 1. Three minutes.", inhale: "Inhale", hold: "Hold", exhale: "Exhale",
    next: "Next: Measurement →", skip: "Skip",
    setupH: "Your measurement", setupP: "Same two questions as Day 1. Answer them the same way if you can.",
    how: "How did you do it?", solo: "On my own (solo)", partner: "With a partner",
    since: "How long since you last finished?", today: "Today", yesterday: "Yesterday", twoPlus: "2+ days",
    cont: "Continue →",
    timerP: "Do it normally. Don't hold back. Don't use any technique — you are measuring what your body does by itself now.",
    d1: "Day 1", d12: "Day 12", d30: "Day 30", method: "Method", last: "Last time",
    loose: "Your conditions were different from Day 1, so read this comparison loosely.",
    extra: "Did you do sessions outside the plan?", yes: "Yes", no: "No",
    readResult: "Read: How to read your result →",
    // 16.8
    didThis: "That's what 10 days did on your own.",
    does: "The 30-Day Program does two things this didn't: loads it heavier, and moves it into real sex, with her.",
    markersFirst: "Your markers moved before the clock. That's the usual order. The 30 days is where the clock catches up.",
    nothing: "The clock didn't move and neither did the markers. Before anything else, read the bottleneck lesson — and if it doesn't fit, use Help & Support.",
    bottleneck: "Read: Finding the bottleneck →", help: "Help & Support →",
    cta: "Continue →", stop: "Stop here",
    done30: "Day 30 measured. Your three numbers are in Progress.",
    toToday: "Go to Today →",
  },
  fr: {
    breatheH: "Respirez. Détendez-vous. Préparez-vous.", breatheP: "Comme le jour 1. Trois minutes.", inhale: "Inspirez", hold: "Retenez", exhale: "Expirez",
    next: "Suite : Mesure →", skip: "Passer",
    setupH: "Votre mesure", setupP: "Les deux mêmes questions que le jour 1. Répondez de la même façon si vous le pouvez.",
    how: "Comment l'avez-vous fait ?", solo: "Seul", partner: "Avec une partenaire",
    since: "Depuis combien de temps avez-vous fini pour la dernière fois ?", today: "Aujourd'hui", yesterday: "Hier", twoPlus: "2 jours ou plus",
    cont: "Continuer →",
    timerP: "Faites-le normalement. Ne vous retenez pas. N'utilisez aucune technique — vous mesurez ce que votre corps fait tout seul maintenant.",
    d1: "Jour 1", d12: "Jour 12", d30: "Jour 30", method: "Méthode", last: "Dernière fois",
    loose: "Vos conditions étaient différentes du jour 1, donc lisez cette comparaison avec prudence.",
    extra: "Avez-vous fait des séances en dehors du plan ?", yes: "Oui", no: "Non",
    readResult: "Lire : Comment lire votre résultat →",
    didThis: "Voilà ce que 10 jours ont fait, seul.",
    does: "Le programme de 30 jours fait deux choses que celui-ci n'a pas faites : il charge plus lourd, et il l'amène dans de vrais rapports, avec elle.",
    markersFirst: "Vos marqueurs ont bougé avant le chrono. C'est l'ordre habituel. Les 30 jours, c'est là que le chrono rattrape.",
    nothing: "Le chrono n'a pas bougé et les marqueurs non plus. Avant tout, lisez la leçon sur le blocage — et si ça ne colle pas, utilisez Aide & support.",
    bottleneck: "Lire : Trouver le blocage →", help: "Aide & support →",
    cta: "Continuer →", stop: "Arrêter ici",
    done30: "Jour 30 mesuré. Vos trois chiffres sont dans Progrès.",
    toToday: "Aller à Aujourd'hui →",
  },
} as const;

const xaf = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} XAF`;

/** Did the four daily markers rise between the first days and the last? */
function markersMoved(logs: { markers: { erection: number; energy: number; sleep: number; control: number } }[]): boolean {
  if (logs.length < 4) return false;
  const avg = (xs: typeof logs) => xs.reduce((a, l) => a + l.markers.erection + l.markers.energy + l.markers.sleep + l.markers.control, 0) / (xs.length * 4);
  const k = Math.min(3, Math.floor(logs.length / 2));
  return avg(logs.slice(-k)) - avg(logs.slice(0, k)) >= 0.5;
}

export function Retest({ locale, day, Breath, Bar, Btn }: {
  locale: string;
  day: 12 | 30;
  Breath: React.ComponentType<{ seconds: number; labels: { inhale: string; hold: string; exhale: string }; onDone: () => void }>;
  Bar: React.ComponentType<{ n: number; total: number }>;
  Btn: React.ComponentType<{ label: string; onClick: () => void; ghost?: boolean }>;
}) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const router = useRouter();
  const { state, mutate } = useMetron(locale);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode | null>(null);
  const [gap, setGap] = useState<Gap | null>(null);
  const [now, setNow] = useState<Measurement | null>(null);
  const [extra, setExtra] = useState<boolean | null>(null);
  const base = `/${locale}/app`;
  const b = baseline(state);
  const prior = day === 30 ? retest(state) ?? b : b;

  useEffect(() => {
    if (step === 3 && day === 12) track("upsell_view", undefined, locale);
  }, [step, day, locale]);

  const save = (secs: number) => {
    const m: Measurement = { day, seconds: secs, mode: mode!, gap: gap!, at: new Date().toISOString() };
    setNow(m);
    mutate((s) => {
      let out = { ...s, measurements: [...s.measurements.filter((x) => x.day !== day), m] };
      out = toggleTask(out, day, "session");
      if (!out.done[String(day)]?.includes("session")) out = toggleTask(out, day, "session");
      return out;
    });
    track(day === 12 ? "day12_measured" : "session_complete", String(secs), locale);
    setStep(3);
  };

  const finish = () => {
    mutate((s) => {
      let out = s;
      for (const k of ["sleep", "markers"]) if (!out.done[String(day)]?.includes(k)) out = toggleTask(out, day, k);
      if (!out.dayCompletedAt[String(day)]) out = completeDay(out, day, 30);
      return out;
    });
    router.push(base);
  };

  const label = (g: Gap | undefined) => (g === "today" ? t.today : g === "yesterday" ? t.yesterday : t.twoPlus);
  const differ = now && prior && (now.mode !== prior.mode || (now.gap && prior.gap && now.gap !== prior.gap));
  const moved = now && prior ? now.seconds > prior.seconds : false;
  const mk = markersMoved(state.markerLogs);

  return (
    <div className="px-5 pt-5">
      {step === 0 && (<>
        <Bar n={1} total={3} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.breatheH}</h1>
        <p className="mt-2 text-[0.95rem] text-white/70">{t.breatheP}</p>
        <Breath seconds={180} labels={{ inhale: t.inhale, hold: t.hold, exhale: t.exhale }} onDone={() => {}} />
        <Btn label={t.next} onClick={() => setStep(1)} />
        <Btn label={t.skip} ghost onClick={() => setStep(1)} />
      </>)}
      {step === 1 && (<>
        <Bar n={2} total={3} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.setupH}</h1>
        <p className="mt-2 text-[0.95rem] text-white/70">{t.setupP}</p>
        <p className="mt-6 text-[12px] font-bold uppercase tracking-wide text-white/50">{t.how}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["solo", "partner"] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-xl border px-3 py-3 text-[0.95rem] font-semibold ${mode === m ? "border-jade bg-jade-050 text-bone" : "border-white/12 text-white/75"}`}>{m === "solo" ? t.solo : t.partner}</button>
          ))}
        </div>
        <p className="mt-5 text-[12px] font-bold uppercase tracking-wide text-white/50">{t.since}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["today", "yesterday", "2plus"] as Gap[]).map((g) => (
            <button key={g} type="button" onClick={() => setGap(g)} className={`rounded-xl border px-2 py-3 text-[0.9rem] font-semibold ${gap === g ? "border-jade bg-jade-050 text-bone" : "border-white/12 text-white/75"}`}>{label(g)}</button>
          ))}
        </div>
        {mode && gap && <Btn label={t.cont} onClick={() => setStep(2)} />}
      </>)}
      {step === 2 && (<>
        <Bar n={3} total={3} />
        <h1 className="mt-5 text-[1.5rem] font-bold text-bone">{t.setupH}</h1>
        <p className="mt-2 text-[0.95rem] text-white/70">{t.timerP}</p>
        <MeasureTimer locale={locale} onDone={save} />
      </>)}
      {step === 3 && now && (<>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {[[t.d1, prior], [day === 12 ? t.d12 : t.d30, now]].map(([lab, m]) => (
            <div key={String(lab)} className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-white/45">{String(lab)}</p>
              <p className={`metric mt-1 text-[2.2rem] font-bold leading-none ${m === now ? "text-jade" : "text-bone"}`}>{m ? mmss((m as Measurement).seconds) : "—"}</p>
              {m && <p className="mt-2 text-[11px] text-white/50">{(m as Measurement).mode === "solo" ? t.solo : t.partner} · {label((m as Measurement).gap)}</p>}
            </div>
          ))}
        </div>
        {differ && <p className="mt-3 text-[0.88rem] text-white/60">{t.loose}</p>}

        <p className="mt-6 text-[0.95rem] font-semibold text-bone">{t.extra}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" onClick={() => { setExtra(v); track("session_complete", `extra:${v}`, locale); }} className={`rounded-xl border py-3 text-[0.95rem] font-semibold ${extra === v ? "border-jade bg-jade-050 text-bone" : "border-white/12 text-white/75"}`}>{v ? t.yes : t.no}</button>
          ))}
        </div>

        <Link href={`${base}/lessons/reading-your-result`} className="mt-5 block text-[0.95rem] font-semibold text-jade">{t.readResult}</Link>

        {day === 12 && (
          <section className="mt-7 rounded-2xl border border-jade/50 bg-black/50 p-5">
            {moved ? (
              <>
                <p className="metric text-[1.1rem] font-bold text-bone">{t.d1}: {mmss(prior!.seconds)} &nbsp;→&nbsp; {t.d12}: <span className="text-jade">{mmss(now.seconds)}</span></p>
                <p className="mt-3 text-[1rem] font-semibold text-bone">{t.didThis}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-white/75">{t.does}</p>
              </>
            ) : mk ? (
              <p className="text-[0.98rem] leading-relaxed text-bone">{t.markersFirst}</p>
            ) : null}
            {moved || mk ? (
              <>
                <p className="metric mt-5 text-[1.5rem] font-bold text-bone">{xaf(PRICE_P30)}</p>
                <Link href={`/${locale}/offer?go=1&plan=sprint`} onClick={() => tapped("upsell_continue", locale, "p30")} className="btn-go mt-3 flex w-full items-center justify-center rounded-xl px-5 py-4 text-[16px] font-bold">{t.cta}</Link>
                <button type="button" onClick={finish} className="mt-3 w-full py-2 text-center text-[13px] text-white/45">{t.stop}</button>
              </>
            ) : (
              <>
                <p className="text-[0.95rem] leading-relaxed text-white/75">{t.nothing}</p>
                <Link href={`${base}/lessons/finding-the-bottleneck`} className="btn-go mt-4 flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-[15px] font-bold">{t.bottleneck}</Link>
                <Link href={`${base}/help`} className="mt-3 block text-center text-[14px] text-white/60">{t.help}</Link>
                <button type="button" onClick={finish} className="mt-2 w-full py-2 text-center text-[13px] text-white/45">{t.toToday}</button>
              </>
            )}
          </section>
        )}
        {day === 30 && (<>
          <p className="mt-6 text-[0.95rem] text-white/70">{t.done30}</p>
          <Btn label={t.toToday} onClick={finish} />
        </>)}
      </>)}
    </div>
  );
}
