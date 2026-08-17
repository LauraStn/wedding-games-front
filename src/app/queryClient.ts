import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/errors";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof ApiError) {
    // Ne pas retenter les erreurs qui ne se résoudront pas seules.
    return error.kind === "offline" || error.kind === "server";
  }
  return true;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
