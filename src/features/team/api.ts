import { apiClient } from "../../api/client";
import { unwrap } from "../../api/errors";
import type { components } from "../../api/schema";

export type MyTeam = components["schemas"]["MyTeamResponse"];

export async function fetchMyTeam(): Promise<MyTeam> {
  return unwrap(apiClient.GET("/team/me"));
}
