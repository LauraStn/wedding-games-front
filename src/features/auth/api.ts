import { apiClient } from "../../api/client";
import { unwrap } from "../../api/errors";
import type { InvitationPreview, Session } from "./types";

/**
 * Renvoie la session active. Rejette avec une ApiError de kind "unauthorized"
 * si aucune session n'est ouverte (état attendu, interprété par useSession) —
 * avec un code "SESSION_EXPIRED" si le backend distingue une session expirée
 * d'une simple absence de session.
 */
export async function fetchSession(): Promise<Session> {
  return unwrap(apiClient.GET("/session"));
}

export async function resolveInvitation(token: string): Promise<InvitationPreview> {
  return unwrap(
    apiClient.POST("/invitations/resolve", { body: { token } }),
  );
}

export async function confirmInvitation(
  identifier: { token: string } | { code: string },
): Promise<Session> {
  return unwrap(
    apiClient.POST("/invitations/confirm", { body: identifier }),
  );
}

export async function resolveFallbackCode(code: string): Promise<InvitationPreview> {
  return unwrap(
    apiClient.POST("/invitations/fallback", { body: { code } }),
  );
}

export async function closeSession(): Promise<void> {
  await unwrap(apiClient.DELETE("/session"));
}
