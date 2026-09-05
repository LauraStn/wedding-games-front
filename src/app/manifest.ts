import type { MetadataRoute } from "next";
import { fetchTheme } from "../features/theme/api";

// La configuration publique de l'événement (voir openapi/wedding-games.yaml) est
// un endpoint public : il peut être appelé côté serveur sans transmettre de cookie de session.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const theme = await fetchTheme().catch(() => null);

  return {
    name: theme?.eventTitle ?? "Weddup",
    short_name: (theme?.eventTitle ?? "Weddup").slice(0, 30),
    description: "Weddup — l'application de jeux pour animer votre mariage",
    start_url: "/",
    display: "standalone",
    background_color: "#fafbff",
    theme_color: theme?.colors.primary ?? "#2457ff",
    lang: "fr",
    icons: [
      {
        src: "/favicon_weddup/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon_weddup/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon_weddup/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
