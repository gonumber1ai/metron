"use client";

import { useState } from "react";
import { flagOf } from "@/lib/content/testimonials";
import type { Card } from "@/components/c/Testimonials";

/**
 * The drawer at the foot of the page.
 *
 * Thirty-odd more of them, folded away. A rail is right where a testimonial
 * is proving the section above it; down here there is nothing left to prove
 * and a man is either already convinced or reading everything, so this is a
 * plain grid he can go through at his own pace.
 *
 * Closed by default, and closed is the honest default — the page has already
 * made its case nineteen times by this point, and a wall of another thirty
 * reads as insecurity rather than evidence.
 *
 * Not <details>: the summary needs the count and the caret to animate, and
 * Safari's default disclosure triangle cannot be removed reliably enough to
 * be worth the accessibility it would have bought us for free.
 */
export function MoreTestimonials({
  items,
  label,
  planLabels,
}: {
  items: Card[];
  /** "MORE METRON EXPERIENCES" — the count is appended. */
  label: string;
  planLabels: { "10": string; "30": string };
}) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <section className="c-more">
      <button
        type="button"
        className="c-more-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label} ({items.length})
        <span aria-hidden className={open ? "up" : undefined}>
          ↓
        </span>
      </button>

      {open && (
        <div className="c-more-grid">
          {items.map((t) => (
            <article key={t.id} className="c-rail-card">
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
      )}
    </section>
  );
}
