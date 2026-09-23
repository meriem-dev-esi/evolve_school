import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Evolve Academy — Formations & Ateliers",
    short_name: "Evolve",
    description: "Plateforme de formations créatives et techniques en Algérie.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#E2F163",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
