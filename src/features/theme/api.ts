import { apiClient } from "../../api/client";
import { unwrap } from "../../api/errors";
import type { components } from "../../api/schema";

export type EventTheme = components["schemas"]["EventTheme"];

export async function fetchTheme(): Promise<EventTheme> {
  return unwrap(apiClient.GET("/theme"));
}
