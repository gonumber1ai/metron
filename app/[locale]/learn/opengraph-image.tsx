import { ImageResponse } from "next/og";

/**
 * The share card for the bootcamp link.
 *
 * Without this file the page inherited the locale-level card — the Metron
 * mark and "Gain Control, Last Longer" — so a link to a coding bootcamp
 * pasted into a chat previewed as a men's sexual-health product. This sits
 * one segment deeper and wins, and it says only what the page says.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Learn to build websites, mobile apps & AI automations";

export default function OpengraphImage() {
  const line = (text: string, color: string, top = 0) => (
    <div
      style={{
        display: "flex",
        fontSize: 78,
        fontWeight: 900,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        color,
        marginTop: top,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#0a1a33",
          backgroundImage:
            "radial-gradient(900px 480px at 85% 0%, rgba(255,184,28,0.16), transparent 70%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "#ffb81c",
            textTransform: "uppercase",
            marginBottom: 26,
          }}
        >
          Learn to build
        </div>
        {line("Websites,", "#ffffff")}
        {line("Mobile apps &", "#ffffff", 8)}
        {line("AI automations", "#ffb81c", 8)}
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#ffb81c",
            textTransform: "uppercase",
            marginTop: 40,
          }}
        >
          Hands-on bootcamp · starts 27 September
        </div>
      </div>
    ),
    size,
  );
}
