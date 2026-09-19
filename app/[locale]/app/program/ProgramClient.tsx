"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useMetron } from "@/components/useMetron";
import { planOf, toProgress } from "@/lib/store";
import { dayState, hoursUntil } from "@/lib/gating";
import { getProgram } from "@/lib/content/program";

/**
 * Program — Section 5.7.
 *
 * Two segments. The 10-day: rows Day 1…10, then a distinct row "Day 12 ·
 * Measure again and review". Day 11 is not a row. The 30-day: five groups.
 * Locked rows say why. Viewing is never gated; opening is.
 */

const T = {
  en: {
    p10: "10-Day Challenge", p30: "30-Day Program", day: "Day",
    notYet: (n: number) => `Not yet. This day unlocks on Day ${n}. Finish today first.`,
    wait: (n: number) => `Opens in ${n}h.`,
    pay: "Unlock Days 2–10 →", after12: "Available after Day 12", days: "Days",
  },
  fr: {
    p10: "Défi 10 jours", p30: "Programme 30 jours", day: "Jour",
    notYet: (n: number) => `Pas encore. Ce jour s'ouvre au jour ${n}. Terminez d'abord aujourd'hui.`,
    wait: (n: number) => `S'ouvre dans ${n}h.`,
    pay: "Débloquer les jours 2–10 →", after12: "Disponible après le jour 12", days: "Jours",
  },
} as const;

export function ProgramClient({ locale }: { locale: string }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const params = useSearchParams();
  const [tab, setTab] = useState<"p10" | "p30">(params.get("tab") === "p30" ? "p30" : "p10");
  const [note, setNote] = useState<string | null>(null);
  const { state, ready } = useMetron(locale);
  if (!ready) return null;
  const plan = planOf(state);
  const prog = toProgress(state);
  const days = getProgram(locale).days;
  const base = `/${locale}/app`;

  const Row = ({ day }: { day: number }) => {
    const d = days.find((x) => x.day === day)!;
    const s = dayState(day, plan, prog);
    const icon = s.state === "done" ? "✓" : s.state === "open" ? "●" : "🔒";
    const tone = s.state === "done" ? "text-jade" : s.state === "open" ? "text-jade" : "text-white/35";
    const body = (
      <span className="flex w-full items-center gap-3 px-4 py-3.5">
        <span className={`w-5 text-center text-[13px] ${tone}`}>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-bold uppercase tracking-wide text-white/45">{t.day} {day}</span>
          <span className={`block text-[0.98rem] font-semibold ${s.state === "locked" ? "text-white/60" : "text-bone"}`}>{d.title}</span>
        </span>
      </span>
    );
    const cls = `block rounded-xl border ${day === 12 ? "border-jade/40 bg-jade-050/30" : "border-white/10 bg-white/[.03]"}`;
    if (s.state === "locked") {
      return (
        <button type="button" className={`${cls} w-full text-left`} onClick={() => {
          if (s.reason === "pay") return setNote("pay");
          if (s.reason === "wait" && s.opensAt) return setNote(t.wait(hoursUntil(s.opensAt)));
          setNote(t.notYet(s.needsDay ?? day - 1));
        }}>
          {body}
        </button>
      );
    }
    return <Link href={`${base}/day/${day}`} className={cls}>{body}</Link>;
  };

  return (
    <div className="relative px-5 pt-6">
      <Image src="/app/summit.jpg" alt="" fill sizes="640px" className="pointer-events-none -z-10 object-cover object-top opacity-[.18]" />
      <div className="grid grid-cols-2 rounded-full border border-white/12 bg-black/40 p-1">
        {(["p10", "p30"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`rounded-full py-2 text-[13px] font-bold ${tab === k ? "bg-jade text-black" : "text-white/60"}`}>{t[k]}</button>
        ))}
      </div>

      {note && (
        <div className="mt-4 rounded-xl border border-white/12 bg-black/50 px-4 py-3 text-[0.9rem] text-white/80">
          {note === "pay" ? <Link href={`${base}/unlock`} className="font-bold text-jade">{t.pay}</Link> : note}
        </div>
      )}

      {tab === "p10" ? (
        <ul className="mt-5 space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <li key={n}><Row day={n} /></li>)}
          <li className="pt-2"><Row day={12} /></li>
        </ul>
      ) : (
        <div className="mt-5 space-y-5">
          {plan !== "p30" && <p className="text-[0.85rem] text-white/50">🔒 {t.after12}</p>}
          {[[13, 15], [16, 18], [19, 22], [23, 27], [28, 30]].map(([a, b]) => (
            <section key={a}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{t.days} {a}–{b} · {days.find((d) => d.day === a)?.group}</p>
              <ul className="space-y-2">
                {Array.from({ length: b - a + 1 }, (_, i) => a + i).map((n) => <li key={n}><Row day={n} /></li>)}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
