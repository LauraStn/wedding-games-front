import createClient from "openapi-fetch";
import type { paths } from "./schema";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL est manquante. Copiez .env.example vers .env.local et renseignez l'URL du backend.",
  );
}

export const apiClient = createClient<paths>({
  baseUrl: `${baseUrl}/api`,
  credentials: "include",
});
