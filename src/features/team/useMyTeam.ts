"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMyTeam } from "./api";

export function useMyTeam() {
  return useQuery({
    queryKey: ["my-team"],
    queryFn: fetchMyTeam,
    retry: false,
  });
}
