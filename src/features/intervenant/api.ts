import { apiClient } from "../../api/client";
import { getCurrentEventId } from "../../api/currentEvent";
import { unwrap } from "../../api/errors";
import type { components } from "../../api/schema";

export type LobbyState = components["schemas"]["LobbyResponse"];
export type LobbyParticipant = components["schemas"]["LobbyParticipantResponse"];

export async function openLobby(): Promise<LobbyState> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.POST("/staff/events/{eventId}/lobby/open", { params: { path: { eventId } } }));
}

export async function closeLobby(): Promise<LobbyState> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.POST("/staff/events/{eventId}/lobby/close", { params: { path: { eventId } } }));
}

export async function lockLobby(): Promise<LobbyState> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.POST("/staff/events/{eventId}/lobby/lock", { params: { path: { eventId } } }));
}

/** Vue unifiée des participants du salon (statut de connexion, horodatages, doublons potentiels). */
export async function fetchLobbyParticipants(): Promise<LobbyParticipant[]> {
  const eventId = await getCurrentEventId();
  return unwrap(
    apiClient.GET("/staff/events/{eventId}/lobby/participants", { params: { path: { eventId } } }),
  );
}

export async function admitParticipant(participantId: string): Promise<LobbyParticipant> {
  const eventId = await getCurrentEventId();
  return unwrap(
    apiClient.POST("/staff/events/{eventId}/lobby/participants/{participantId}/admit", {
      params: { path: { eventId, participantId } },
    }),
  );
}

export type Team = components["schemas"]["TeamResponse"];

export async function launchMatchmaking(): Promise<Team[]> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.POST("/staff/events/{eventId}/matchmaking/launch", { params: { path: { eventId } } }));
}

export async function fetchTeams(): Promise<Team[]> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.GET("/staff/events/{eventId}/matchmaking/teams", { params: { path: { eventId } } }));
}

export type Game = components["schemas"]["GameResponse"];
export type Question = components["schemas"]["QuestionResponse"];
export type AnswerModeration = components["schemas"]["AnswerModerationResponse"];
export type Finalist = components["schemas"]["FinalistResponse"];

export async function fetchGames(): Promise<Game[]> {
  const eventId = await getCurrentEventId();
  return unwrap(apiClient.GET("/staff/events/{eventId}/games", { params: { path: { eventId } } }));
}

export async function startGame(gameId: string): Promise<Game> {
  return unwrap(apiClient.POST("/staff/games/{gameId}/start", { params: { path: { gameId } } }));
}

export async function pauseGame(gameId: string): Promise<Game> {
  return unwrap(apiClient.POST("/staff/games/{gameId}/pause", { params: { path: { gameId } } }));
}

export async function resumeGame(gameId: string): Promise<Game> {
  return unwrap(apiClient.POST("/staff/games/{gameId}/resume", { params: { path: { gameId } } }));
}

export async function nextQuestion(gameId: string): Promise<Game> {
  return unwrap(apiClient.POST("/staff/games/{gameId}/next-question", { params: { path: { gameId } } }));
}

export async function fetchQuestions(gameId: string): Promise<Question[]> {
  return unwrap(apiClient.GET("/staff/games/{gameId}/questions", { params: { path: { gameId } } }));
}

export async function activateQuestion(questionId: string): Promise<Question> {
  return unwrap(apiClient.POST("/staff/questions/{questionId}/activate", { params: { path: { questionId } } }));
}

export async function closeQuestion(questionId: string): Promise<Question> {
  return unwrap(apiClient.POST("/staff/questions/{questionId}/close", { params: { path: { questionId } } }));
}

export async function fetchAnswers(questionId: string): Promise<AnswerModeration[]> {
  return unwrap(apiClient.GET("/staff/questions/{questionId}/answers", { params: { path: { questionId } } }));
}

export async function acceptAnswer(answerId: string): Promise<AnswerModeration> {
  return unwrap(apiClient.POST("/staff/answers/{answerId}/accept", { params: { path: { answerId } } }));
}

export async function hideAnswer(answerId: string): Promise<AnswerModeration> {
  return unwrap(apiClient.POST("/staff/answers/{answerId}/hide", { params: { path: { answerId } } }));
}

export async function correctAnswer(answerId: string, content: string): Promise<AnswerModeration> {
  return unwrap(
    apiClient.PUT("/staff/answers/{answerId}/content", { params: { path: { answerId } }, body: { content } }),
  );
}

export async function relaunchTeam(questionId: string, teamId: string): Promise<AnswerModeration> {
  return unwrap(
    apiClient.POST("/staff/questions/{questionId}/teams/{teamId}/relaunch", {
      params: { path: { questionId, teamId } },
    }),
  );
}

export async function fetchFinalists(questionId: string, revealVoteCount: boolean): Promise<Finalist[]> {
  return unwrap(
    apiClient.GET("/staff/questions/{questionId}/finalists", {
      params: { path: { questionId }, query: { revealVoteCount } },
    }),
  );
}
