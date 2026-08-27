import { ImageResponse } from "next/og";

/**
 * Apple touch icon.
 *
 * iOS will not take an SVG here, so this renders a real 180×180 PNG at build
 * time from the same geometry as the favicon. No design tool round-trip, and
 * it can never drift out of sync with the mark.
 *
 * No rounded corners: iOS applies its own mask, and baking ours in as well
 * produces a visibly double-rounded icon.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E1417",
        }}
      >
        <svg viewBox="0 0 24 24" width="118" height="118" fill="none">
          <path
            d="M3.5 18H10V12H16V6H20.5"
            stroke="#17B890"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
