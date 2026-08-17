import { apiClient } from "../../api/client";
import { unwrap } from "../../api/errors";
import type { components } from "../../api/schema";

export type LobbyState = components["schemas"]["LobbyState"];

export async function fetchLobby(): Promise<LobbyState> {
  return unwrap(apiClient.GET("/lobby"));
}
