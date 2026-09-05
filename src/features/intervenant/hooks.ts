"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptAnswer,
  activateQuestion,
  admitParticipant,
  closeLobby,
  closeQuestion,
  correctAnswer,
  fetchAnswers,
  fetchFinalists,
  fetchGames,
  fetchLobbyParticipants,
  fetchQuestions,
  fetchTeams,
  hideAnswer,
  launchMatchmaking,
  lockLobby,
  nextQuestion,
  openLobby,
  pauseGame,
  relaunchTeam,
  resumeGame,
  startGame,
} from "./api";

export function useLobbyParticipants() {
  return useQuery({ queryKey: ["intervenant-lobby-participants"], queryFn: fetchLobbyParticipants, refetchInterval: 15_000 });
}

export function useAdmitParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: admitParticipant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["intervenant-lobby-participants"] }),
  });
}

export function useOpenLobby() {
  return useMutation({ mutationFn: openLobby });
}
export function useCloseLobby() {
  return useMutation({ mutationFn: closeLobby });
}
export function useLockLobby() {
  return useMutation({ mutationFn: lockLobby });
}

export function useTeams() {
  return useQuery({ queryKey: ["intervenant-teams"], queryFn: fetchTeams });
}

export function useLaunchMatchmaking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: launchMatchmaking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["intervenant-teams"] }),
  });
}

export function useGames() {
  return useQuery({ queryKey: ["intervenant-games"], queryFn: fetchGames, refetchInterval: 10_000 });
}

export function useStartGame() {
  return useMutation({ mutationFn: startGame });
}
export function usePauseGame() {
  return useMutation({ mutationFn: pauseGame });
}
export function useResumeGame() {
  return useMutation({ mutationFn: resumeGame });
}
export function useNextQuestion() {
  return useMutation({ mutationFn: nextQuestion });
}

export function useQuestions(gameId: string | undefined) {
  return useQuery({
    queryKey: ["intervenant-questions", gameId],
    queryFn: () => fetchQuestions(gameId as string),
    enabled: Boolean(gameId),
    refetchInterval: 10_000,
  });
}

export function useActivateQuestion() {
  return useMutation({ mutationFn: activateQuestion });
}
export function useCloseQuestion() {
  return useMutation({ mutationFn: closeQuestion });
}

export function useAnswers(questionId: string | undefined) {
  return useQuery({
    queryKey: ["intervenant-answers", questionId],
    queryFn: () => fetchAnswers(questionId as string),
    enabled: Boolean(questionId),
    refetchInterval: 5_000,
  });
}

export function useAcceptAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptAnswer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["intervenant-answers"] }),
  });
}
export function useHideAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hideAnswer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["intervenant-answers"] }),
  });
}
export function useCorrectAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ answerId, content }: { answerId: string; content: string }) => correctAnswer(answerId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["intervenant-answers"] }),
  });
}
export function useRelaunchTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, teamId }: { questionId: string; teamId: string }) => relaunchTeam(questionId, teamId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["intervenant-answers"] }),
  });
}

export function useFinalists(questionId: string | undefined, revealVoteCount: boolean) {
  return useQuery({
    queryKey: ["intervenant-finalists", questionId, revealVoteCount],
    queryFn: () => fetchFinalists(questionId as string, revealVoteCount),
    enabled: Boolean(questionId),
  });
}
