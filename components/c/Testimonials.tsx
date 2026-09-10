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
  video?: { youtube: string };
};

const ROTATE_MS = 4500;

/**
 * A filmed testimonial, and nothing loads until he asks for it.
 *
 * ── WHY IT IS NOT AN IFRAME UNTIL HE PRESSES PLAY ─────────────────────────
 * A YouTube embed talks to Google the moment the page renders — cookies, and
 * a request that ties this page to whoever is signed in on that phone. On a
 * page about lasting longer in bed, that is not a privacy footnote, it is the
 * product promise broken before he has even watched anything. So the card
 * shows a still frame and a play triangle; the iframe is created on the tap
 * and not before. Men who never tap cost Google nothing and cost him no data,
 * which on a Douala connection is the difference between a page that loads
 * and one that does not.
 *
 * nocookie.com for the same reason, once he has chosen. `autoplay=1` is
 * honest here — the tap IS the gesture, so it plays with sound the way he
 * expects, rather than muted like an advert he did not ask for.
 */
function VideoModal({
  card,
  locale,
  onClose,
  closeLabel,
}: {
  card: Card;
  locale: string;
  onClose: () => void;
  closeLabel: string;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    // The page behind must not scroll under the video.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const p = new URLSearchParams({
    autoplay: "1",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    // Force the caption track on and pick his language. Harmless if the
    // subtitles are burned into the picture; essential if they are a track,
    // because an American speaking English to a francophone with the captions
    // switched off is ten seconds of nothing.
    cc_load_policy: "1",
    cc_lang_pref: locale === "fr" ? "fr" : "en",
    hl: locale === "fr" ? "fr" : "en",
  });

  return (
    <div className="c-vid-back" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="c-vid-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="c-vid-close" onClick={onClose} aria-label={closeLabel}>
          ✕
        </button>
        <div className="c-vid-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(card.video!.youtube)}?${p}`}
            title={card.name}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="c-vid-quote">“{card.quote}”</p>
      </div>
    </div>
  );
}

export function Testimonials({
  items,
  heading,
  planLabels,
  prevLabel,
  nextLabel,
  locale,
  playLabel,
  closeLabel,
}: {
  items: Card[];
  locale: string;
  /** on the play button, and read out by a screen reader */
  playLabel: string;
  closeLabel: string;
  /** Optional lead-in above the rail. */
  heading?: string;
  /** What "10" and "30" are called in this language. */
  planLabels: { "10": string; "30": string };
  prevLabel: string;
  nextLabel: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<Card | null>(null);
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
      if (held.current || playing) return;
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
  }, [items.length, scrollToCard, playing]);

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
            {t.video ? (
              /* A still frame from YouTube's own thumbnail host — one image,
                 no cookies, and lazy, so it costs nothing above the fold. */
              <button
                type="button"
                className="c-rail-play"
                onClick={() => {
                  hold();
                  setPlaying(t);
                }}
                aria-label={playLabel}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${t.video.youtube}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                />
                <span aria-hidden className="c-rail-play-mark">▶</span>
                <small>{playLabel}</small>
              </button>
            ) : (
              <p aria-label="5 / 5" className="c-rail-stars">
                ★★★★★
              </p>
            )}
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

      {playing && (
        <VideoModal
          card={playing}
          locale={locale}
          closeLabel={closeLabel}
          onClose={() => setPlaying(null)}
        />
      )}
    </section>
  );
}
