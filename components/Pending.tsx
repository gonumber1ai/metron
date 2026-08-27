"use client";

import { useLinkStatus } from "next/link";
import { useCallback, useRef, useState } from "react";

/**
 * Click feedback.
 *
 * Every unresponsive click in this app came from the same thing: the work
 * started, nothing on screen changed, and the man clicked again — or clicked
 * something else, assuming the first thing had failed. On a slow Cameroonian
 * connection that gap is seconds long, and a double-click on a pay button or a
 * complete-day button is not a cosmetic problem.
 *
 * Two primitives, both of which make the pending state impossible to forget:
 *
 *   <LinkPending />   drop inside a <Link> to show a spinner while the route
 *                     is loading. Uses next/link's own pending state, so it is
 *                     accurate rather than a guessed timer.
 *
 *   useAction()       wraps an async handler: disables re-entry, tracks
 *                     pending, and never leaves the button stuck if it throws.
 */

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`h-[18px] w-[18px] animate-spin ${className}`}
      fill="none"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.6" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Shows a spinner while the enclosing <Link> is navigating.
 *
 * Must be rendered as a CHILD of the Link — useLinkStatus reads the state of
 * the nearest Link above it, and returns a permanently idle state anywhere
 * else, which fails silently and looks like it works.
 */
export function LinkPending({ className = "" }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner className={className} />;
}

/**
 * Runs an async handler once at a time.
 *
 * Returns [pending, run]. `run` ignores calls made while the previous one is
 * still in flight, which is the actual fix for double-charging: disabling the
 * button is the visible half, refusing the second call is the half that
 * matters when the click lands before React has re-rendered.
 */
export function useAction<A extends unknown[]>(
  fn: (...args: A) => Promise<unknown>,
): [boolean, (...args: A) => Promise<void>] {
  const [pending, setPending] = useState(false);
  // A ref, not the state: two clicks in the same tick both read the old state,
  // and only the ref is updated synchronously enough to stop the second.
  const inFlight = useRef(false);

  const run = useCallback(
    async (...args: A) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setPending(true);
      try {
        await fn(...args);
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    },
    [fn],
  );

  return [pending, run];
}
