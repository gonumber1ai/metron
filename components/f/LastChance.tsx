"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/track";
import type { Offer } from "./useOffer";

/**
 * The last-chance popup.
 *
 * Shown to a man whose clock has run, who has not paid, and who is inside the
 * recovery window — on the first visit where all three are true, once per
 * tab-session. It carries the checkout link for HIS funnel with lc=1, and
 * that link is what makes the payment route honour the offer price again.
 *
 * ── HONEST ABOUT WHAT IT IS ──────────────────────────────────────────────
 * The offer expired. This is a second, dated chance at the same price — the
 * date is printed on it — and when that date passes the popup stops and the
 * price stays full. It is not a countdown that quietly restarts.
 *
 * Every impression, click and dismissal is an event, so the admin can say
 * what the popup earned rather than assume.
 */

const SEEN_KEY = "metron.lc.seen";

const COPY = {
  en: {
    kicker: "LAST CHANCE",
    h: (p: string) => `Lock in your programme at ${p}`,
    p: (until: string) =>
      `Your offer ran out, but you came back — so it's open one more time, at the same price, until ${until}. After that it's the full price for everyone.`,
    cta: (p: string) => `Get the 10-Day at ${p} →`,
    no: "Not now",
  },
  fr: {
    kicker: "DERNIÈRE CHANCE",
    h: (p: string) => `Verrouillez votre programme à ${p}`,
    p: (until: string) =>
      `Votre offre est passée, mais vous êtes revenu — alors elle est ouverte une dernière fois, au même prix, jusqu'au ${until}. Après, c'est le prix que tout le monde paie.`,
    cta: (p: string) => `Prendre le Défi 10 jours à ${p} →`,
    no: "Pas maintenant",
  },
} as const;

const FCFA = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;

export function LastChance({ offer, locale }: { offer: Offer | null; locale: string }) {
  const t = COPY[locale === "fr" ? "fr" : "en"];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!offer?.lastChance) return;
    try {
      if (window.sessionStorage.getItem(SEEN_KEY) === "1") return;
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    // A beat after the page settles, so it reads as a message and not a wall.
    const id = window.setTimeout(() => {
      setOpen(true);
      track("last_chance_shown", offer.funnel, locale, { cta: "lc_popup" });
    }, 1200);
    return () => window.clearTimeout(id);
  }, [offer, locale]);

  if (!open || !offer?.lastChance) return null;
  const price = FCFA(offer.lastChance.price);
  const until = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Douala",
  }).format(new Date(offer.lastChance.until));

  return (
    <div className="c-vid-back" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
      <div className="c-lc" onClick={(e) => e.stopPropagation()}>
        <p className="c-kicker">{t.kicker}</p>
        <h2 className="c-lc-h">{t.h(price)}</h2>
        <p className="c-lc-p">{t.p(until)}</p>
        <Link
          href={offer.lastChance.url}
          className="btn-lime c-cta c-full"
          onClick={() => track("last_chance_clicked", offer.funnel, locale, { cta: "lc_checkout" })}
        >
          <span className="c-cta-label">{t.cta(price)}</span>
        </Link>
        <button
          type="button"
          className="c-lc-no"
          onClick={() => {
            track("last_chance_dismissed", offer.funnel, locale, { cta: "lc_dismiss" });
            setOpen(false);
          }}
        >
          {t.no}
        </button>
      </div>
    </div>
  );
}
