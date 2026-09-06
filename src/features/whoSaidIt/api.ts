import { apiClient } from "../../api/client";
import { getCurrentEventId } from "../../api/currentEvent";
import { unwrap } from "../../api/errors";
import type { components } from "../../api/schema";

export type WhoSaidItQuestion = components["schemas"]["WhoSaidItQuestionResponse"];

// --- Participant : proposition de questions dans le salon ---

export async function fetchMyQuestions(): Promise<WhoSaidItQuestion[]> {
  return unwrap(apiClient.GET("/who-said-it/questions/me"));
}

export async function proposeQuestion(content: string, revealAuthorConsent: boolean): Promise<WhoSaidItQuestion> {
  return unwrap(apiClient.POST("/who-said-it/questions", { body: { content, revealAuthorConsent } }));
}

export async function updateMyQuestion(
  id: string,
  content: string,
  revealAuthorConsent: boolean,
): Promise<WhoSaidItQuestion> {
  return unwrap(
    apiClient.PUT("/who-said-it/questions/{id}", {
      params: { path: { id } },
      body: { content, revealAuthorConsent },
    }),
  );
}

// --- Intervenant : modération et tirage au sort ---

export async function fetchQuestionsForModeration(): Promise<WhoSaidItQuestion[]> {
  const eventId = await getCurrentEventId();
  return unwrap(
    apiClient.GET("/staff/events/{eventId}/who-said-it/questions", { params: { path: { eventId } } }),
  );
}

export async function acceptQuestion(id: string): Promise<WhoSaidItQuestion> {
  return unwrap(apiClient.POST("/staff/who-said-it/questions/{id}/accept", { params: { path: { id } } }));
}

export async function rejectQuestion(id: string): Promise<WhoSaidItQuestion> {
  return unwrap(apiClient.POST("/staff/who-said-it/questions/{id}/reject", { params: { path: { id } } }));
}

export async function correctQuestion(id: string, content: string): Promise<WhoSaidItQuestion> {
  return unwrap(
    apiClient.PUT("/staff/who-said-it/questions/{id}/content", { params: { path: { id } }, body: { content } }),
  );
}

export async function selectRandomQuestion(): Promise<WhoSaidItQuestion> {
  const eventId = await getCurrentEventId();
  return unwrap(
    apiClient.POST("/staff/events/{eventId}/who-said-it/questions/select-random", {
      params: { path: { eventId } },
    }),
  );
}
