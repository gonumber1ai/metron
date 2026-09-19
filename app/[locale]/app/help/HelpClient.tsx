"use client";

import { useState } from "react";
import { load } from "@/lib/store";
import { Spinner, useAction } from "@/components/Pending";
import { track } from "@/lib/track";

/**
 * Help & Support — Section 5.13. A form, and that is the entire support
 * surface. Category, message, an optional WhatsApp number. It emails the
 * owner and records a row. Reply expectation: 48 hours. No chat.
 */

const T = {
  en: {
    h: "Help & Support",
    p: "Tell us what's wrong. We reply within 48 hours.",
    cat: "What is it about?",
    cats: { payment: "Payment", training: "Training", account: "Account", other: "Other" },
    msg: "Your message",
    wa: "WhatsApp number (optional)",
    waHelp: "Only if you'd rather we reply there.",
    send: "Send",
    done: "Received. We reply within 48 hours.",
    err: "That didn't go through. Check your connection and try again.",
  },
  fr: {
    h: "Aide & support",
    p: "Dites-nous ce qui ne va pas. Nous répondons sous 48 heures.",
    cat: "C'est à propos de quoi ?",
    cats: { payment: "Paiement", training: "Entraînement", account: "Compte", other: "Autre" },
    msg: "Votre message",
    wa: "Numéro WhatsApp (facultatif)",
    waHelp: "Seulement si vous préférez une réponse là-bas.",
    send: "Envoyer",
    done: "Bien reçu. Nous répondons sous 48 heures.",
    err: "Ça n'est pas passé. Vérifiez votre connexion et réessayez.",
  },
} as const;

export function HelpClient({ locale }: { locale: string }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const [cat, setCat] = useState<keyof typeof t.cats>("training");
  const [msg, setMsg] = useState("");
  const [wa, setWa] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);

  const [sending, submit] = useAction(async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(false);
    const res = await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, message: msg.trim(), contact: wa.replace(/\D/g, "") || undefined, locale, ref: load(locale).ref }),
    });
    if (!res.ok) return setErr(true);
    track("help_request", cat, locale);
    setDone(true);
  });

  const input = "w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-[16px] text-bone placeholder:text-white/35 focus:border-jade focus:outline-none";

  return (
    <div className="px-5 pt-6">
      <h1 className="text-[1.4rem] font-bold text-bone">{t.h}</h1>
      <p className="mt-1 text-[0.9rem] text-white/60">{t.p}</p>
      {done ? (
        <p className="mt-8 rounded-xl border border-jade/40 bg-jade-050/40 px-4 py-4 text-[0.98rem] text-bone">{t.done}</p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-white/50">{t.cat}</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(t.cats) as (keyof typeof t.cats)[]).map((k) => (
                <button key={k} type="button" onClick={() => setCat(k)} className={`rounded-xl border px-3 py-3 text-[0.95rem] font-semibold ${cat === k ? "border-jade bg-jade-050 text-bone" : "border-white/12 text-white/70"}`}>
                  {t.cats[k]}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-wide text-white/50">{t.msg}</span>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} className={input} />
          </label>
          <label className="block">
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-wide text-white/50">{t.wa}</span>
            <input type="tel" inputMode="numeric" value={wa} onChange={(e) => setWa(e.target.value)} placeholder="6XX XXX XXX" className={input} />
            <span className="mt-1 block text-[12px] text-white/40">{t.waHelp}</span>
          </label>
          {err && <p className="text-[0.9rem] text-alert">{t.err}</p>}
          <button type="submit" disabled={sending || msg.trim().length < 5} className="btn-go flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-[16px] font-bold disabled:opacity-40">
            {sending && <Spinner />}
            {t.send}
          </button>
        </form>
      )}
    </div>
  );
}
