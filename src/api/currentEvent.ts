import { apiClient } from "./client";
import { unwrap } from "./errors";
import type { components } from "./schema";

export type PublicEventConfig = components["schemas"]["EventPublicConfigResponse"];

function requireEventSlug(): string {
  const slug = process.env.NEXT_PUBLIC_EVENT_SLUG;
  if (!slug) {
    throw new Error(
      "NEXT_PUBLIC_EVENT_SLUG est manquante. Copiez .env.example vers .env.local et renseignez le slug de l'événement.",
    );
  }
  return slug;
}

let cachedConfig: Promise<PublicEventConfig> | undefined;

/**
 * L'application est mono-événement : ce slug (fixé par déploiement) est le seul point d'entrée
 * public pour résoudre l'id de l'événement courant, y compris pour les rôles staff non-ADMIN
 * (l'endpoint /admin/event est réservé à ADMIN).
 */
export function fetchCurrentEventConfig(): Promise<PublicEventConfig> {
  if (!cachedConfig) {
    const slug = requireEventSlug();
    cachedConfig = unwrap(apiClient.GET("/events/{slug}/public", { params: { path: { slug } } })).catch(
      (error: unknown) => {
        cachedConfig = undefined;
        throw error;
      },
    );
  }
  return cachedConfig;
}

export async function getCurrentEventId(): Promise<string> {
  const config = await fetchCurrentEventConfig();
  if (!config.id) {
    throw new Error("La configuration publique de l'événement ne contient pas d'id.");
  }
  return config.id;
}
