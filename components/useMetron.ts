"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { load, save, emptyState, type State } from "@/lib/store";

/**
 * Single source of truth for client state.
 *
 * Reads once on mount (localStorage is unavailable during SSR), then keeps a
 * React copy in sync.
 *
 * ── THE MIRROR ───────────────────────────────────────────────────────────
 * Every change is also pushed to the server, debounced. His device stays the
 * source of truth so the app keeps working with no network — a man doing a
 * session at 11pm on bad signal must not be blocked by a failed request — but
 * the copy means his history survives a cleared browser, and it is the only
 * way to see whether anyone is actually doing what they paid for.
 *
 * The push carries no ref. The server takes that from his signed cookie, so a
 * device cannot write progress against somebody else's code.
 */

const SYNC_DELAY_MS = 2500;

export function useMetron(locale: string) {
  const [state, setState] = useState<State>(() => emptyState(locale));
  const [ready, setReady] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setState(load(locale));
    setReady(true);
  }, [locale]);

  const sync = useCallback((s: State) => {
    // Only a customer has anything worth mirroring, and only he will be
    // accepted by the endpoint anyway.
    if (!s.plan) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: s.day,
          startedAt: s.startedAt,
          measurements: s.measurements,
          sessions: s.sessions,
          markers: s.markerLogs,
        }),
        keepalive: true,
      }).catch(() => {
        /* the local copy already saved; a failed mirror changes nothing */
      });
    }, SYNC_DELAY_MS);
  }, []);

  const mutate = useCallback(
    (fn: (s: State) => State) => {
      setState((prev) => {
        const next = fn(prev);
        save(next);
        sync(next);
        return next;
      });
    },
    [sync],
  );

  // A tab closed mid-session should still deliver the last change.
  useEffect(() => {
    function flush() {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      const s = load(locale);
      if (!s.plan) return;
      const payload = JSON.stringify({
        day: s.day,
        startedAt: s.startedAt,
        measurements: s.measurements,
        sessions: s.sessions,
        markers: s.markerLogs,
      });
      navigator.sendBeacon?.(
        "/api/progress",
        new Blob([payload], { type: "application/json" }),
      );
    }
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [locale]);

  return { state, mutate, ready };
}
