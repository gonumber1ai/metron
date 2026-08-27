"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { load, update } from "@/lib/store";
import { Logo } from "@/components/Logo";

/**
 * Log back in.
 *
 * There are no passwords here because there are no accounts in the usual
 * sense — asking a man to invent a password for this product is one more
 * reason to close the tab, and a password reset would need an email address we
 * deliberately never require.
 *
 * Instead his access code is the key, and the payment provider is the record.
 * The code is shown after checkout and repeated in the confirmation email.
 */
export function LoginClient({ locale }: { locale: string }) {
  const fr = locale === "fr";
  const router = useRouter();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "bad">("idle");
  const [lost, setLost] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const T = fr
    ? {
        h: "Se reconnecter",
        p: "Entrez votre code d'accès. Il vous a été montré après le paiement et se trouve dans votre email de confirmation.",
        label: "Code d'accès",
        cta: "Ouvrir mon programme",
        bad: "Code introuvable. Vérifiez-le, ou écrivez-nous et on vous retrouve.",
        help: "Vous ne le trouvez pas ?",
        helpLink: "Écrivez-nous sur WhatsApp",
        no: "Pas encore inscrit ?",
        noLink: "Faire le bilan",
        why: "Pas de mot de passe : votre code suffit, et nous n'avons jamais eu besoin de votre nom.",
        lostQ: "Vous avez perdu votre code ?",
        lostH: "On vous le renvoie",
        lostP: "Entrez l'email utilisé au paiement. Si un compte y correspond, le code part tout de suite.",
        lostBtn: "Envoyer mon code",
        lostSent: "Si cet email correspond à un compte, le code vient de partir. Vérifiez aussi les spams.",
        backToCode: "J'ai mon code",
      }
    : {
        h: "Log back in",
        p: "Enter your access code. It was shown to you after payment and it is in your confirmation email.",
        label: "Access code",
        cta: "Open my programme",
        bad: "That code was not found. Check it, or message us and we will find you.",
        help: "Can't find it?",
        helpLink: "Message us on WhatsApp",
        no: "Not signed up yet?",
        noLink: "Take the assessment",
        why: "No password: your code is enough, and we never needed your name.",
        lostQ: "Lost your code?",
        lostH: "We will send it again",
        lostP: "Enter the email you paid with. If it matches an account, the code goes out straight away.",
        lostBtn: "Send my code",
        lostSent: "If that email matches an account, the code has just been sent. Check spam too.",
        backToCode: "I have my code",
      };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 6) return setState("bad");
    setState("checking");
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; plan?: "test" | "sprint" };
      if (!data.ok) return setState("bad");

      // Keep the device in step with the cookie the server just set.
      update(
        (s) => ({
          ...s,
          plan: data.plan ?? "test",
          ref: code.trim() || s.ref,
          locale,
          startedAt: s.startedAt ?? new Date().toISOString(),
        }),
        locale,
      );
      router.push(`/${locale}/app`);
    } catch {
      setState("bad");
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setEmailSent(true);
    try {
      await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), locale }),
      });
    } catch {
      /* the message is deliberately the same either way */
    }
  }

  if (lost) {
    return (
      <>
        <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>
        <main className="grid min-h-screen place-items-center bg-ink-900 px-5">
          <div className="w-full max-w-sm">
            <span className="mb-8 inline-flex">
              <Logo size="sm" />
            </span>
            <h1 className="text-[1.7rem] font-bold leading-tight tracking-tight">{T.lostH}</h1>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-mute">{T.lostP}</p>

            {emailSent ? (
              <p className="mt-6 rounded-xl border-l-2 border-jade bg-jade-050 px-4 py-3.5 text-[0.95rem] leading-relaxed text-bone">
                {T.lostSent}
              </p>
            ) : (
              <form onSubmit={sendCode} className="mt-6">
                <input
                  type="email"
                  inputMode="email"
                  autoCapitalize="off"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border-2 border-ink-600 bg-ink-900 px-4 py-3.5 text-[1rem] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
                />
                <button
                  type="submit"
                  className="mt-3 w-full rounded-2xl btn-go py-4 text-[1rem] font-bold"
                >
                  {T.lostBtn}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setLost(false);
                setEmailSent(false);
              }}
              className="mt-6 text-[0.9rem] text-jade underline underline-offset-4"
            >
              {T.backToCode}
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <main className="grid min-h-screen place-items-center bg-ink-900 px-5">
        <div className="w-full max-w-sm">
          <span className="mb-8 inline-flex">
            <Logo size="sm" />
          </span>

          <h1 className="text-[1.7rem] font-bold leading-tight tracking-tight">{T.h}</h1>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-mute">{T.p}</p>

          <form onSubmit={submit} className="mt-7">
            <label className="block text-[0.88rem] font-bold text-bone">{T.label}</label>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (state === "bad") setState("idle");
              }}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="xxxxxxxxxxxxxxxxxx"
              className="metric mt-2 w-full rounded-xl border-2 border-ink-600 bg-ink-900 px-4 py-4 text-[1.05rem] font-bold tracking-wide text-bone placeholder:text-faint focus:border-jade focus:outline-none"
            />
            {state === "bad" && (
              <p className="mt-2 text-[0.88rem] leading-snug text-alert">{T.bad}</p>
            )}

            <button
              type="submit"
              disabled={state === "checking" || code.trim().length < 6}
              className="mt-4 w-full rounded-2xl btn-go py-4 text-[1rem] font-bold disabled:opacity-40"
            >
              {state === "checking" ? "…" : T.cta}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setLost(true)}
            className="mt-6 w-full rounded-xl border border-ink-600 py-3 text-[0.92rem] font-bold text-bone"
          >
            {T.lostQ}
          </button>

          <p className="mt-4 text-[0.88rem] leading-relaxed text-faint">
            {T.help}{" "}
            <a
              href="https://wa.me/12089054119"
              className="text-jade underline underline-offset-4"
            >
              {T.helpLink}
            </a>
          </p>

          <p className="mt-2 text-[0.88rem] leading-relaxed text-faint">
            {T.no}{" "}
            <Link href={`/${locale}/quiz`} className="text-jade underline underline-offset-4">
              {T.noLink}
            </Link>
          </p>

          <p className="mt-8 border-t border-ink-700 pt-5 text-[0.8rem] leading-relaxed text-faint">
            {T.why}
          </p>
        </div>
      </main>
    </>
  );
}
