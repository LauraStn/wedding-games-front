"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAcceptAnswer,
  useActivateQuestion,
  useAnswers,
  useCloseQuestion,
  useCorrectAnswer,
  useFinalists,
  useGames,
  useHideAnswer,
  useNextQuestion,
  usePauseGame,
  useQuestions,
  useRelaunchTeam,
  useResumeGame,
  useStartGame,
} from "./hooks";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";

const GAME_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  READY: "Prête",
  ACTIVE: "En cours",
  PAUSED: "En pause",
  FINISHED: "Terminée",
};

const GAME_PHASE_LABELS: Record<string, string> = {
  LOBBY: "Salon",
  PREPARATION: "Préparation",
  QUESTION: "Question",
  ANSWERS_CLOSED: "Réponses closes",
  VOTE: "Vote",
  JURY: "Jury",
  RESULT: "Résultat",
};

const QUESTION_STATUS_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "warning" }> = {
  PENDING: { label: "En attente", tone: "neutral" },
  ACTIVE: { label: "Active", tone: "success" },
  CLOSED: { label: "Fermée", tone: "warning" },
};

const MODERATION_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "danger" }> = {
  PENDING: { label: "En attente", tone: "neutral" },
  ACCEPTED: { label: "Acceptée", tone: "success" },
  HIDDEN: { label: "Masquée", tone: "danger" },
};

