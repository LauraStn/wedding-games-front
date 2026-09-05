"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExclusion,
  createParticipant,
  deleteExclusion,
  disableParticipant,
  fetchAdminLobby,
  fetchEventConfig,
  fetchExclusions,
  fetchParticipantInvitation,
  fetchParticipants,
  fetchStaffAccounts,
  generateParticipantInvitation,
  renewParticipantFallbackCode,
  revokeParticipantInvitation,
  updateEventConfig,
  updateParticipant,
} from "./api";
import type { EventConfigInput, ParticipantUpdateInput } from "./types";

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
    mutationFn: ({ id, input }: { id: string; input: ParticipantUpdateInput }) => updateParticipant(id, input),
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

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeParticipantInvitation,
    onSuccess: (_data, id) =>
      queryClient.invalidateQueries({ queryKey: ["admin-participant-invitation", id] }),
  });
}

export function useRenewFallbackCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: renewParticipantFallbackCode,
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

export function useStaffAccounts() {
  return useQuery({ queryKey: ["admin-staff"], queryFn: fetchStaffAccounts });
}

export function useAdminLobby() {
  return useQuery({ queryKey: ["admin-lobby"], queryFn: fetchAdminLobby, refetchInterval: 15_000 });
}

export function useEventConfig() {
  return useQuery({ queryKey: ["admin-event-config"], queryFn: fetchEventConfig });
}

export function useUpdateEventConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EventConfigInput) => updateEventConfig(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-event-config"] }),
  });
}
