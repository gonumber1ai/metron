"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { load } from "@/lib/store";
import { Spinner, useAction } from "@/components/Pending";
import { track } from "@/lib/track";
import { adoptAccount } from "./useAccount";

/**
 * Sign up or log in. Two fields. Nothing else, ever — Section 13.
 */

const T = {
  en: {
    signup: { h: "Start Day 1", p: "Your WhatsApp number and a password. That's the whole account.", cta: "Create account →", alt: "Already have an account?", altCta: "Log in" },
    login: { h: "Log in", p: "", cta: "Log in →", alt: "New here?", altCta: "Start Day 1 free" },
    phone: "WhatsApp number", pw: "Password", pwHelp: "At least 6 characters.",
    errPhone: "That doesn't look right — 9 digits, starting with 6.",
    errPw: "At least 6 characters.",
    errExists: "That number already has an account. Log in instead.",
    errWrong: "Wrong number or password.",
    errNet: "That didn't go through. Check your connection and try again.",
  },
  fr: {
    signup: { h: "Commencer le jour 1", p: "Votre numéro WhatsApp et un mot de passe. C'est tout le compte.", cta: "Créer le compte →", alt: "Déjà un compte ?", altCta: "Se connecter" },
    login: { h: "Se connecter", p: "", cta: "Se connecter →", alt: "Nouveau ici ?", altCta: "Commencer le jour 1 gratuit" },
    phone: "Numéro WhatsApp", pw: "Mot de passe", pwHelp: "6 caractères minimum.",
    errPhone: "Ce numéro ne semble pas correct — 9 chiffres, commençant par 6.",
    errPw: "6 caractères minimum.",
    errExists: "Ce numéro a déjà un compte. Connectez-vous.",
    errWrong: "Numéro ou mot de passe incorrect.",
    errNet: "Ça n'est pas passé. Vérifiez votre connexion et réessayez.",
  },
} as const;

export function AuthForm({ locale, mode }: { locale: string; mode: "signup" | "login" }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const m = t[mode];
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const [busy, submit] = useAction(async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const digits = phone.replace(/\D/g, "").replace(/^237/, "");
    if (!/^6\d{8}$/.test(digits)) return setErr(t.errPhone);
    if (pw.length < 6) return setErr(t.errPw);
    const s = load(locale);
    if (mode === "signup") track("signup_start", undefined, locale);
    let res: Response;
    try {
      res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits, password: pw, locale, ref: s.ref, campaign: s.campaign, funnel: s.funnel }),
      });
    } catch {
      return setErr(t.errNet);
    }
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      return setErr(j.error === "exists" ? t.errExists : j.error === "wrong" ? t.errWrong : j.error === "phone" ? t.errPhone : j.error === "password" ? t.errPw : t.errNet);
    }
    await adoptAccount(j.uid, locale);
    router.push(`/${locale}/app`);
  });

  const input = "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-[17px] text-bone placeholder:text-white/35 focus:border-jade focus:outline-none";
  const label = "mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-white/55";

  return (
    <div className="mx-auto max-w-sm px-5 pt-12">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-jade">METRON</p>
      <h1 className="mt-2 text-[1.6rem] font-bold leading-tight text-bone">{m.h}</h1>
      {m.p && <p className="mt-2 text-[0.95rem] text-white/65">{m.p}</p>}

      <form onSubmit={submit} noValidate className="mt-7 space-y-4">
        <label className="block">
          <span className={label}>{t.phone}</span>
          <input type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="6XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
        </label>
        <label className="block">
          <span className={label}>{t.pw}</span>
          <input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={pw} onChange={(e) => setPw(e.target.value)} className={input} />
          {mode === "signup" && <span className="mt-1 block text-[12px] text-white/40">{t.pwHelp}</span>}
        </label>
        {err && <p className="rounded-xl border border-alert/50 bg-alert/[0.08] px-4 py-3 text-[0.9rem] text-bone">{err}</p>}
        <button type="submit" disabled={busy} className="btn-go flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-[16px] font-bold disabled:opacity-60">
          {busy && <Spinner />}
          {m.cta}
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-white/55">
        {m.alt}{" "}
        <Link href={`/${locale}/${mode === "signup" ? "login" : "signup"}`} className="font-bold text-jade">{m.altCta}</Link>
      </p>
    </div>
  );
}