function AnswerRow({ questionId, answer }: { questionId: string; answer: ReturnType<typeof useAnswers>["data"] extends (infer T)[] | undefined ? T : never }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(answer.content ?? "");
  const accept = useAcceptAnswer();
  const hide = useHideAnswer();
  const correct = useCorrectAnswer();
  const relaunch = useRelaunchTeam();
  const isMutating = accept.isPending || hide.isPending || correct.isPending || relaunch.isPending;
  const status = answer.moderationStatus ? MODERATION_LABELS[answer.moderationStatus] : undefined;

  return (
    <li className="answer-list__item">
      <div className="answer-list__header">
        <strong>{answer.teamLabel}</strong>
        {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
      </div>

      {editing ? (
        <div className="form__actions">
          <input value={draft} onChange={(event) => setDraft(event.target.value)} />
          <button
            type="button"
            className="btn btn--primary btn--small"
            disabled={isMutating}
            onClick={() =>
              answer.id &&
              correct.mutate({ answerId: answer.id, content: draft }, { onSuccess: () => setEditing(false) })
            }
          >
            Valider
          </button>
          <button type="button" className="btn btn--secondary btn--small" onClick={() => setEditing(false)}>
            Annuler
          </button>
        </div>
      ) : (
        <>
          <p>{answer.content}</p>
          <div className="form__actions">
            <button
              type="button"
              className="btn btn--secondary btn--small"
              disabled={isMutating || answer.moderationStatus === "ACCEPTED" || !answer.id}
              onClick={() => answer.id && accept.mutate(answer.id)}
            >
              Accepter
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--small"
              disabled={isMutating || answer.moderationStatus === "HIDDEN" || !answer.id}
              onClick={() => answer.id && hide.mutate(answer.id)}
            >
              Masquer
            </button>
            <button type="button" className="btn btn--secondary btn--small" disabled={isMutating} onClick={() => setEditing(true)}>
              Corriger
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--small"
              disabled={isMutating || !answer.teamId}
              onClick={() => answer.teamId && relaunch.mutate({ questionId, teamId: answer.teamId })}
            >
              Relancer l’équipe
            </button>
          </div>
        </>
      )}
      {(accept.isError || hide.isError || correct.isError || relaunch.isError) && (
        <ErrorPanel error={accept.error ?? hide.error ?? correct.error ?? relaunch.error} title="Action impossible" />
      )}
    </li>
  );
}

function QuestionDetail({ questionId }: { questionId: string }) {
  const answersQuery = useAnswers(questionId);
  const [revealVoteCount, setRevealVoteCount] = useState(false);
  const finalistsQuery = useFinalists(questionId, revealVoteCount);

  return (
    <div className="question-detail">
      <h3>Réponses</h3>
      {answersQuery.isLoading && <LoadingScreen label="Chargement des réponses…" />}
      {answersQuery.isError && <ErrorPanel error={answersQuery.error} onRetry={() => answersQuery.refetch()} />}
      {answersQuery.data && answersQuery.data.length === 0 && <EmptyState title="Aucune réponse pour le moment" />}
      {answersQuery.data && answersQuery.data.length > 0 && (
        <ul className="answer-list">
          {answersQuery.data.map((answer) => (
            <AnswerRow key={answer.id} questionId={questionId} answer={answer} />
          ))}
        </ul>
      )}

      <h3>Top réponses</h3>
      <label className="checkbox-option">
        <input
          type="checkbox"
          checked={revealVoteCount}
          onChange={(event) => setRevealVoteCount(event.target.checked)}
        />
        Afficher le nombre de votes
      </label>
      {finalistsQuery.data && finalistsQuery.data.length === 0 && (
        <EmptyState title="Aucun vote pour le moment" />
      )}
      {finalistsQuery.data && finalistsQuery.data.length > 0 && (
        <ol className="finalist-list">
          {finalistsQuery.data.map((finalist, index) => (
            <li key={finalist.answerId ?? index}>
              {finalist.content}
              {revealVoteCount && typeof finalist.voteCount === "number" && (
                <span> — {finalist.voteCount} vote{finalist.voteCount > 1 ? "s" : ""}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function GamePilotPanel() {
  const queryClient = useQueryClient();
  const gamesQuery = useGames();
  const [explicitGameId, setSelectedGameId] = useState<string>();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>();

  const games = gamesQuery.data ?? [];
  const selectedGameId = explicitGameId ?? games[0]?.id;

  const selectedGame = games.find((g) => g.id === selectedGameId);
  const questionsQuery = useQuestions(selectedGameId);
  const questions = questionsQuery.data ?? [];

  const invalidateGamesAndQuestions = () => {
    queryClient.invalidateQueries({ queryKey: ["intervenant-games"] });
    queryClient.invalidateQueries({ queryKey: ["intervenant-questions", selectedGameId] });
  };

  const start = useStartGame();
  const pause = usePauseGame();
  const resume = useResumeGame();
  const advance = useNextQuestion();
  const activate = useActivateQuestion();
  const close = useCloseQuestion();

  const isGameMutating = start.isPending || pause.isPending || resume.isPending || advance.isPending;

  if (gamesQuery.isLoading) {
    return <LoadingScreen label="Chargement des parties…" />;
  }

  return (
    <div className="card">
      <h2>Pilotage de jeu</h2>
      {gamesQuery.isError && <ErrorPanel error={gamesQuery.error} onRetry={() => gamesQuery.refetch()} />}
      {games.length === 0 && !gamesQuery.isError && (
        <EmptyState title="Aucune partie configurée" description="Une partie doit d'abord être créée côté admin." />
      )}

      {games.length > 0 && (
        <>
          <label htmlFor="game-select" className="visually-hidden">
            Choisir une partie
          </label>
          <select id="game-select" value={selectedGameId ?? ""} onChange={(event) => {
            setSelectedGameId(event.target.value);
            setSelectedQuestionId(undefined);
          }}>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>

          {selectedGame && (
            <>
              <div className="lobby-card__header">
                <div>
                  {selectedGame.status && (
                    <StatusBadge tone="neutral">{GAME_STATUS_LABELS[selectedGame.status] ?? selectedGame.status}</StatusBadge>
                  )}{" "}
                  {selectedGame.phase && (
                    <StatusBadge tone="neutral">{GAME_PHASE_LABELS[selectedGame.phase] ?? selectedGame.phase}</StatusBadge>
                  )}
                </div>
              </div>

              <div className="intervenant-actions">
                {selectedGame.phase === "LOBBY" && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={isGameMutating}
                    onClick={() => selectedGame.id && start.mutate(selectedGame.id, { onSuccess: invalidateGamesAndQuestions })}
                  >
                    Démarrer la partie
                  </button>
                )}
                {selectedGame.status === "ACTIVE" && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    disabled={isGameMutating}
                    onClick={() => selectedGame.id && pause.mutate(selectedGame.id, { onSuccess: invalidateGamesAndQuestions })}
                  >
                    Mettre en pause
                  </button>
                )}
                {selectedGame.status === "PAUSED" && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    disabled={isGameMutating}
                    onClick={() => selectedGame.id && resume.mutate(selectedGame.id, { onSuccess: invalidateGamesAndQuestions })}
                  >
                    Reprendre
                  </button>
                )}
                {(selectedGame.phase === "PREPARATION" || selectedGame.phase === "RESULT") && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    disabled={isGameMutating}
                    onClick={() => selectedGame.id && advance.mutate(selectedGame.id, { onSuccess: invalidateGamesAndQuestions })}
                  >
                    Question suivante
                  </button>
                )}
              </div>
              {(start.isError || pause.isError || resume.isError || advance.isError) && (
                <ErrorPanel error={start.error ?? pause.error ?? resume.error ?? advance.error} title="Action impossible" />
              )}

              <h3>Questions</h3>
              {questionsQuery.data && questions.length === 0 && <EmptyState title="Aucune question pour cette partie" />}
              {questions.length > 0 && (
                <ul className="question-list">
                  {questions.map((question) => {
                    const status = question.status ? QUESTION_STATUS_LABELS[question.status] : undefined;
                    return (
                      <li key={question.id} className="question-list__item">
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => question.id && setSelectedQuestionId(question.id)}
                        >
                          {question.prompt}
                        </button>
                        {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
                        {question.status === "PENDING" && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            disabled={activate.isPending}
                            onClick={() =>
                              question.id &&
                              activate.mutate(question.id, {
                                onSuccess: () => {
                                  invalidateGamesAndQuestions();
                                  setSelectedQuestionId(question.id);
                                },
                              })
                            }
                          >
                            Activer
                          </button>
                        )}
                        {question.status === "ACTIVE" && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            disabled={close.isPending}
                            onClick={() => question.id && close.mutate(question.id, { onSuccess: invalidateGamesAndQuestions })}
                          >
                            Fermer
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              {(activate.isError || close.isError) && (
                <ErrorPanel error={activate.error ?? close.error} title="Action impossible" />
              )}

              {selectedQuestionId && <QuestionDetail questionId={selectedQuestionId} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
