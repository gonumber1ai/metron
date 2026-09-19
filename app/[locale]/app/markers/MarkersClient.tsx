"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMetron } from "@/components/useMetron";
import { planOf, toProgress, toggleTask, completeDay, type Markers } from "@/lib/store";
import { canLogMarkers, currentDay, hoursUntil } from "@/lib/gating";
import { track } from "@/lib/track";

/**
 * Daily markers — Section 5.11 and 6.6.
 *
 * Four every day, 1–5, one tap each, one Save. Three more every seventh
 * day. Once per 18 hours, free forever, for anyone. Saving ticks the
 * markers item on today's checklist.
 */

const T = {
  en: {
    h: "Log your daily markers",
    p: "60 seconds. It's how you see progress on the days the clock hasn't moved yet.",
    daily: { erection: "Erection quality", energy: "Energy", sleep: "Sleep", control: "Control over arousal" },
    weekly: { libido: "Libido", stress: "Stress", stomach: "Stomach comfort" },
    weeklyH: "This week",
    scale: ["Poor", "", "OK", "", "Excellent"],
    save: "Save",
    wait: (n: number) => `You already logged today. Next one in ${n}h.`,
    back: "← Today",
  },
  fr: {
    h: "Noter vos marqueurs du jour",
    p: "60 secondes. C'est comme ça que vous voyez les progrès les jours où le chrono n'a pas encore bougé.",
    daily: { erection: "Qualité de l'érection", energy: "Énergie", sleep: "Sommeil", control: "Contrôle de l'excitation" },
    weekly: { libido: "Libido", stress: "Stress", stomach: "Confort digestif" },
    weeklyH: "Cette semaine",
    scale: ["Faible", "", "Moyen", "", "Excellent"],
    save: "Enregistrer",
    wait: (n: number) => `Vous avez déjà noté aujourd'hui. Prochain dans ${n}h.`,
    back: "← Aujourd'hui",
  },
} as const;

const DAILY = ["erection", "energy", "sleep", "control"] as const;
const WEEKLY = ["libido", "stress", "stomach"] as const;

export function MarkersClient({ locale }: { locale: string }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const router = useRouter();
  const { state, ready, mutate } = useMetron(locale);
  const [v, setV] = useState<Partial<Markers>>({});
  const base = `/${locale}/app`;
  if (!ready) return null;

  const prog = toProgress(state);
  const gate = canLogMarkers(prog);
  const day = currentDay(planOf(state), prog);
  const weekly = day % 7 === 0 || state.markerLogs.length === 0;
  const need: readonly string[] = weekly ? [...DAILY, ...WEEKLY] : DAILY;
  const complete = need.every((k) => v[k as keyof Markers]);

  if (!gate.ok) {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-white/70">{t.wait(hoursUntil(Date.now() + gate.nextIn))}</p>
        <button type="button" onClick={() => router.push(base)} className="mt-4 text-jade">{t.back}</button>
      </div>
    );
  }

  function save() {
    const prev = [...state.markerLogs].sort((a, b) => (a.at < b.at ? 1 : -1))[0]?.markers;
    const m: Markers = {
      erection: v.erection ?? 3, energy: v.energy ?? 3, sleep: v.sleep ?? 3, control: v.control ?? 3,
      libido: v.libido ?? prev?.libido ?? 3, stress: v.stress ?? prev?.stress ?? 3, stomach: v.stomach ?? prev?.stomach ?? 3,
    };
    mutate((s) => {
      let out = { ...s, markerLogs: [...s.markerLogs, { day, at: new Date().toISOString(), markers: m }] };
      if (!out.done[String(day)]?.includes("markers")) out = toggleTask(out, day, "markers");
      const all = ["session", "sleep", "markers"].every((k) => out.done[String(day)]?.includes(k));
      if (all && !out.dayCompletedAt[String(day)]) out = completeDay(out, day, 30);
      return out;
    });
    track("markers_logged", String(day), locale);
    router.push(base);
  }

  const Row = ({ k, label }: { k: keyof Markers; label: string }) => (
    <div className="mt-4">
      <p className="text-[0.95rem] font-semibold text-bone">{label}</p>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setV((x) => ({ ...x, [k]: n }))}
            className={`rounded-xl border py-3 text-[15px] font-bold ${v[k] === n ? "border-jade bg-jade text-black" : "border-white/12 text-white/70"}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-white/40"><span>{t.scale[0]}</span><span>{t.scale[4]}</span></div>
    </div>
  );

  return (
    <div className="px-5 pt-6">
      <button type="button" onClick={() => router.push(base)} className="text-[13px] text-white/50">{t.back}</button>
      <h1 className="mt-4 text-[1.4rem] font-bold text-bone">{t.h}</h1>
      <p className="mt-1 text-[0.9rem] text-white/60">{t.p}</p>
      {DAILY.map((k) => <Row key={k} k={k} label={t.daily[k]} />)}
      {weekly && (
        <>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{t.weeklyH}</p>
          {WEEKLY.map((k) => <Row key={k} k={k} label={t.weekly[k]} />)}
        </>
      )}
      <button type="button" disabled={!complete} onClick={save} className="btn-go mt-7 flex w-full items-center justify-center rounded-xl px-5 py-4 text-[16px] font-bold disabled:opacity-40">
        {t.save}
      </button>
    </div>
  );
}
