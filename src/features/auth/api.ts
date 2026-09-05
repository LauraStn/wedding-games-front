import { apiClient } from "../../api/client";
import { unwrap } from "../../api/errors";
import type {
  InvitationResolvePreview,
  ParticipantSession,
  Session,
  StaffAccount,
  StaffLoginInput,
} from "./types";

/**
 * Renvoie la session active. Rejette avec une ApiError de kind "unauthorized"
 * si aucune session n'est ouverte (état attendu, interprété par useSession) —
 * avec un code "SESSION_EXPIRED" si le backend distingue une session expirée
 * d'une simple absence de session.
 */
export async function fetchSession(): Promise<Session> {
  return unwrap(apiClient.GET("/session/me"));
}

export async function resolveInvitation(token: string): Promise<InvitationResolvePreview> {
  return unwrap(
    apiClient.GET("/invitations/{token}/resolve", { params: { path: { token } } }),
  );
}

export async function confirmInvitationToken(token: string): Promise<ParticipantSession> {
  return unwrap(
    apiClient.POST("/invitations/{token}/confirm", { params: { path: { token } } }),
  );
}

export async function resolveFallbackCode(code: string): Promise<InvitationResolvePreview> {
  return unwrap(
    apiClient.GET("/invitations/fallback/{code}/resolve", { params: { path: { code } } }),
  );
}

export async function confirmFallbackCode(code: string): Promise<ParticipantSession> {
  return unwrap(
    apiClient.POST("/invitations/fallback/{code}/confirm", { params: { path: { code } } }),
  );
}

export async function closeSession(): Promise<void> {
  await unwrap(apiClient.POST("/session/logout"));
}

export async function staffLogin(input: StaffLoginInput): Promise<StaffAccount> {
  return unwrap(apiClient.POST("/auth/staff/login", { body: input }));
}
