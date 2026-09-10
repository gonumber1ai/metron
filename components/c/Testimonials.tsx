"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flagOf } from "@/lib/content/testimonials";

/**
 * The testimonial rail.
 *
 * Three cards on a desktop, one on a phone with the next one peeking so the
 * edge of the screen says "there are more of these" without an instruction.
 * It advances itself every 4.5 seconds, and stops the moment a man touches
 * it — an auto-rotating thing that keeps moving while you are reading is a
 * thing you have to fight.
 *
 * ── WHY SCROLL-SNAP AND NOT A TRANSFORM ───────────────────────────────────
 * The track is a real overflow-x element with scroll snapping, so swiping is
 * the browser's own — momentum, rubber-banding, the lot — on the devices that
 * matter here, and the whole thing degrades to a plain scrollable row if the
 * script never runs. The arrows and dots drive scrollTo. Nothing is
 * positioned by hand, so nothing can be positioned wrongly.
 *
 * ── IT RENDERS NOTHING WHEN THERE IS NOTHING ──────────────────────────────
 * No items, no markup — not an empty frame, not a placeholder. The page is
 * complete and correct while this file's data source is still empty, which is
 * the state it ships in until real customers have finished the programme.
 */

export type Card = {
  id: string;
  country: string;
  name: string;
  plan: "10" | "30";
  quote: string;
};

const ROTATE_MS = 4500;

export function Testimonials({
  items,
  heading,
  planLabels,
  prevLabel,
  nextLabel,
}: {
  items: Card[];
  /** Optional lead-in above the rail. */
  heading?: string;
  /** What "10" and "30" are called in this language. */
  planLabels: { "10": string; "30": string };
  prevLabel: string;
  nextLabel: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Set the moment he touches it, and never cleared. Once a man has taken
  // hold of the rail it is his; resuming under his hands would be the exact
  // behaviour this is trying to avoid.
  const held = useRef(false);

  const scrollToCard = useCallback((n: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.children[n] as HTMLElement | undefined;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, []);

  /* Which card is under the left edge. Read from the scroll position rather
     than tracked alongside it, so a swipe, an arrow and the timer can never
     disagree about where the rail actually is. */
  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    let best = 0;
    let bestDist = Infinity;
    for (let n = 0; n < el.children.length; n++) {
      const c = el.children[n] as HTMLElement;
      const d = Math.abs(c.offsetLeft - el.offsetLeft - el.scrollLeft);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    }
    setActive(best);
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    // A man who has asked his browser to stop moving things has asked this
    // to stop moving too.
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (still?.matches) return;

    const id = window.setInterval(() => {
      if (held.current) return;
      const el = track.current;
      if (!el) return;
      // Only while it is on screen. A rail that has been paging itself in a
      // closed tab arrives at card nine when he finally scrolls to it.
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      setActive((n) => {
        const next = (n + 1) % items.length;
        scrollToCard(next);
        return next;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [items.length, scrollToCard]);

  if (items.length === 0) return null;

  const hold = () => {
    held.current = true;
  };

  return (
    <section className="c-rail" aria-roledescription="carousel">
      {heading && <p className="c-kicker c-rail-head">{heading}</p>}

      <div
        ref={track}
        className="c-rail-track"
        onScroll={onScroll}
        onPointerDown={hold}
        onTouchStart={hold}
        onWheel={hold}
        onKeyDown={hold}
        tabIndex={0}
      >
        {items.map((t, n) => (
          <article
            key={t.id}
            className="c-rail-card"
            aria-label={`${n + 1} / ${items.length}`}
          >
            <p aria-label="5 / 5" className="c-rail-stars">
              ★★★★★
            </p>
            <blockquote className="c-rail-quote">“{t.quote}”</blockquote>
            <footer className="c-rail-by">
              <strong>
                {flagOf(t.country) && (
                  <span aria-hidden className="c-rail-flag">
                    {flagOf(t.country)}
                  </span>
                )}
                {t.name}
              </strong>
              <small>{planLabels[t.plan]}</small>
            </footer>
          </article>
        ))}
      </div>

      {items.length > 1 && (
        <div className="c-rail-nav">
          <button
            type="button"
            aria-label={prevLabel}
            onClick={() => {
              hold();
              scrollToCard(Math.max(0, active - 1));
            }}
          >
            ‹
          </button>

          <span className="c-rail-dots">
            {items.map((t, n) => (
              <button
                key={t.id}
                type="button"
                aria-label={`${n + 1} / ${items.length}`}
                aria-current={n === active}
                className={n === active ? "on" : undefined}
                onClick={() => {
                  hold();
                  scrollToCard(n);
                }}
              />
            ))}
          </span>

          <button
            type="button"
            aria-label={nextLabel}
            onClick={() => {
              hold();
              scrollToCard(Math.min(items.length - 1, active + 1));
            }}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
