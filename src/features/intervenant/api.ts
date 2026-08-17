import { apiClient } from "../../api/client";
import { unwrap } from "../../api/errors";
import type { components } from "../../api/schema";

export type LobbyState = components["schemas"]["LobbyState"];
export type Arrival = components["schemas"]["Arrival"];
export interface LateArrival {
  firstName: string;
  lastName: string;
}

export async function fetchIntervenantLobby(): Promise<LobbyState> {
  return unwrap(apiClient.GET("/intervenant/lobby"));
}

export async function openLobby(): Promise<LobbyState> {
  return unwrap(apiClient.POST("/intervenant/lobby/open"));
}

export async function closeLobby(): Promise<LobbyState> {
  return unwrap(apiClient.POST("/intervenant/lobby/close"));
}

export async function lockLobby(): Promise<LobbyState> {
  return unwrap(apiClient.POST("/intervenant/lobby/lock"));
}

export async function fetchRecentArrivals(): Promise<Arrival[]> {
  return unwrap(apiClient.GET("/intervenant/arrivals/recent"));
}

export async function fetchLateArrivals(): Promise<LateArrival[]> {
  return unwrap(apiClient.GET("/intervenant/arrivals/late"));
}
