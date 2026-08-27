"use client";

import { useState } from "react";
import { getDict } from "@/lib/i18n";
import { formatMins, type QuizResult } from "@/lib/content/quiz";
import { getPattern } from "@/lib/content/patterns";

/**
 * The opt-in gate.
 *
 * Sits between the last question and the result. This is where the funnel
 * actually earns something: a man who does not buy today is still reachable
 * tomorrow. He has already answered nine questions, so the sunk cost is doing
 * the work — the ask lands far better here than it would on the landing page.
 *
 * There is a quiet skip. In a category built on privacy, a hard wall reads as
 * a bait-and-switch and costs more trust than it captures contacts.
 */
export function Gate({
  locale,
  quiz,
  onDone,
}: {
  locale: string;
  quiz: QuizResult;
  onDone: (contact: string | null) => void;
}) {
  const t = getDict(locale);
  const p = getPattern(locale, quiz.pattern);
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);

  const fr = locale === "fr";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (contact.trim().length < 4) return;
    setBusy(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contact.trim(), plan: "quiz", ref: "quiz", locale }),
      });
    } catch {
      /* never block the result on a failed capture */
    }
    onDone(contact.trim());
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-8 pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-jade">
        {fr ? "Votre résultat est prêt" : "Your result is ready"}
      </p>

      {/* Show enough to make it real, hold back the part that needs the page. */}
      <div className="mt-5 rounded-2xl card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          {t.result.yourType}
        </p>
        <h1 className="mt-1.5 text-[1.5rem] font-semibold leading-tight tracking-tight">
          {p.name}
        </h1>

        <div className="mt-4 flex items-end gap-3 border-t border-ink-700 pt-4">
          <span className="metric text-[2.8rem] font-semibold text-jade">{quiz.gap}</span>
          <span className="pb-2 text-[0.95rem] text-mute">
            {fr ? "minutes d'écart" : "minute gap"}
          </span>
        </div>
        <p className="mt-2 text-[0.93rem] leading-relaxed text-mute">
          {t.result.gapExplain
            .replace("{now}", formatMins(quiz.now, locale))
            .replace("{want}", formatMins(quiz.want, locale))}
        </p>
      </div>

      <h2 className="mt-7 text-[1.15rem] font-semibold leading-snug">
        {fr
          ? "Où devons-nous envoyer votre analyse complète ?"
          : "Where should we send your full breakdown?"}
      </h2>
      <p className="mt-2 text-[0.93rem] leading-relaxed text-mute">
        {fr
          ? "Nous vous envoyons votre profil détaillé, pourquoi ce que vous avez essayé n'a pas tenu, et les premières étapes — plus l'accès à votre compte si vous décidez de commencer."
          : "We'll send your detailed pattern, why what you tried didn't hold, and the first steps — plus your account access if you decide to start."}
      </p>

      <form onSubmit={submit} className="mt-5">
        <input
          type="text"
          required
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={fr ? "E-mail ou numéro WhatsApp" : "Email or WhatsApp number"}
          autoComplete="email"
          className="w-full rounded-xl card px-4 py-3.5 text-[16px] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
        />

        <button
          type="submit"
          disabled={busy || contact.trim().length < 4}
          className="mt-3 w-full rounded-full btn-go px-6 py-3.5 text-[15px] font-semibold disabled:opacity-30"
        >
          {busy ? t.common.loading : t.cta.seeResult}
        </button>
      </form>

      {/* privacy reassurance — this is the objection, so answer it here */}
      <ul className="mt-5 space-y-2">
        {[t.privacy.b1, t.privacy.b3, t.privacy.b6].map((b) => (
          <li key={b} className="flex gap-2.5 text-[0.86rem] leading-relaxed text-faint">
            <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-jade" />
            {b}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onDone(null)}
        className="mt-6 self-start text-[13px] text-faint underline underline-offset-4 hover:text-mute"
      >
        {fr ? "Je préfère juste voir le résultat" : "I'd rather just see it"}
      </button>
    </div>
  );
}
