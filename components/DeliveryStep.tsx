"use client";

import { useState } from "react";
import type { Plan } from "@/lib/payments";
import { Spinner } from "./Pending";
import { tapped } from "@/lib/track";

/**
 * "How do you want to receive it?" — the screen between the buy button and
 * the payment form.
 *
 * ── WHY THREE OPTIONS ARE SHOWN AND NONE HAS TO BE CHOSEN ─────────────────
 * Three ways to receive a programme is evidence the programme exists. A
 * single "pay now" is a claim; "in your private space, as a download, or on
 * WhatsApp" is a thing with a shape, and a man who has just watched a hundred
 * herb sellers promise him the moon is reading for shape. So all three are on
 * screen. But a choice at the moment of paying is a cost, so one is already
 * selected and the other two are one tap away — he can read the three and
 * press Continue without deciding anything.
 *
 * ── THE NUMBER IS ASKED ONLY FOR WHATSAPP ────────────────────────────────
 * It is where the daily session goes, so that choice cannot proceed without
 * it. The other two do not need it and do not ask. When it is given it is
 * also passed to the payment route as a real number, so the day Fapshi
 * approve direct-pay the USSD goes straight to it.
 *
 * The 30-day is in-app only, so for that plan the other two are not offered.
 */

export type Delivery = "app" | "download" | "whatsapp";

const PHONE_RE = /^6\d{8}$/;
export const DELIVERY_KEY = "metron.deliver";

const COPY = {
  en: {
    kicker: "HOW DO YOU WANT TO RECEIVE IT?",
    h: "Your programme, your way.",
    options: {
      app: {
        name: "In the Metron app",
        body: "Daily reminders, your progress measured in a tap, and the programme laid out day by day. Opens the moment you pay.",
        tag: "Recommended",
      },
      download: {
        name: "Download it",
        body: "The full programme as a file on your phone. Read it with no connection.",
        tag: "",
      },
      whatsapp: {
        name: "On WhatsApp",
        body: "Each day's session arrives on WhatsApp. Nothing to open, nothing to install.",
        tag: "",
      },
    },
    sprintNote: "The 30-day programme runs in the Metron app.",
    phoneLabel: "Your WhatsApp number",
    phoneHelp: "Where each day's session will arrive. 9 digits, starts with 6.",
    badPhone: "That doesn't look right — 9 digits, starting with 6.",
    cta: (price: string) => `Continue to payment · ${price}`,
    secure: "Your statement shows METRON. Nothing else.",
  },
  fr: {
    kicker: "COMMENT VOULEZ-VOUS LE RECEVOIR ?",
    h: "Votre programme, à votre façon.",
    options: {
      app: {
        name: "Dans l'application Metron",
        body: "Des rappels chaque jour, votre progression mesurée en un geste, et le programme jour par jour. Ouvert dès le paiement.",
        tag: "Recommandé",
      },
      download: {
        name: "Le télécharger",
        body: "Le programme complet en fichier sur votre téléphone. Lisible sans connexion.",
        tag: "",
      },
      whatsapp: {
        name: "Sur WhatsApp",
        body: "Chaque jour, votre séance arrive sur WhatsApp. Rien à ouvrir, rien à installer.",
        tag: "",
      },
    },
    sprintNote: "Le programme de 30 jours se suit dans l'application Metron.",
    phoneLabel: "Votre numéro WhatsApp",
    phoneHelp: "C'est là qu'arrivera votre séance chaque jour. 9 chiffres, commence par 6.",
    badPhone: "Ce numéro ne semble pas correct — 9 chiffres, commençant par 6.",
    cta: (price: string) => `Continuer vers le paiement · ${price}`,
    secure: "Votre relevé affiche METRON. Rien d'autre.",
  },
} as const;

export function DeliveryStep({
  locale,
  plan,
  price,
  onContinue,
}: {
  locale: string;
  plan: Plan;
  price: string;
  onContinue: (choice: Delivery, phone: string) => void;
}) {
  const t = COPY[locale === "fr" ? "fr" : "en"];
  const [choice, setChoice] = useState<Delivery>("app");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [going, setGoing] = useState(false);
  const digits = phone.replace(/\D/g, "").slice(0, 9);

  const options: Delivery[] = plan === "sprint" ? ["app"] : ["app", "download", "whatsapp"];

  /* The number is asked only when it is what the choice needs: WhatsApp
     delivery has nowhere to go without one. The other two do not need it,
     so they do not ask — a field a man cannot see the reason for is the
     kind he abandons on. */
  const needsPhone = choice === "whatsapp";

  function go(e: React.FormEvent) {
    e.preventDefault();
    if (needsPhone && !PHONE_RE.test(digits)) return setErr(t.badPhone);
    setErr(null);
    setGoing(true);
    tapped("deliver_continue", locale, choice);
    onContinue(choice, needsPhone ? digits : "");
  }

  return (
    <form onSubmit={go} noValidate className="mt-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-jade">{t.kicker}</p>
      <h1 className="mt-2 text-[1.5rem] font-bold leading-tight text-bone">{t.h}</h1>

      <div className="mt-5 space-y-2.5" role="radiogroup" aria-label={t.kicker}>
        {options.map((k) => {
          const o = t.options[k];
          const on = choice === k;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setChoice(k)}
              className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${
                on ? "border-jade bg-jade-050" : "border-ink-600 bg-ink-850 hover:border-ink-500"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                  on ? "border-jade" : "border-ink-500"
                }`}
              >
                {on && <span className="h-2.5 w-2.5 rounded-full bg-jade" />}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[1rem] font-bold text-bone">{o.name}</span>
                  {o.tag && (
                    <span className="rounded-full bg-jade px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#04140C]">
                      {o.tag}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-[0.9rem] leading-relaxed text-mute">{o.body}</span>
              </span>
            </button>
          );
        })}
      </div>
      {plan === "sprint" && <p className="mt-2 text-[0.85rem] text-faint">{t.sprintNote}</p>}

      {needsPhone && (
      <label className="mt-6 block">
        <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-mute">
          {t.phoneLabel}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="6XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3.5 text-[17px] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
        />
        <span className="mt-1.5 block text-[12px] text-faint">{t.phoneHelp}</span>
      </label>
      )}

      {err && (
        <p className="mt-3 rounded-xl border border-alert/50 bg-alert/[0.08] px-4 py-3 text-[0.9rem] text-bone">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={going}
        className="btn-go mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[16px] font-bold disabled:opacity-60"
      >
        {going && <Spinner />}
        {t.cta(price)}
      </button>
    </form>
  );
}
