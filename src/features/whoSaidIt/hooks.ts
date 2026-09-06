"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptQuestion,
  correctQuestion,
  fetchMyQuestions,
  fetchQuestionsForModeration,
  proposeQuestion,
  rejectQuestion,
  selectRandomQuestion,
  updateMyQuestion,
} from "./api";

export function useMyQuestions() {
  return useQuery({ queryKey: ["whosaidit-my-questions"], queryFn: fetchMyQuestions });
}

export function useProposeQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, revealAuthorConsent }: { content: string; revealAuthorConsent: boolean }) =>
      proposeQuestion(content, revealAuthorConsent),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whosaidit-my-questions"] }),
  });
}

export function useUpdateMyQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content, revealAuthorConsent }: { id: string; content: string; revealAuthorConsent: boolean }) =>
      updateMyQuestion(id, content, revealAuthorConsent),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whosaidit-my-questions"] }),
  });
}

export function useModerationQuestions() {
  return useQuery({
    queryKey: ["whosaidit-moderation"],
    queryFn: fetchQuestionsForModeration,
    refetchInterval: 10_000,
  });
}

export function useAcceptQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whosaidit-moderation"] }),
  });
}

export function useRejectQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whosaidit-moderation"] }),
  });
}

export function useCorrectQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => correctQuestion(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whosaidit-moderation"] }),
  });
}

export function useSelectRandomQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: selectRandomQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["whosaidit-moderation"] }),
  });
}
