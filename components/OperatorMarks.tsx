"use client";

import { useState } from "react";

/**
 * MTN MoMo and Orange Money marks.
 *
 * "Mobile Money" on its own reads as MTN to most Cameroonians, so an Orange
 * customer can assume we do not take his money and leave. Both marks are shown
 * before he types anything.
 *
 * ── HOW THE ARTWORK WORKS ────────────────────────────────────────────────
 * Save the supplied square image as:  public/pay/momo.png
 *
 * It is one 512×512 file with MTN Mobile Money on the top half and Orange
 * Money on the bottom half. Rather than asking for two files, each mark below
 * shows one half of it: the element is 2:1, the background is scaled to
 * 100%/200%, and background-position picks the top or the bottom. One file,
 * two side-by-side badges, no cropping in an image editor.
 *
 * If the file is missing the component silently falls back to plain
 * brand-coloured badges, so the checkout never renders a broken image.
 */

const SRC = "/pay/momo.png";

function Half({
  half,
  label,
  dim,
  onError,
}: {
  half: "top" | "bottom";
  label: string;
  dim: boolean;
  onError: () => void;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`block h-[26px] w-[52px] rounded-[5px] bg-no-repeat transition-opacity ${
        dim ? "opacity-35" : "opacity-100"
      }`}
      style={{
        backgroundImage: `url(${SRC})`,
        backgroundSize: "100% 200%",
        backgroundPosition: half === "top" ? "center top" : "center bottom",
      }}
    >
      {/* Probe: fires onError once if the artwork has not been added yet. */}
      <img src={SRC} alt="" aria-hidden className="hidden" onError={onError} />
    </span>
  );
}

/* ------------------------------------------------- fallback, no artwork yet */

const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

function MtnFallback({ dim }: { dim: boolean }) {
  return (
    <svg
      viewBox="0 0 92 34"
      role="img"
      aria-label="MTN Mobile Money"
      className={`h-[26px] w-auto transition-opacity ${dim ? "opacity-35" : "opacity-100"}`}
    >
      <rect x="0.5" y="0.5" width="91" height="33" rx="7" fill="#FFCC00" />
      <text x="10" y="23" fontFamily={FONT} fontSize="15" fontWeight="800" fill="#0E1417">
        MTN
      </text>
      <text
        x="47"
        y="23"
        fontFamily={FONT}
        fontSize="13"
        fontWeight="700"
        fill="#0E1417"
        opacity="0.75"
      >
        MoMo
      </text>
    </svg>
  );
}

function OrangeFallback({ dim }: { dim: boolean }) {
  return (
    <svg
      viewBox="0 0 108 34"
      role="img"
      aria-label="Orange Money"
      className={`h-[26px] w-auto transition-opacity ${dim ? "opacity-35" : "opacity-100"}`}
    >
      <rect x="0.5" y="0.5" width="107" height="33" rx="7" fill="#FF7900" />
      <text x="10" y="23" fontFamily={FONT} fontSize="15" fontWeight="800" fill="#FFFFFF">
        Orange
      </text>
      <text
        x="66"
        y="23"
        fontFamily={FONT}
        fontSize="13"
        fontWeight="700"
        fill="#FFFFFF"
        opacity="0.85"
      >
        Money
      </text>
    </svg>
  );
}

/**
 * Both marks in a row. Once he has typed enough digits to identify his network,
 * his one stays lit and the other fades — quiet confirmation that we recognised
 * the number, without a line of text telling him so.
 */
export function OperatorMarks({ detected }: { detected: "MTN" | "Orange" | null }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span className="flex items-center gap-2">
        <MtnFallback dim={detected === "Orange"} />
        <OrangeFallback dim={detected === "MTN"} />
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <Half
        half="top"
        label="MTN Mobile Money"
        dim={detected === "Orange"}
        onError={() => setBroken(true)}
      />
      <Half
        half="bottom"
        label="Orange Money"
        dim={detected === "MTN"}
        onError={() => setBroken(true)}
      />
    </span>
  );
}
