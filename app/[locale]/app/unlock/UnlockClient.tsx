"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMetron } from "@/components/useMetron";
import { planOf } from "@/lib/store";
import { PRICE_P10 } from "@/lib/content/program";
import { track, tapped } from "@/lib/track";

/**
 * The paywall — Section 5.3. Shown once Day 1 is done.
 *
 * "Unlock Now" opens the existing Mobile Money checkout, which works today
 * on Fapshi's hosted form. The push flow and the manual-transfer fallback
 * from Section 8 replace it when the aggregator is confirmed (14.1); the
 * button's destination is the only thing that changes.
 *
 * "Maybe later" goes back to Today in the completed state. His Day 1 number
 * is his either way, and the page says so.
 */

const T = {
  en: {
    h: "Unlock Days 2–10",
    p: "Continue your journey and get access to the full 10-day challenge.",
    bullets: ["Daily guided training sessions", "Expert lessons (text-based)", "Progress tracking", "Works on any phone", "One-time payment"],
    cta: "Unlock Now →",
    later: "Maybe later",
    already: "You already have access.",
    today: "Go to Today →",
  },
  fr: {
    h: "Débloquer les jours 2–10",
    p: "Continuez et accédez au défi 10 jours complet.",
    bullets: ["Séances d'entraînement guidées chaque jour", "Leçons d'expert (en texte)", "Suivi de la progression", "Marche sur n'importe quel téléphone", "Paiement unique"],
    cta: "Débloquer →",
    later: "Plus tard",
    already: "Vous avez déjà l'accès.",
    today: "Aller à Aujourd'hui →",
  },
} as const;

const xaf = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} XAF`;

export function UnlockClient({ locale }: { locale: string }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const { state, ready } = useMetron(locale);
  const base = `/${locale}/app`;
  useEffect(() => {
    if (ready) track("paywall_view", undefined, locale);
  }, [ready, locale]);
  if (!ready) return null;

  if (planOf(state) !== "free") {
    return (
      <div className="px-5 pt-10 text-center">
        <p className="text-white/70">{t.already}</p>
        <Link href={base} className="mt-4 inline-block text-jade">{t.today}</Link>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8">
      <p className="text-center text-4xl" aria-hidden>🔒</p>
      <h1 className="mt-4 text-center text-[1.6rem] font-bold leading-tight text-bone">{t.h}</h1>
      <p className="mt-2 text-center text-[0.95rem] text-white/70">{t.p}</p>

      <ul className="mx-auto mt-6 max-w-xs space-y-2">
        {t.bullets.map((b) => (
          <li key={b} className="flex gap-3 text-[0.95rem] text-white/85"><span className="text-jade">•</span>{b}</li>
        ))}
      </ul>

      <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-jade/50 bg-black/50 p-5 text-center">
        <p className="metric text-[1.8rem] font-bold text-bone">{xaf(PRICE_P10)}</p>
        <Link
          href={`/${locale}/offer?go=1`}
          onClick={() => tapped("unlock_now", locale, "p10")}
          className="btn-go mt-3 flex w-full items-center justify-center rounded-xl px-5 py-4 text-[16px] font-bold"
        >
          {t.cta}
        </Link>
      </div>

      <Link href={base} onClick={() => tapped("unlock_later", locale, "p10")} className="mt-4 block text-center text-[14px] text-white/50">
        {t.later}
      </Link>
    </div>
  );
}
