"use client";

import { useCallback, useEffect, useState } from "react";
import { load, save, emptyState, type State } from "@/lib/store";

/**
 * Single source of truth for client state.
 *
 * Reads once on mount (localStorage is unavailable during SSR), then keeps a
 * React copy in sync. Swapping the store for Supabase means changing load/save
 * and nothing in the components.
 */
export function useMetron(locale: string) {
  const [state, setState] = useState<State>(() => emptyState(locale));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load(locale));
    setReady(true);
  }, [locale]);

  const mutate = useCallback((fn: (s: State) => State) => {
    setState((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  return { state, mutate, ready };
}
