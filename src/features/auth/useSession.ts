"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/errors";
import { fetchSession } from "./api";

export const sessionQueryKey = ["session"] as const;

export function useSession() {
  const query = useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchSession,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const apiError = query.error instanceof ApiError ? query.error : null;
  const isAnonymous = apiError?.kind === "unauthorized" && apiError.code !== "SESSION_EXPIRED";
  const isExpired = apiError?.code === "SESSION_EXPIRED";
  const isUnexpectedError = query.isError && !isAnonymous && !isExpired;

  return {
    session: query.data ?? null,
    isLoading: query.isLoading,
    isAnonymous,
    isExpired,
    isUnexpectedError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useInvalidateSession() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: sessionQueryKey });
}
