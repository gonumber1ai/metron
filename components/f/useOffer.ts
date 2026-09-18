"use client";

import { useEffect, useState } from "react";
import { load } from "@/lib/store";
import { track } from "@/lib/track";

/**
 * The visitor's offer, from the server.
 *
 * Asks /api/offer once on mount. Creating the row on first sight is the
 * server's job; this hook only fires timer_started when the reply says it
 * just did. Everything the page shows about the clock — the countdown, the
 * price, the last-chance popup — comes from what this returns, so the page
 * and the payment route can never disagree.
 *
 * Falls back to a local seven-hour clock if the request fails, so a man on a
 * bad connection still sees a countdown. That fallback cannot be charged
 * against — the payment route reads the row, and a missing row means the
 * offer price — which is the safe direction to be wrong in.
 */

export type Offer = {
  funnel: string;
  status: "live" | "expired" | "recovering" | "paid" | "recovered";
  expiresAt: number;
  recoveryUntil: number;
  expired: boolean;
  offer: number;
  full: number;
  lastChance: { url: string; price: number; until: number } | null;
  /** the row could not be read; the clock is a local stand-in */
  local: boolean;
};

const LOCAL_KEY = "metron.c.deadline";
const SEVEN_H = 7 * 3_600_000;

export function useOffer(funnelId: string | null, locale: string): Offer | null {
  const [offer, setOffer] = useState<Offer | null>(null);

  useEffect(() => {
    let dead = false;
    const ref = load(locale).ref;

    const local = (): Offer => {
      let until = 0;
      try {
        const saved = Number(window.localStorage.getItem(LOCAL_KEY));
        until = Number.isFinite(saved) && saved > 0 ? saved : Date.now() + SEVEN_H;
        window.localStorage.setItem(LOCAL_KEY, String(until));
      } catch {
        until = Date.now() + SEVEN_H;
      }
      return {
        funnel: funnelId ?? "",
        status: until <= Date.now() ? "expired" : "live",
        expiresAt: until,
        recoveryUntil: until,
        expired: until <= Date.now(),
        offer: 0,
        full: 0,
        lastChance: null,
        local: true,
      };
    };

    (async () => {
      try {
        const res = funnelId
          ? await fetch("/api/offer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ref, funnel: funnelId }),
            })
          : await fetch(`/api/offer?ref=${encodeURIComponent(ref)}`);
        const j = await res.json();
        if (dead) return;
        if (!j?.ok) return setOffer(local());
        if (j.created) track("timer_started", j.funnel, locale);
        const o: Offer = {
          funnel: j.funnel,
          status: j.status,
          expiresAt: Date.parse(j.expiresAt),
          recoveryUntil: Date.parse(j.recoveryUntil),
          expired: Boolean(j.expired),
          offer: Number(j.offer),
          full: Number(j.full),
          lastChance: j.lastChance
            ? { url: j.lastChance.url, price: Number(j.lastChance.price), until: Date.parse(j.lastChance.until) }
            : null,
          local: false,
        };
        // Keep the legacy mirrors in step so the old /c page and any cookie
        // reader see the same deadline.
        try {
          window.localStorage.setItem(LOCAL_KEY, String(o.expiresAt));
          document.cookie = `metron_offer_until=${o.expiresAt}; path=/; max-age=2592000; SameSite=Lax`;
        } catch {}
        setOffer(o);
      } catch {
        if (!dead) setOffer(local());
      }
    })();

    return () => {
      dead = true;
    };
  }, [funnelId, locale]);

  return offer;
}
