"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/track";
import { load, update } from "@/lib/store";
import { Spinner, useAction } from "@/components/Pending";

/**
 * "Learn test" — a signup page for the bootcamp starting 27 September.
 * Australian audience.
 *
 * One job: a name, a mobile number and an email, and the promise that a
 * person will call. Nothing to buy here, so there is nothing to persuade
 * past; the only question a visitor has is "is this for someone like me",
 * and the page answers it once, plainly, before the form.
 *
 * ── ITS OWN LOOK ──────────────────────────────────────────────────────────
 * Navy and gold, not the black and lime of the rest of the site. Different
 * product, different country, and nothing here should read as the same
 * brand as the men's-health pages — so it borrows none of their classes.
 *
 * ── TRACKING ──────────────────────────────────────────────────────────────
 * start_view with detail 'learn' on arrival, learn_signup on a successful
 * submit, both under whatever ?c= tag the link carried. The admin's Learn
 * tab reads arrivals against signups per link, per day — computed from the
 * raw events in the page itself, so there is no view to create first.
 */

const COPY = {
  en: {
    kicker: "LEARN TO BUILD",
    h: ["WEBSITES,", "MOBILE APPS &", "AI AUTOMATIONS"],
    when: "Hands-on bootcamp · starts 27 September",
    easyH: "No, you don't need 3 years of training.",
    easyP:
      "If you can use a phone, you can do this. We start from zero and you build real things from the first week — not theory, not slides. Sites people can visit, apps people can install, automations that do the work for you.",
    points: [
      "Beginner-friendly. No coding background needed.",
      "Live sessions, real projects, real feedback.",
      "Small group, so nobody gets left behind.",
    ],
    formH: "Save your seat",
    formP: "Leave your details and a representative will contact you with the schedule, the fee and everything you need to start.",
    name: "Your name",
    phone: "Your mobile number",
    email: "Your email",
    cta: "Sign me up",
    doneH: "You're on the list.",
    doneP: "A representative will contact you shortly with the details. Keep your phone close.",
    errName: "Add your name.",
    errPhone: "That doesn't look like an Australian mobile — 04XX XXX XXX.",
    errEmail: "That email doesn't look right.",
    errNet: "That didn't go through. Check your connection and try again.",
  },
  fr: {
    kicker: "APPRENEZ À CRÉER",
    h: ["DES SITES WEB,", "DES APPLIS MOBILES &", "DES AUTOMATISATIONS IA"],
    when: "Bootcamp pratique · début le 27 septembre",
    easyH: "Non, vous n'avez pas besoin de 3 ans de formation.",
    easyP:
      "Si vous savez utiliser un téléphone, vous pouvez le faire. On part de zéro et vous construisez de vraies choses dès la première semaine — pas de théorie, pas de diapos. Des sites que les gens visitent, des applis qu'ils installent, des automatisations qui travaillent à votre place.",
    points: [
      "Pour débutants. Aucune base en code nécessaire.",
      "Sessions en direct, vrais projets, vrais retours.",
      "Petit groupe, personne n'est laissé derrière.",
    ],
    formH: "Réservez votre place",
    formP: "Laissez vos coordonnées et un représentant vous contactera avec le programme, le tarif et tout ce qu'il faut pour commencer.",
    name: "Votre nom",
    phone: "Votre numéro de mobile",
    email: "Votre e-mail",
    cta: "Je m'inscris",
    doneH: "C'est noté.",
    doneP: "Un représentant vous contactera très vite avec tous les détails. Gardez votre téléphone à portée de main.",
    errName: "Mettez votre nom.",
    errPhone: "Ce numéro ne ressemble pas à un mobile australien — 04XX XXX XXX.",
    errEmail: "Cet e-mail ne semble pas correct.",
    errNet: "Ça n'est pas passé. Vérifiez votre connexion et réessayez.",
  },
} as const;

