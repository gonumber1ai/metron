import { ImageResponse } from "next/og";

/**
 * The card people see when the link is shared.
 *
 * There were no Open Graph tags at all, so a link pasted into WhatsApp
 * rendered as a bare line of text with no image — which reads as broken, and
 * on WhatsApp Status the preview card IS the creative. This is the first thing
 * a man sees of the product.
 *
 * It says nothing. The mark, the name, four words. A phone on a table showing
 * this preview tells whoever glances at it exactly as much as the home-screen
 * icon does, which is nothing — and that restraint is the product's main
 * promise, not a missed marketing opportunity.
 *
 * Generated at build time from the same geometry as the favicon, so the mark
 * can never drift out of sync with the app.
 *
 * Lives beside the locale layout, not at app/. There is no root layout above
 * [locale], so a file at app/ is never inherited by these routes — it built
 * and served fine on its own URL while emitting no og:image tag on any page,
 * which is the kind of broken that looks like it works.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Metron";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#070D0F",
          // The ambient pool of light from the app, so the card and the page
          // he lands on look like the same product.
          backgroundImage:
            "radial-gradient(1000px 520px at 50% -80px, rgba(22,190,146,0.18), transparent 70%)",
        }}
      >
        <svg viewBox="0 0 24 24" width="150" height="150" fill="none">
          <path
            d="M3.5 18H10V12H16V6H20.5"
            stroke="#16BE92"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#EEF4F2",
            marginTop: 28,
          }}
        >
          Metron
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 38,
            color: "#A2B3B6",
            marginTop: 14,
            letterSpacing: "-0.01em",
          }}
        >
          Measure it. Change it.
        </div>
      </div>
    ),
    size,
  );
}
