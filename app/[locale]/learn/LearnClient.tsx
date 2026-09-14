"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/track";
import { load, update } from "@/lib/store";
import { Spinner, useAction } from "@/components/Pending";

/**
 * "Learn test" — a signup page for the bootcamp starting 27 September.
 *
 * One job: a name, a number and an email, and the promise that a person
 * will call. Nothing to buy here, so there is nothing to persuade past; the
 * only question a visitor has is "is this for someone like me", and the page
 * answers it once, plainly, before the form.
 *
 * ── TRACKING ──────────────────────────────────────────────────────────────
 * start_view with detail 'learn' on arrival, learn_signup on a successful
 * submit, both under whatever ?c= tag the link carried — so the admin's
 * Learn tab reads arrivals against signups per link, per day, on the same
 * machinery as the sales funnels.
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
    phone: "Your WhatsApp number",
    email: "Your email",
    cta: "Sign me up",
    doneH: "You're on the list.",
    doneP: "A representative will contact you shortly with the details. Keep your phone close.",
    errName: "Add your name.",
    errPhone: "That number doesn't look right — 9 digits, starting with 6.",
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
    phone: "Votre numéro WhatsApp",
    email: "Votre e-mail",
    cta: "Je m'inscris",
    doneH: "C'est noté.",
    doneP: "Un représentant vous contactera très vite avec tous les détails. Gardez votre téléphone à portée de main.",
    errName: "Mettez votre nom.",
    errPhone: "Ce numéro ne semble pas correct — 9 chiffres, commençant par 6.",
    errEmail: "Cet e-mail ne semble pas correct.",
    errNet: "Ça n'est pas passé. Vérifiez votre connexion et réessayez.",
  },
} as const;

const PHONE_RE = /^6\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LearnClient({ locale }: { locale: string }) {
  const t = COPY[locale === "fr" ? "fr" : "en"];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Same campaign capture as the sales pages, so ?c=learn1 lands in the
    // same column of the same table.
    try {
      const p = new URLSearchParams(window.location.search);
      const campaign = (p.get("c") ?? p.get("utm_campaign") ?? "")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 40);
      if (campaign) update((s) => (s.campaign ? s : { ...s, campaign }), locale);
    } catch {}
    track("start_view", "learn", locale);
  }, [locale]);

  const digits = phone.replace(/\D/g, "");

  const [sending, submit] = useAction(async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (name.trim().length < 2) return setErr(t.errName);
    if (!PHONE_RE.test(digits)) return setErr(t.errPhone);
    if (!EMAIL_RE.test(email.trim())) return setErr(t.errEmail);

    const res = await fetch("/api/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: digits,
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
    "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-[16px] text-white placeholder:text-white/40 focus:border-lime focus:outline-none";

  return (
    <>
      <style>{`body{background:#030303;color:#fff}body::before{display:none}`}</style>
      <div className="c-page">
        {/* No header, and no Metron mark. This is a different product for a
            different person, and the brand on the men's-health site has no
            business on a coding bootcamp — least of all in front of someone
            who might look it up. */}
        <main className="c-shell">
          <section className="mx-auto max-w-2xl px-5 pt-10 md:pt-16">
            <p className="c-kicker">{t.kicker}</p>
            <h1 className="c-heading">
              {t.h[0]}
              <br />
              {t.h[1]}
              <br />
              <span>{t.h[2]}</span>
            </h1>
            <p className="mt-5 text-[0.95rem] font-bold uppercase tracking-[0.12em] text-lime">
              {t.when}
            </p>

            <div className="mt-8 rounded-2xl border border-lime/30 bg-black/50 p-6">
              <h2 className="text-[1.25rem] font-bold leading-snug text-white md:text-[1.4rem]">
                {t.easyH}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-white/80">{t.easyP}</p>
              <ul className="mt-5 space-y-2.5">
                {t.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[0.95rem] text-white/85">
                    <span aria-hidden className="mt-0.5 text-lime">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <section className="mt-8 rounded-3xl border border-white/10 bg-coal-800/90 p-6 md:p-8">
              {done ? (
                <div className="py-4 text-center">
                  <p className="text-[1.5rem] font-bold text-lime">{t.doneH}</p>
                  <p className="mx-auto mt-3 max-w-md text-[1rem] leading-relaxed text-white/80">
                    {t.doneP}
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <h2 className="text-[1.3rem] font-bold text-white">{t.formH}</h2>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-white/65">{t.formP}</p>

                  <div className="mt-6 space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-white/60">
                        {t.name}
                      </span>
                      <input
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={input}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-white/60">
                        {t.phone}
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="6XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={input}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-white/60">
                        {t.email}
                      </span>
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
                    <p className="mt-4 rounded-xl border border-alert/50 bg-alert/[0.08] px-4 py-3 text-[0.9rem] text-white">
                      {err}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-lime c-cta c-full mt-6 text-[15px] disabled:opacity-60"
                  >
                    {sending && <Spinner />}
                    {t.cta}
                  </button>
                </form>
              )}
            </section>
          </section>
        </main>
      </div>
    </>
  );
}
