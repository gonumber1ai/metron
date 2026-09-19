"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMetron } from "@/components/useMetron";
import { planOf, baseline, estimate } from "@/lib/store";
import { aboutLabel } from "@/lib/estimate";
import { PRICE_P10 } from "@/lib/content/program";
import { mmss } from "@/lib/format";
import { track, tapped } from "@/lib/track";

/**
 * The paywall — Section 16.4. Shown once, at the end of Day 1, with his
 * number on screen. It sells the change of HIS number, not a feature list:
 * the day rows are the real programme and curiosity does the work. The
 * price anchor is true for this market. "Not tonight" names the delay as a
 * choice. Nothing under the button.
 *
 * "Open Day 2" opens the existing Mobile Money checkout. The push flow and
 * the manual-transfer fallback (Section 8) replace its destination when the
 * aggregator is confirmed; nothing on this screen changes.
 */

const T = {
  en: {
    yourNumber: "Your number:",
    yourGuess: "Your guess:",
    stay: (n: string) => `Every day it stays ${n}, you're training it to stay there.`,
    stayGuess: "Every day it stays there, you're training it to stay there.",
    opposite: "Days 2–10 train the opposite.",
    oppositeGuess: "Days 2–10 train the opposite. Day 1 tells you where you really start.",
    what: "What changes:",
    rows: [
      ["Day 2", "You learn to feel 6 — the last moment you still have a choice"],
      ["Day 4", "You hold at 7 without gripping"],
      ["Day 10", "You finish when you decide to"],
      ["Day 12", "You measure again. Your number, next to this one."],
    ],
    price: (p: string) => `${p} — once. Less than one box of the pills that don't work.`,
    cta: "Open Day 2 →",
    later: "Not tonight",
    already: "Day 2 is already open.",
    today: "Go to Today →",
    noNumber: "Measure Day 1 first — the number is the point.",
    day1: "Start Day 1 →",
  },
  fr: {
    yourNumber: "Votre chiffre :",
    yourGuess: "Votre estimation :",
    stay: (n: string) => `Chaque jour où il reste à ${n}, vous l'entraînez à y rester.`,
    stayGuess: "Chaque jour où il reste là, vous l'entraînez à y rester.",
    opposite: "Les jours 2 à 10 entraînent l'inverse.",
    oppositeGuess: "Les jours 2 à 10 entraînent l'inverse. Le jour 1 vous dit où vous partez vraiment.",
    what: "Ce qui change :",
    rows: [
      ["Jour 2", "Vous apprenez à sentir 6 — le dernier moment où vous avez encore le choix"],
      ["Jour 4", "Vous tenez à 7 sans serrer"],
      ["Jour 10", "Vous finissez quand vous le décidez"],
      ["Jour 12", "Vous mesurez à nouveau. Votre chiffre, à côté de celui-ci."],
    ],
    price: (p: string) => `${p} — une fois. Moins qu'une boîte des pilules qui ne marchent pas.`,
    cta: "Ouvrir le jour 2 →",
    later: "Pas ce soir",
    already: "Le jour 2 est déjà ouvert.",
    today: "Aller à Aujourd'hui →",
    noNumber: "Mesurez d'abord le jour 1 — le chiffre est le point de départ.",
    day1: "Commencer le jour 1 →",
  },
} as const;

const xaf = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} XAF`;

export function UnlockClient({ locale }: { locale: string }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const { state, ready } = useMetron(locale);
  const base = `/${locale}/app`;
  useEffect(() => {
    if (ready) track("paywall_view", baseline(state) ? "real" : "estimate", locale);
  }, [ready, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return null;

  const b = baseline(state);
  const e = estimate(state);
  if (planOf(state) !== "free") {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-white/70">{t.already}</p>
        <Link href={base} className="mt-4 inline-block text-jade">{t.today}</Link>
      </div>
    );
  }
  if (!b && !e) {
    // The paywall without a number is a feature list. He is sent to get one.
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-white/70">{t.noNumber}</p>
        <Link href={`${base}/day/1`} className="btn-go mt-5 inline-flex rounded-xl px-6 py-3.5 text-[15px] font-bold">{t.day1}</Link>
      </div>
    );
  }
  // Brief 2, 1.4: on the estimate path the guess stands in for the number,
  // and one extra clause sends him back for the real one.
  const guess = !b && e;
  const n = b ? mmss(b.seconds) : aboutLabel(e?.bucket, locale);

  return (
    <div className="px-5 pt-8">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-jade">{guess ? t.yourGuess : t.yourNumber}</p>
      <p className={`metric mt-1 font-bold leading-none text-bone ${guess ? "text-[1.9rem]" : "text-[3rem]"}`}>{n}</p>

      <p className="mt-6 text-[1.05rem] font-semibold leading-snug text-bone">{guess ? t.stayGuess : t.stay(n)}</p>
      <p className="mt-1 text-[1.05rem] font-semibold leading-snug text-jade">{guess ? t.oppositeGuess : t.opposite}</p>

      <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">{t.what}</p>
      <ul className="mt-2 space-y-2">
        {t.rows.map(([d, s]) => (
          <li key={d} className="flex gap-3 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3">
            <span className="metric w-14 shrink-0 text-[12px] font-bold uppercase tracking-wide text-jade">{d}</span>
            <span className="text-[0.95rem] leading-snug text-bone">{s}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 rounded-2xl border border-jade/50 bg-black/50 p-5">
        <p className="text-[0.98rem] leading-snug text-bone">{t.price(xaf(PRICE_P10))}</p>
        <Link
          href={`/${locale}/offer?go=1`}
          onClick={() => tapped("unlock_now", locale, "p10")}
          className="btn-go mt-4 flex w-full items-center justify-center rounded-xl px-5 py-4 text-[16px] font-bold"
        >
          {t.cta}
        </Link>
      </div>

      <Link href={base} onClick={() => tapped("unlock_later", locale, "p10")} className="mt-5 block text-center text-[14px] text-white/50">
        {t.later}
      </Link>
    </div>
  );
}
