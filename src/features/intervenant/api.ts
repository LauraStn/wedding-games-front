import { apiClient } from "../../api/client";
import { getCurrentEventId } from "../../api/currentEvent";
import { unwrap } from "../../api/errors";
import type { components } from "../../api/schema";

export type LobbyState = components["schemas"]["LobbyResponse"];
export type LobbyParticipant = components["schemas"]["LobbyParticipantResponse"];

export async function openLobby(): Promise<LobbyState> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.POST("/staff/events/{eventId}/lobby/open", { params: { path: { eventId } } }));
}

export async function closeLobby(): Promise<LobbyState> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.POST("/staff/events/{eventId}/lobby/close", { params: { path: { eventId } } }));
}

export async function lockLobby(): Promise<LobbyState> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.POST("/staff/events/{eventId}/lobby/lock", { params: { path: { eventId } } }));
}

/** Vue unifiée des participants du salon (statut de connexion, horodatages, doublons potentiels). */
export async function fetchLobbyParticipants(): Promise<LobbyParticipant[]> {
  const eventId = await getCurrentEventId();
  return unwrap(
    apiClient.GET("/staff/events/{eventId}/lobby/participants", { params: { path: { eventId } } }),
  );
}

export async function admitParticipant(participantId: string): Promise<LobbyParticipant> {
  const eventId = await getCurrentEventId();
  return unwrap(
    apiClient.POST("/staff/events/{eventId}/lobby/participants/{participantId}/admit", {
      params: { path: { eventId, participantId } },
    }),
  );
}
