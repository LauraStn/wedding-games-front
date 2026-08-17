import { apiClient } from "../../api/client";
import { unwrap } from "../../api/errors";
import type { components } from "../../api/schema";

export type ScreenState = components["schemas"]["ScreenState"];

export async function fetchScreenState(): Promise<ScreenState> {
  return unwrap(apiClient.GET("/screen/state"));
}
