"use client";

import { useLinkStatus } from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LogoMark } from "./Logo";

/**
 * The screen tells him it heard the tap.
 *
 * An inline spinner inside a link works everywhere except the one place it was
 * needed most: the menu drawer closes the moment he taps, so the spinner it
 * contains is unmounted before it can render. He is left looking at the screen
 * he was already on, with nothing moving, and taps something else.
 *
 * So the feedback moves to the middle of the screen where it cannot be
 * dismissed by the thing that triggered it. The mark pulses until the route
 * is ready.
 *
 * Two details that matter more than they look:
 *
 *   The 300ms delay. A prefetched route arrives in well under that, and an
 *   overlay that flashes on every fast tap is worse than none — it makes a
 *   quick app feel like it is struggling.
 *
 *   A counter, not a boolean. Several links can report pending at once (he
 *   taps twice, or a hover prefetch overlaps a click), and a boolean would be
 *   cleared by the first one to finish while the real navigation is still
 *   running.
 */

type Ctx = { start: () => void; stop: () => void };
const NavCtx = createContext<Ctx | null>(null);

const SHOW_AFTER_MS = 300;

export function NavPendingProvider({
  children,
  label,
}: {
  children: React.ReactNode;
  /** "Opening…" — localised by the caller, which has the dictionary */
  label: string;
}) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);

  const start = useCallback(() => setCount((n) => n + 1), []);
  const stop = useCallback(() => setCount((n) => Math.max(0, n - 1)), []);
  const value = useMemo(() => ({ start, stop }), [start, stop]);

  useEffect(() => {
    if (count === 0) {
      setVisible(false);
      return;
    }
    const id = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [count]);

  return (
    <NavCtx.Provider value={value}>
      {children}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 grid place-items-center bg-ink-900/70 backdrop-blur-[2px]"
        >
          <span className="flex flex-col items-center gap-3">
            <span className="animate-pulse text-jade">
              <LogoMark className="h-11 w-11" />
            </span>
            <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-mute">
              {label}
            </span>
          </span>
        </div>
      )}
    </NavCtx.Provider>
  );
}

/**
 * Drop inside a <Link> to report that link's pending state to the overlay.
 *
 * Must be a CHILD of the Link: useLinkStatus reads the nearest Link above it
 * and reports a permanently idle state anywhere else, which fails silently.
 */
export function NavPendingProbe() {
  const { pending } = useLinkStatus();
  const ctx = useContext(NavCtx);
  // Tracks what this probe has already reported, so an unmount mid-navigation
  // — which is exactly what the closing drawer does — still releases its hold
  // on the counter instead of pinning the overlay open forever.
  const held = useRef(false);

  useEffect(() => {
    if (!ctx) return;
    if (pending && !held.current) {
      held.current = true;
      ctx.start();
    } else if (!pending && held.current) {
      held.current = false;
      ctx.stop();
    }
  }, [pending, ctx]);

  useEffect(() => {
    return () => {
      if (held.current) {
        held.current = false;
        ctx?.stop();
      }
    };
  }, [ctx]);

  return null;
}
