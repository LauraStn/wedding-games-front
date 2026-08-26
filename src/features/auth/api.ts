import { apiClient } from "../../api/client";
import { unwrap } from "../../api/errors";
import type {
  InvitationPreview,
  InvitationResolvePreview,
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

export async function confirmInvitation(
  identifier: { token: string } | { code: string },
): Promise<Session> {
  if ("token" in identifier) {
    return unwrap(
      apiClient.POST("/invitations/{token}/confirm", {
        params: { path: { token: identifier.token } },
      }),
    );
  }
  // Flow "code de secours" — non supporté par le backend actuel, voir
  // resolveFallbackCode ci-dessous.
  return unwrap(
    apiClient.POST("/invitations/confirm", { body: identifier }),
  );
}

/**
 * (Provisoire, non supporté par le backend) Voir le plan "Réaligner l'auth
 * sur le vrai backend" : aucune route de code de secours n'existe côté
 * serveur — cet appel échouera toujours en pratique.
 */
export async function resolveFallbackCode(code: string): Promise<InvitationPreview> {
  return unwrap(
    apiClient.POST("/invitations/fallback", { body: { code } }),
  );
}

export async function closeSession(): Promise<void> {
  await unwrap(apiClient.POST("/session/logout"));
}

export async function staffLogin(input: StaffLoginInput): Promise<StaffAccount> {
  return unwrap(apiClient.POST("/auth/staff/login", { body: input }));
}
