import type { MetadataRoute } from "next";

/**
 * Installed as a PWA rather than shipped to an app store: no store review of
 * sexual-health content, no install friction, and the home-screen name and
 * icon stay neutral — which is the whole privacy promise.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Metron",
    short_name: "Metron",
    description: "Measure it. Change it.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E1417",
    theme_color: "#0E1417",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      // Android's installer prefers a raster maskable icon; this is generated
      // from the same geometry at build time.
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
