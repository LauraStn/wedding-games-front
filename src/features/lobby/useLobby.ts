"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLobby } from "./api";

export function useLobby() {
  const query = useQuery({
    queryKey: ["lobby"],
    queryFn: fetchLobby,
    refetchInterval: 10_000,
  });

  return {
    lobby: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
