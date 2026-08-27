"use client";

import { load } from "./store";

/**
 * Fire a funnel event.
 *
 * Never awaited and never allowed to throw: measurement must not be able to
 * break the thing it measures. Uses sendBeacon where available so an event
 * fired as he navigates away still arrives.
 */
export function track(name: string, detail?: string, locale = "en"): void {
  try {
    const s = load(locale);
    const payload = JSON.stringify({
      ref: s.ref,
      name,
      detail,
      locale,
      country: s.country,
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}
