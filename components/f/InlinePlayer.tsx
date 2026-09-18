"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";

/**
 * A YouTube player that is already loaded when he arrives.
 *
 * The frame is created on mount, paused, so the tap that plays it does not
 * also have to fetch a player — it starts inside the same second, with
 * sound, because the tap is the gesture. That was the ask: loading when he
 * lands, playing when he presses.
 *
 * ── WHAT IT COSTS, SAID PLAINLY ──────────────────────────────────────────
 * The player is roughly a megabyte and it is fetched from Google for every
 * visitor, whether or not he ever presses play. On a Douala connection that
 * is real. It is the price of instant playback and it was chosen knowingly;
 * the rail cards further down still load nothing until pressed.
 *
 * ── HOW THE PRESS IS COUNTED ─────────────────────────────────────────────
 * Our own button sits over YouTube's poster, so the first press is ours to
 * count and to turn into a `playVideo` command. If he presses YouTube's own
 * control instead — the overlay is gone after the first play — the player
 * reports the state change back and that is counted too. Either way it is
 * one `video_play` per person per video, on his timeline with everything
 * else, which is more than YouTube's view count can be joined to.
 *
 * nocookie.com throughout; enablejsapi is what lets us talk to it.
 */
export function InlinePlayer({
  youtube,
  aspect = "16:9",
  id,
  locale,
  playLabel,
  where,
}: {
  youtube: string;
  aspect?: "16:9" | "9:16";
  /** testimonial id, for the event */
  id: string;
  locale: string;
  playLabel: string;
  /** which slot on the page, for the event's cta */
  where: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [started, setStarted] = useState(false);
  const counted = useRef(false);

  const count = () => {
    if (counted.current) return;
    counted.current = true;
    track("video_play", id, locale, { cta: where });
  };

  const send = (func: string) => {
    try {
      frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
    } catch {}
  };

  // Ask the player to report state changes, and count a play that started
  // from its own controls.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (typeof e.data !== "string" || e.source !== frame.current?.contentWindow) return;
      try {
        const d = JSON.parse(e.data);
        if (d.event === "onStateChange" && d.info === 1) {
          setStarted(true);
          count();
        }
      } catch {}
    };
    window.addEventListener("message", onMsg);
    const el = frame.current;
    const hello = () => {
      try {
        el?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: youtube }), "*");
      } catch {}
    };
    el?.addEventListener("load", hello);
    return () => {
      window.removeEventListener("message", onMsg);
      el?.removeEventListener("load", hello);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtube]);

  const src =
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube)}?` +
    new URLSearchParams({
      enablejsapi: "1",
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      controls: "1",
      cc_load_policy: "1",
      cc_lang_pref: locale === "fr" ? "fr" : "en",
      hl: locale === "fr" ? "fr" : "en",
      origin: typeof location !== "undefined" ? location.origin : "",
    }).toString();

  return (
    <div className={`c-inline ${aspect === "9:16" ? "c-inline-tall" : ""}`}>
      <iframe
        ref={frame}
        src={src}
        title={id}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {!started && (
        <button
          type="button"
          className="c-inline-play"
          aria-label={playLabel}
          onClick={() => {
            setStarted(true);
            count();
            send("playVideo");
          }}
        >
          <span aria-hidden className="c-rail-play-mark">▶</span>
          <small>{playLabel}</small>
        </button>
      )}
    </div>
  );
}
