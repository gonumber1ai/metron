"use client";

import { useState } from "react";
import Image from "next/image";
import { useMetron } from "@/components/useMetron";
import { baseline, retest, finalTest, formatDuration, streak, planOf, toProgress, type Markers } from "@/lib/store";
import { currentDay } from "@/lib/gating";

/**
 * Progress — Section 5.10.
 *
 * Overview: the number card. Day 1; Day 12 locked until the challenge is
 * done. No four zeros on Day 1, no streak before Day 3. Markers: four daily
 * trend lines, the three weekly ones in their own section.
 */

const T = {
  en: {
    overview: "Overview", markers: "Daily markers",
    card: "Your measurement", d1: "Day 1", d12: "Day 12", d30: "Day 30",
    locked12: "Complete the 10-day challenge to see your comparison.",
    saved: "Your number is saved. Keep going.",
    none: "Time how long you last on Day 1 to start.",
    under: "Your markers usually move before the clock does.",
    streak: (n: number) => `${n}-day streak`,
    daily: { erection: "Erection quality", energy: "Energy", sleep: "Sleep", control: "Control over arousal" },
    weekly: { libido: "Libido", stress: "Stress", stomach: "Stomach comfort" },
    weeklyH: "Weekly", last7: "Last 7 days", all: "All days",
  },
  fr: {
    overview: "Aperçu", markers: "Marqueurs du jour",
    card: "Votre mesure", d1: "Jour 1", d12: "Jour 12", d30: "Jour 30",
    locked12: "Terminez le défi 10 jours pour voir votre comparaison.",
    saved: "Votre chiffre est enregistré. Continuez.",
    none: "Chronométrez combien de temps vous tenez au jour 1 pour commencer.",
    under: "Vos marqueurs bougent généralement avant le chrono.",
    streak: (n: number) => `${n} jours d'affilée`,
    daily: { erection: "Qualité de l'érection", energy: "Énergie", sleep: "Sommeil", control: "Contrôle de l'excitation" },
    weekly: { libido: "Libido", stress: "Stress", stomach: "Confort digestif" },
    weeklyH: "Hebdomadaire", last7: "7 derniers jours", all: "Tous les jours",
  },
} as const;

function Trend({ values }: { values: number[] }) {
  if (values.length === 0) return <span className="text-[12px] text-white/30">—</span>;
  const w = 120, h = 28;
  const pts = values.map((v, i) => `${values.length === 1 ? w / 2 : (i / (values.length - 1)) * w},${h - ((v - 1) / 4) * (h - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-[120px]">
      <polyline points={pts} fill="none" stroke="var(--color-jade)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function ProgressClient({ locale }: { locale: string }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const [tab, setTab] = useState<"overview" | "markers">("overview");
  const [range, setRange] = useState<"7" | "all">("7");
  const { state, ready } = useMetron(locale);
  if (!ready) return null;

  const b = baseline(state), r = retest(state), f = finalTest(state);
  const day = currentDay(planOf(state), toProgress(state));
  const logs = [...state.markerLogs].sort((x, y) => (x.at < y.at ? -1 : 1));
  const shown = range === "7" ? logs.slice(-7) : logs;
  const series = (k: keyof Markers) => shown.map((l) => l.markers[k]);
  const s = streak(state);

  return (
    <div className="relative px-5 pt-6">
      <Image src="/app/ring.jpg" alt="" fill sizes="640px" className="pointer-events-none -z-10 object-cover object-top opacity-[.18]" />
      <div className="grid grid-cols-2 rounded-full border border-white/12 bg-black/40 p-1">
        {(["overview", "markers"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full py-2 text-[13px] font-bold ${tab === k ? "bg-jade text-black" : "text-white/60"}`}>{t[k]}</button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <section className="mt-5 rounded-2xl border border-jade/30 bg-black/50 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{t.card}</p>
            {!b ? (
              <p className="mt-3 text-[0.95rem] text-white/70">{t.none}</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div><p className="text-[12px] text-white/50">{t.d1}</p><p className="metric text-[1.6rem] font-bold text-bone">{formatDuration(b.seconds, locale)}</p></div>
                <div>
                  <p className="text-[12px] text-white/50">{f ? t.d30 : t.d12}</p>
                  {r || f ? <p className="metric text-[1.6rem] font-bold text-jade">{formatDuration((f ?? r)!.seconds, locale)}</p> : <p className="mt-1 text-[0.82rem] text-white/45">🔒 {t.locked12}</p>}
                </div>
              </div>
            )}
            {b && !r && <p className="mt-3 text-[0.88rem] text-white/60">{t.saved}</p>}
            <p className="mt-2 text-[0.85rem] italic text-white/45">{t.under}</p>
            {day >= 3 && s > 0 && <p className="mt-3 text-[12px] font-bold text-jade">{t.streak(s)}</p>}
          </section>
          {logs.length > 0 && (
            <section className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-4">
              {(Object.keys(t.daily) as (keyof typeof t.daily)[]).map((k) => (
                <div key={k} className="flex items-center justify-between py-1.5">
                  <span className="text-[0.88rem] text-white/75">{t.daily[k]}</span>
                  <Trend values={series(k).slice(-7)} />
                </div>
              ))}
            </section>
          )}
        </>
      ) : (
        <>
          <div className="mt-5 flex gap-2 text-[12px]">
            {(["7", "all"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setRange(k)} className={`rounded-full border px-3 py-1 font-semibold ${range === k ? "border-jade text-jade" : "border-white/15 text-white/55"}`}>{k === "7" ? t.last7 : t.all}</button>
            ))}
          </div>
          <section className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-4">
            {(Object.keys(t.daily) as (keyof typeof t.daily)[]).map((k) => (
              <div key={k} className="flex items-center justify-between py-2">
                <span className="text-[0.92rem] text-bone">{t.daily[k]}</span>
                <span className="flex items-center gap-3"><Trend values={series(k)} /><span className="metric w-4 text-right text-[13px] text-jade">{series(k).at(-1) ?? ""}</span></span>
              </div>
            ))}
          </section>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{t.weeklyH}</p>
          <section className="mt-2 rounded-2xl border border-white/10 bg-white/[.03] p-4">
            {(Object.keys(t.weekly) as (keyof typeof t.weekly)[]).map((k) => (
              <div key={k} className="flex items-center justify-between py-2">
                <span className="text-[0.92rem] text-bone">{t.weekly[k]}</span>
                <span className="flex items-center gap-3"><Trend values={series(k)} /><span className="metric w-4 text-right text-[13px] text-jade">{series(k).at(-1) ?? ""}</span></span>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
