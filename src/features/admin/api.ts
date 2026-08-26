import { apiClient } from "../../api/client";
import { unwrap } from "../../api/errors";
import type {
  EventConfig,
  EventConfigInput,
  Exclusion,
  ExclusionInput,
  Invitation,
  LobbyState,
  Participant,
  ParticipantInput,
  StaffAccount,
} from "./types";

export async function fetchParticipants(search?: string): Promise<Participant[]> {
  return unwrap(
    apiClient.GET("/admin/participants", { params: { query: search ? { search } : {} } }),
  );
}

export async function createParticipant(input: ParticipantInput): Promise<Participant> {
  return unwrap(apiClient.POST("/admin/participants", { body: input }));
}

export async function updateParticipant(id: string, input: ParticipantInput): Promise<Participant> {
  return unwrap(
    apiClient.PATCH("/admin/participants/{id}", { params: { path: { id } }, body: input }),
  );
}

export async function disableParticipant(id: string): Promise<Participant> {
  return unwrap(
    apiClient.POST("/admin/participants/{id}/disable", { params: { path: { id } } }),
  );
}

export async function fetchParticipantInvitation(id: string): Promise<Invitation> {
  return unwrap(
    apiClient.GET("/admin/participants/{id}/invitation", { params: { path: { id } } }),
  );
}

export async function generateParticipantInvitation(id: string): Promise<Invitation> {
  return unwrap(
    apiClient.POST("/admin/participants/{id}/invitation/generate", { params: { path: { id } } }),
  );
}

export async function regenerateParticipantInvitation(id: string): Promise<Invitation> {
  return unwrap(
    apiClient.POST("/admin/participants/{id}/invitation/regenerate", { params: { path: { id } } }),
  );
}

export async function fetchParticipantQrBlob(id: string): Promise<Blob | null> {
  const { data, response } = await apiClient.GET("/admin/participants/{id}/invitation/qr", {
    params: { path: { id } },
    parseAs: "blob",
  });
  if (!response.ok || !data) return null;
  return data as unknown as Blob;
}

export async function fetchExclusions(): Promise<Exclusion[]> {
  return unwrap(apiClient.GET("/admin/exclusions"));
}

export async function createExclusion(input: ExclusionInput): Promise<Exclusion> {
  return unwrap(apiClient.POST("/admin/exclusions", { body: input }));
}

export async function deleteExclusion(id: string): Promise<void> {
  await unwrap(apiClient.DELETE("/admin/exclusions/{id}", { params: { path: { id } } }));
}

export async function fetchStaffAccounts(): Promise<StaffAccount[]> {
  return unwrap(apiClient.GET("/admin/staff"));
}

export async function fetchAdminLobby(): Promise<LobbyState> {
  return unwrap(apiClient.GET("/admin/lobby"));
}

export async function fetchEventConfig(): Promise<EventConfig> {
  return unwrap(apiClient.GET("/admin/event"));
}

export async function updateEventConfig(input: EventConfigInput): Promise<EventConfig> {
  return unwrap(apiClient.PUT("/admin/event", { body: input }));
}
