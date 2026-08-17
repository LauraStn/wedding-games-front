"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExclusion,
  createParticipant,
  deleteExclusion,
  disableParticipant,
  fetchAdminLobby,
  fetchExclusions,
  fetchParticipantInvitation,
  fetchParticipants,
  fetchRoles,
  generateParticipantInvitation,
  regenerateParticipantInvitation,
  updateParticipant,
} from "./api";
import type { ParticipantInput } from "./types";

export function useParticipants(search: string) {
  return useQuery({
    queryKey: ["admin-participants", search],
    queryFn: () => fetchParticipants(search || undefined),
  });
}

export function useCreateParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createParticipant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-participants"] }),
  });
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ParticipantInput }) => updateParticipant(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-participants"] }),
  });
}

export function useDisableParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disableParticipant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-participants"] }),
  });
}

export function useParticipantInvitation(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["admin-participant-invitation", id],
    queryFn: () => fetchParticipantInvitation(id),
    enabled,
  });
}

export function useGenerateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateParticipantInvitation,
    onSuccess: (_data, id) =>
      queryClient.invalidateQueries({ queryKey: ["admin-participant-invitation", id] }),
  });
}

export function useRegenerateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: regenerateParticipantInvitation,
    onSuccess: (_data, id) =>
      queryClient.invalidateQueries({ queryKey: ["admin-participant-invitation", id] }),
  });
}

export function useExclusions() {
  return useQuery({ queryKey: ["admin-exclusions"], queryFn: fetchExclusions });
}

export function useCreateExclusion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExclusion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-exclusions"] }),
  });
}

export function useDeleteExclusion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExclusion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-exclusions"] }),
  });
}

export function useRoles() {
  return useQuery({ queryKey: ["admin-roles"], queryFn: fetchRoles });
}

export function useAdminLobby() {
  return useQuery({ queryKey: ["admin-lobby"], queryFn: fetchAdminLobby, refetchInterval: 15_000 });
}
