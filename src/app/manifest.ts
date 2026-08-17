import type { MetadataRoute } from "next";
import { fetchTheme } from "../features/theme/api";

// /theme est un endpoint public (voir openapi/wedding-games.yaml) : il peut
// être appelé côté serveur sans transmettre de cookie de session.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const theme = await fetchTheme().catch(() => null);

  return {
    name: theme?.eventTitle ?? "Jeux de mariage",
    short_name: (theme?.eventTitle ?? "Mariage").slice(0, 30),
    description: "Application privée d'animations de mariage",
    start_url: "/",
    display: "standalone",
    background_color: theme?.colors.background ?? "#faf8f5",
    theme_color: theme?.colors.primary ?? "#7c5cff",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