/**
 * Australian mobile, however he typed it: 0412 345 678, +61 412 345 678,
 * 61412345678, 412345678. Returns the nine national digits (4xxxxxxxx) or
 * null. Mirrored in the API — this is for the error before the round trip.
 */
export function auMobile(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("61")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return /^4\d{8}$/.test(d) ? d : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LearnClient({ locale }: { locale: string }) {
  const t = COPY[locale === "fr" ? "fr" : "en"];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const campaign = (p.get("c") ?? p.get("utm_campaign") ?? "")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 40);
      if (campaign) update((s) => (s.campaign ? s : { ...s, campaign }), locale);
    } catch {}
    track("start_view", "learn", locale);
  }, [locale]);

  const [sending, submit] = useAction(async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const mobile = auMobile(phone);
    if (name.trim().length < 2) return setErr(t.errName);
    if (!mobile) return setErr(t.errPhone);
    if (!EMAIL_RE.test(email.trim())) return setErr(t.errEmail);

    const res = await fetch("/api/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: mobile,
        email: email.trim(),
        locale,
        ref: load(locale).ref,
        campaign: load(locale).campaign,
      }),
    });
    if (!res.ok) return setErr(t.errNet);
    track("learn_signup", "learn", locale);
    setDone(true);
  });

  const input =
    "w-full rounded-xl border border-white/20 bg-[#061229] px-4 py-3.5 text-[16px] text-white placeholder:text-white/35 focus:border-[#ffb81c] focus:outline-none";
  const label = "mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-white/60";

  return (
    <>
      <style>{`body{background:#0a1a33;color:#fff}body::before{display:none}`}</style>
      <main className="min-h-screen bg-[#0a1a33] text-white">
        <section className="mx-auto max-w-2xl px-5 pb-16 pt-12 md:pt-20">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#ffb81c]">
            {t.kicker}
          </p>
          <h1 className="mt-3 text-[2.4rem] font-black uppercase leading-[0.95] tracking-[-0.02em] md:text-[3.6rem]">
            {t.h[0]}
            <br />
            {t.h[1]}
            <br />
            <span className="text-[#ffb81c]">{t.h[2]}</span>
          </h1>
          <p className="mt-6 text-[0.95rem] font-bold uppercase tracking-[0.12em] text-[#ffb81c]">
            {t.when}
          </p>

          <div className="mt-9 rounded-2xl border border-[#ffb81c]/35 bg-[#061229] p-6">
            <h2 className="text-[1.25rem] font-bold leading-snug md:text-[1.4rem]">{t.easyH}</h2>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-white/80">{t.easyP}</p>
            <ul className="mt-5 space-y-2.5">
              {t.points.map((p) => (
                <li key={p} className="flex gap-3 text-[0.95rem] text-white/85">
                  <span aria-hidden className="mt-0.5 text-[#ffb81c]">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <section className="mt-8 rounded-3xl border border-white/10 bg-[#0f2447] p-6 md:p-8">
            {done ? (
              <div className="py-4 text-center">
                <p className="text-[1.5rem] font-bold text-[#ffb81c]">{t.doneH}</p>
                <p className="mx-auto mt-3 max-w-md text-[1rem] leading-relaxed text-white/80">
                  {t.doneP}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 className="text-[1.3rem] font-bold">{t.formH}</h2>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-white/65">{t.formP}</p>

                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className={label}>{t.name}</span>
                    <input
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className={label}>{t.phone}</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="04XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <span className={label}>{t.email}</span>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={input}
                    />
                  </label>
                </div>

                {err && (
                  <p className="mt-4 rounded-xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-[0.9rem]">
                    {err}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ffb81c] px-6 py-4 text-[15px] font-black uppercase tracking-wide text-[#0a1a33] transition-colors hover:bg-[#ffc94d] disabled:opacity-60"
                >
                  {sending && <Spinner />}
                  {t.cta}
                </button>
              </form>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
