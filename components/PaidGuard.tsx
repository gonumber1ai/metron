"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getMarketing } from "@/lib/content/marketing";
import { getReviews } from "@/lib/content/reviews";
import { results, hasResults, methodNote } from "@/lib/content/results";
import { useMetron } from "./useMetron";
import { LogoMark } from "./Logo";

/**
 * No programme without a purchase.
 *
 * `plan` is only ever set by the checkout return (and later by the payment
 * webhook, which is the real authority). The advertorial, quiz and result stay
 * open — that is the funnel. Everything past it is closed.
 *
 * This renders INSIDE the app shell, so a locked visitor keeps the navigation
 * and sees a note tailored to whichever tab he taps. He is allowed to walk
 * around the locked building; he just cannot use it.
 */

const TAB_NOTE: Record<string, { en: string; fr: string }> = {
  "": {
    en: "Your day-by-day programme lives here. Every day tells you exactly what to do — nothing to work out for yourself.",
    fr: "Votre programme jour par jour est ici. Chaque jour vous dit exactement quoi faire — rien à deviner.",
  },
  program: {
    en: "All 10 days, laid out. They unlock one at a time so you cannot run ahead and ruin the measurement.",
    fr: "Les 10 jours, en entier. Ils s'ouvrent un par un pour que vous ne puissiez pas courir en avant et fausser la mesure.",
  },
  measure: {
    en: "The timer, the 4 checks, and your before-and-after numbers. This is the part that proves whether it worked.",
    fr: "Le chronomètre, les 4 vérifications, et vos chiffres avant et après. C'est la partie qui prouve si ça marche.",
  },
  progress: {
    en: "Your chart. Both numbers side by side, plus the 7 things that usually improve before the clock does.",
    fr: "Votre graphique. Les deux chiffres côte à côte, plus les 7 indicateurs qui s'améliorent avant le chrono.",
  },
  lessons: {
    en: "19 short lessons, one idea each. Unlocked as you reach the day they belong to.",
    fr: "19 leçons courtes, une idée chacune. Débloquées au fur et à mesure des jours.",
  },
  messages: {
    en: "A private thread with us. No WhatsApp needed, no name required, nobody else can see it.",
    fr: "Un fil privé avec nous. Pas besoin de WhatsApp, aucun nom requis, personne d'autre ne le voit.",
  },
  settings: {
    en: "PIN lock, neutral notifications, language, and delete-everything. Yours once you start.",
    fr: "Code PIN, notifications neutres, langue, et tout supprimer. À vous dès que vous commencez.",
  },
};

export function PaidGuard({
  locale,
  entitled,
  children,
}: {
  locale: string;
  /** verified server-side from the signed cookie — the real gate */
  entitled: boolean;
  children: React.ReactNode;
}) {
  const t = getDict(locale);
  const m = getMarketing(locale);
  const { state, ready } = useMetron(locale);
  const pathname = usePathname();
  const fr = locale === "fr";
  const note = fr ? methodNote.fr : methodNote.en;
  const reviews = getReviews(locale);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-mute">{t.common.loading}</p>
      </div>
    );
  }

  // The signed cookie is the ONLY thing that opens this. localStorage `plan`
  // deliberately does not, or anyone could grant themselves the programme from
  // devtools in about four seconds.
  if (entitled) return <>{children}</>;

  // Which tab is he looking at? Drives the line at the top.
  const seg = pathname.replace(new RegExp(`^/${locale}/app/?`), "").split("/")[0] ?? "";
  const tab = TAB_NOTE[seg] ?? TAB_NOTE[""];

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      {/* ------------------------------------------------ what this tab is */}
      <div className="rounded-2xl border border-jade/30 bg-jade-050 p-5">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-jade" fill="none" aria-hidden>
            <path
              d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-jade">
            {fr ? "Verrouillé" : "Locked"}
          </p>
        </div>
        <p className="mt-2.5 text-[1rem] leading-relaxed text-bone">
          {fr ? tab.fr : tab.en}
        </p>
      </div>

      {/* ------------------------------------------------------- the offer */}
      <h1 className="mt-8 text-[1.55rem] font-bold leading-tight tracking-tight">
        {fr ? "Le bilan est gratuit. Le programme non." : "The assessment is free. The programme isn't."}
      </h1>

      <ul className="mt-5 space-y-2">
        {m.includes.map((x) => (
          <li key={x} className="flex gap-3 rounded-xl card px-4 py-3.5">
            <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-jade" />
            <span className="text-[0.95rem] leading-snug text-bone">{x}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/${locale}/offer`}
        className="mt-6 flex w-full items-center justify-center rounded-2xl btn-go py-5 text-[1.05rem] font-bold"
      >
        {t.cta.getTest}
      </Link>
      <p className="mt-3 text-center text-[0.9rem] leading-relaxed text-faint">
        {t.offer.guarantee}
      </p>

      {/* ------------------------------------------------- results / proof */}
      <section className="mt-9 rounded-2xl card p-5">
        {hasResults() ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-jade">
              {fr ? "Nos résultats" : "Our results"}
            </p>
            <p className="metric mt-3 text-[2.6rem] font-bold text-jade">
              {Math.round((results.improvedShare ?? 0) * 10)}/10
            </p>
            <p className="mt-1 text-[0.98rem] leading-relaxed text-bone">
              {fr
                ? `des hommes qui ont terminé les 10 jours ont vu leur chiffre monter. Gain médian : ${results.medianMinutesAdded} minutes.`
                : `of men who finished the 10 days saw their number go up. Median gain: ${results.medianMinutesAdded} minutes.`}
            </p>
            <p className="mt-2 text-[0.82rem] text-faint">
              {fr ? "Sur " : "Based on "}
              {results.sampleSize}
              {fr ? " programmes terminés · " : " completed programmes · "}
              {results.asOf}
            </p>
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-jade">
              {note.title}
            </p>
            <div className="mt-3 space-y-3">
              {note.body.map((p, i) => (
                <p key={i} className="text-[0.95rem] leading-relaxed text-mute">
                  {p}
                </p>
              ))}
            </div>
          </>
        )}
      </section>

      {/* --------------------------------------------------------- reviews */}
      <section className="mt-4 rounded-2xl card p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
          {fr ? "Avis" : "Reviews"}
        </p>

        {reviews.length === 0 ? (
          <>
            <div className="mt-3 space-y-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-dashed border-ink-600 px-4 py-5"
                  aria-hidden
                >
                  <div className="h-2.5 w-2/3 rounded-full bg-ink-700" />
                  <div className="mt-2 h-2.5 w-1/2 rounded-full bg-ink-700" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-[0.88rem] leading-relaxed text-faint">{note.soon}</p>
          </>
        ) : (
          <ul className="mt-3 space-y-2">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-ink-600 bg-ink-850 p-4">
                {r.numbers && (
                  <p className="mb-2 flex items-center gap-2">
                    <span className="metric text-[1rem] font-bold text-faint">{r.numbers.day1}</span>
                    <span aria-hidden className="text-faint">→</span>
                    <span className="metric text-[1.3rem] font-bold text-jade">
                      {r.numbers.day12}
                    </span>
                  </p>
                )}
                <p className="text-[0.93rem] leading-relaxed text-mute">{r.text}</p>
                <p className="mt-2 text-[0.8rem] text-faint">{r.who}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href={`/${locale}/result`}
        className="mt-6 block text-center text-[0.88rem] text-faint underline underline-offset-4"
      >
        {fr ? "Revoir mon résultat" : "Back to my result"}
      </Link>
    </div>
  );
}
