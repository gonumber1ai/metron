"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { track } from "@/lib/track";
import { update } from "@/lib/store";
import { Logo } from "@/components/Logo";

/**
 * The page the ads point at.
 *
 * ── WHAT THIS IS ──────────────────────────────────────────────────────────
 * A real adult-confirmation gate and a plain description of the product. It
 * exists because this category is a restricted one: the ad, the ad's
 * destination and the creative all get looked at, and a link that lands
 * straight on explicit sales copy is the version that gets an account
 * restricted rather than a page rejected.
 *
 * ── WHAT THIS IS NOT ──────────────────────────────────────────────────────
 * It is not a cloak. Every visitor sees exactly this page — a reviewer, a
 * crawler and a buyer get identical HTML, and the button leads where it says
 * it leads. Serving reviewers something different from buyers is what gets a
 * business permanently banned rather than an ad disapproved, and it would
 * also be a lie told to a person doing their job.
 *
 * So the copy here is simply the honest, unembarrassing version: what the
 * programme is, how long it takes, that it is private, that nothing is
 * swallowed, and that it is for adults. Everything true, nothing explicit.
 *
 * ── WHAT IT DOES FOR THE FUNNEL ───────────────────────────────────────────
 * It captures the campaign tag before anything else and hands it forward, so
 * attribution survives the extra hop. And it costs one tap, which filters the
 * mis-taps out of the sales page's numbers — a man who will not confirm he is
 * an adult was never going to pay.
 */
export function GateClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const router = useRouter();
  const [tag, setTag] = useState("");

  useEffect(() => {
    let captured = "";
    try {
      const url = new URLSearchParams(window.location.search);
      captured = (url.get("c") ?? url.get("utm_campaign") ?? "")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 40);
      // First touch wins, same rule as the quiz and the sales page: the ad
      // that introduced him keeps the credit even if he comes back later
      // through a different one.
      if (captured) update((st) => (st.campaign ? st : { ...st, campaign: captured }), locale);
      setTag(captured);
    } catch {
      /* a missing tag is not worth breaking the page over */
    }
    track("gate_view", captured || undefined, locale);
  }, [locale]);

  function go() {
    track("gate_pass", tag || undefined, locale);
    // Carry the tag forward in the URL as well as in the store, so the sales
    // page attributes correctly even for a man whose storage is wiped between
    // the two hops.
    router.push(`/${locale}/start${tag ? `?c=${encodeURIComponent(tag)}` : ""}`);
  }

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-900/90 backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
            <Logo size="sm" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-xl flex-1 px-5 py-12 md:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-jade">
            {t.gate.kicker}
          </p>

          <h1 className="mt-4 text-[2rem] leading-[1.1] md:text-[2.5rem]">{t.gate.h}</h1>

          <p className="mt-5 text-[1.15rem] font-semibold leading-[1.6] text-mute">
            {t.gate.sub}
          </p>

          {/* The button, before the 18+ box rather than inside it.
              It used to sit at the bottom of a bordered confirmation panel, so
              the first thing a man met was a legal notice and the way forward
              was underneath it. Eighteen of twenty-three stopped here. The
              door goes first; the notice it carries goes after. */}
          <button
            type="button"
            onClick={go}
            className="mt-9 flex w-full items-center justify-center rounded-full btn-go px-6 py-[18px] text-[16px] font-bold"
          >
            {t.gate.cta}
          </button>

          <p className="mt-5 text-center text-[13.5px] text-faint">
            {t.gate.haveAccount}{" "}
            <Link
              href={`/${locale}/login`}
              className="font-bold text-jade underline-offset-2 hover:underline"
            >
              {t.gate.login}
            </Link>
          </p>

          <section className="mt-10 border-t border-ink-700 pt-7">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-faint">
              {t.gate.ageH}
            </h2>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-mute">{t.gate.age}</p>

            <p className="mt-4 text-[12px] leading-relaxed text-faint">{t.gate.note}</p>

            {/* A real way out. A gate with only one door is a formality, and a
                formality is not a safeguard. */}
            <a
              href="https://www.google.com"
              className="mt-5 inline-block text-[13px] text-faint underline-offset-2 hover:text-mute hover:underline"
            >
              {t.gate.leave}
            </a>
          </section>
        </main>
      </div>
    </>
  );
}
