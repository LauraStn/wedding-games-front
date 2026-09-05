import { apiClient } from "../../api/client";
import { getCurrentEventId } from "../../api/currentEvent";
import { unwrap } from "../../api/errors";
import type {
  EventConfig,
  EventConfigInput,
  Exclusion,
  ExclusionInput,
  InvitationAdmin,
  InvitationStatus,
  LobbyState,
  Participant,
  ParticipantCreateInput,
  ParticipantUpdateInput,
  StaffAccount,
} from "./types";

export async function fetchParticipants(search?: string): Promise<Participant[]> {
  const eventId = await getCurrentEventId();
  return unwrap(
    apiClient.GET("/admin/events/{eventId}/participants", {
      params: { path: { eventId }, query: search ? { query: search } : {} },
    }),
  );
}

export async function createParticipant(input: ParticipantCreateInput): Promise<Participant> {
  const eventId = await getCurrentEventId();
  return unwrap(
    apiClient.POST("/admin/events/{eventId}/participants", { params: { path: { eventId } }, body: input }),
  );
}

export async function updateParticipant(id: string, input: ParticipantUpdateInput): Promise<Participant> {
  return unwrap(apiClient.PUT("/admin/participants/{id}", { params: { path: { id } }, body: input }));
}

export async function disableParticipant(id: string): Promise<Participant> {
  return unwrap(apiClient.POST("/admin/participants/{id}/disable", { params: { path: { id } } }));
}

export async function fetchParticipantInvitation(id: string): Promise<InvitationStatus> {
  return unwrap(
    apiClient.GET("/admin/participants/{participantId}/invitation", { params: { path: { participantId: id } } }),
  );
}

/** Génère (ou régénère) l'invitation : seule occasion où le jeton brut / lien / QR sont exposés. */
export async function generateParticipantInvitation(id: string): Promise<InvitationAdmin> {
  return unwrap(
    apiClient.POST("/admin/participants/{participantId}/invitation", { params: { path: { participantId: id } } }),
  );
}

export async function revokeParticipantInvitation(id: string): Promise<void> {
  await unwrap(
    apiClient.POST("/admin/participants/{participantId}/invitation/revoke", {
      params: { path: { participantId: id } },
    }),
  );
}

export async function renewParticipantFallbackCode(id: string): Promise<{ fallbackCode?: string }> {
  return unwrap(
    apiClient.POST("/admin/participants/{participantId}/invitation/fallback-code/renew", {
      params: { path: { participantId: id } },
    }),
  );
}

export async function fetchExclusions(): Promise<Exclusion[]> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.GET("/admin/events/{eventId}/exclusions", { params: { path: { eventId } } }));
}

export async function createExclusion(input: ExclusionInput): Promise<Exclusion> {
  const eventId = await getCurrentEventId();
  return unwrap(
    apiClient.POST("/admin/events/{eventId}/exclusions", { params: { path: { eventId } }, body: input }),
  );
}

export async function deleteExclusion(id: string): Promise<void> {
  await unwrap(apiClient.DELETE("/admin/exclusions/{id}", { params: { path: { id } } }));
}

export async function fetchStaffAccounts(): Promise<StaffAccount[]> {
  return unwrap(apiClient.GET("/admin/staff"));
}

export async function fetchAdminLobby(): Promise<LobbyState> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.GET("/admin/events/{eventId}/lobby", { params: { path: { eventId } } }));
}

export async function fetchEventConfig(): Promise<EventConfig> {
  return unwrap(apiClient.GET("/admin/event"));
}

export async function updateEventConfig(input: EventConfigInput): Promise<EventConfig> {
  return unwrap(apiClient.PUT("/admin/event", { body: input }));
}
