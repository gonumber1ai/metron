"use client";

import { useState } from "react";
import { getDict } from "@/lib/i18n";
import { getProtocol } from "@/lib/content/protocol";
import type { State } from "@/lib/store";

/**
 * First run.
 *
 * Without this a buyer lands on "Day 0 — Reset" with no idea what he bought,
 * how long it takes, or why the first instruction is to do nothing. Three
 * screens: what this is, the rules he has to run every day, and the medical
 * screen — which is here rather than buried because the men it catches are
 * the ones a protocol cannot help.
 */
export function Onboarding({
  locale,
  onStart,
}: {
  locale: string;
  onStart: (patch: Partial<State>) => void;
}) {
  const t = getDict(locale);
  const protocol = getProtocol(locale);
  const [step, setStep] = useState(0);
  const fr = locale === "fr";

  type Step = {
    kicker: string;
    title: string;
    body: readonly string[];
    rules?: boolean;
    medical?: boolean;
  };

  const steps: Step[] = [
    {
      kicker: fr ? "Bienvenue" : "Welcome",
      title: fr ? "Douze jours, deux chiffres" : "Twelve days, two numbers",
      body: [
        fr
          ? "Voici comment cela fonctionne. Aujourd'hui, Jour 0, vous ne faites rien : vous remettez le système à zéro pour que la mesure de demain soit honnête."
          : "Here is how this works. Today, Day 0, you do nothing — you reset the system so that tomorrow's measurement is honest.",
        fr
          ? "Demain vous prenez votre mesure de départ. Puis dix jours de protocole : sept séances d'entraînement, du travail du périnée tous les jours, et une fondation ennuyeuse mais décisive — sommeil, repas, mouvement, eau."
          : "Tomorrow you take your baseline. Then ten days of protocol: seven training sessions, pelvic floor work every day, and a boring but decisive foundation — sleep, meals, movement, water.",
        fr
          ? "Au Jour 12 vous mesurez à nouveau, dans exactement les mêmes conditions. C'est tout le produit. Le reste n'est que du détail."
          : "On Day 12 you measure again, under exactly the same conditions. That is the entire product. Everything else is detail.",
      ],
    },
    {
      kicker: fr ? "Les règles" : "The rules",
      title: fr ? "Chaque jour, sans exception" : "Every day, without exception",
      body: protocol.rulesIntro,
      rules: true,
    },
    {
      kicker: fr ? "Important" : "Important",
      title: t.medical.title,
      body: [t.medical.body],
      medical: true,
    },
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:py-12">
      {/* step dots */}
      <div className="flex gap-1.5" aria-hidden>
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-jade" : "bg-ink-700"
            }`}
          />
        ))}
      </div>

      <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-jade">
        {s.kicker}
      </p>
      <h1 className="mt-2 text-[1.8rem] font-semibold leading-tight tracking-tight md:text-[2.2rem]">
        {s.title}
      </h1>

      <div className="mt-5 space-y-4">
        {s.body.map((p, i) => (
          <p key={i} className="text-[1.02rem] leading-[1.75] text-mute">
            {p}
          </p>
        ))}
      </div>

      {s.rules && (
        <ul className="mt-6 space-y-2">
          {protocol.rules.map((r) => (
            <li
              key={r.id}
              className="rounded-xl card px-4 py-3"
            >
              <p className="text-[0.95rem] font-medium text-bone">{r.label}</p>
              <p className="mt-1 text-[0.87rem] leading-relaxed text-mute">{r.detail}</p>
            </li>
          ))}
        </ul>
      )}

      {s.medical && (
        <div className="mt-6 rounded-2xl border border-amber/40 bg-amber-050 p-5">
          <p className="text-[0.95rem] font-semibold text-bone">{t.medical.seeDoctor}</p>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-mute">
            {fr
              ? "Si l'un de ces points vous concerne, allez voir un médecin avant de commencer. Le protocole vous attendra — et s'il y a une cause physique, aucun entraînement ne la contournera."
              : "If any of those apply to you, see a doctor before you start. The protocol will wait — and if there is a physical cause, no amount of training will get around it."}
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-full border border-ink-600 px-5 py-3 text-[14px] font-medium text-mute"
          >
            {t.cta.back}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (isLast) onStart({ startedAt: new Date().toISOString(), day: 0 });
            else setStep(step + 1);
          }}
          className="flex-1 rounded-full btn-go px-6 py-3.5 text-[15px] font-semibold"
        >
          {isLast
            ? fr
              ? "Commencer le Jour 0"
              : "Start Day 0"
            : t.cta.continue}
        </button>
      </div>
    </div>
  );
}
