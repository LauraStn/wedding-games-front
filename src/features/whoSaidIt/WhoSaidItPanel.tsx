"use client";

import { useState } from "react";
import {
  useAcceptQuestion,
  useCorrectQuestion,
  useModerationQuestions,
  useRejectQuestion,
  useSelectRandomQuestion,
} from "./hooks";
import type { WhoSaidItQuestion } from "./api";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";

const STATUS_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "danger" }> = {
  PENDING: { label: "En attente", tone: "neutral" },
  ACCEPTED: { label: "Acceptée", tone: "success" },
  REJECTED: { label: "Refusée", tone: "danger" },
  PLAYED: { label: "Jouée", tone: "success" },
};

function QuestionRow({ question }: { question: WhoSaidItQuestion }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(question.content ?? "");
  const accept = useAcceptQuestion();
  const reject = useRejectQuestion();
  const correct = useCorrectQuestion();
  const isMutating = accept.isPending || reject.isPending || correct.isPending;
  const status = question.status ? STATUS_LABELS[question.status] : undefined;

  return (
    <li className="answer-list__item">
      <div className="answer-list__header">
        <strong>{question.authorDisplayName}</strong>
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
              question.id &&
              correct.mutate({ id: question.id, content: draft }, { onSuccess: () => setEditing(false) })
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
          <p>{question.content}</p>
          {question.status === "PENDING" && (
            <div className="form__actions">
              <button
                type="button"
                className="btn btn--secondary btn--small"
                disabled={isMutating || !question.id}
                onClick={() => question.id && accept.mutate(question.id)}
              >
                Accepter
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--small"
                disabled={isMutating || !question.id}
                onClick={() => question.id && reject.mutate(question.id)}
              >
                Refuser
              </button>
              <button type="button" className="btn btn--secondary btn--small" disabled={isMutating} onClick={() => setEditing(true)}>
                Corriger
              </button>
            </div>
          )}
        </>
      )}
      {(accept.isError || reject.isError || correct.isError) && (
        <ErrorPanel error={accept.error ?? reject.error ?? correct.error} title="Action impossible" />
      )}
    </li>
  );
}

export function WhoSaidItPanel() {
  const questionsQuery = useModerationQuestions();
  const selectRandom = useSelectRandomQuestion();
  const questions = questionsQuery.data ?? [];
  const accepted = questions.filter((q) => q.status === "ACCEPTED");

  return (
    <div className="card">
      <header className="lobby-card__header">
        <h2>Questions &quot;Lui ou elle ?&quot;</h2>
        <button
          type="button"
          className="btn btn--primary"
          disabled={selectRandom.isPending || accepted.length === 0}
          onClick={() => selectRandom.mutate()}
        >
          {selectRandom.isPending ? "Tirage…" : "Tirer une question au hasard"}
        </button>
      </header>

      {selectRandom.isError && <ErrorPanel error={selectRandom.error} title="Tirage impossible" />}
      {selectRandom.data && (
        <div className="lobby-card__message" role="status">
          <strong>{selectRandom.data.content}</strong>
          {selectRandom.data.authorDisplayName && <p>Proposée par {selectRandom.data.authorDisplayName}</p>}
        </div>
      )}

      {questionsQuery.isLoading && <LoadingScreen label="Chargement des questions…" />}
      {questionsQuery.isError && <ErrorPanel error={questionsQuery.error} onRetry={() => questionsQuery.refetch()} />}
      {questionsQuery.data && questions.length === 0 && <EmptyState title="Aucune question proposée pour le moment" />}
      {questions.length > 0 && (
        <ul className="answer-list">
          {questions.map((question) => (
            <QuestionRow key={question.id} question={question} />
          ))}
        </ul>
      )}
    </div>
  );
}
