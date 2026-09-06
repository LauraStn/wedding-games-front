"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMyQuestions, useProposeQuestion, useUpdateMyQuestion } from "./hooks";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { StatusBadge } from "../../components/StatusBadge";

const EXAMPLES = [
  "Qui a déjà chanté sous la douche avec une brosse à cheveux en guise de micro ?",
  "Qui mettrait de l'ananas sur sa pizza sans hésiter ?",
  "Qui a le plus de chances de s'endormir avant le dessert ?",
];

const schema = z.object({
  content: z.string().trim().min(1, "La question ne peut pas être vide"),
  revealAuthorConsent: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const STATUS_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "danger" }> = {
  PENDING: { label: "En attente de validation", tone: "neutral" },
  ACCEPTED: { label: "Validée", tone: "success" },
  REJECTED: { label: "Refusée", tone: "danger" },
  PLAYED: { label: "Jouée", tone: "success" },
};

function EditQuestionRow({
  id,
  initialContent,
  initialConsent,
  onDone,
}: {
  id: string;
  initialContent: string;
  initialConsent: boolean;
  onDone: () => void;
}) {
  const update = useUpdateMyQuestion();
  const [content, setContent] = useState(initialContent);
  const [consent, setConsent] = useState(initialConsent);

  return (
    <div className="form__actions">
      <input value={content} onChange={(event) => setContent(event.target.value)} />
      <label className="checkbox-option">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        Révéler mon prénom
      </label>
      <button
        type="button"
        className="btn btn--primary btn--small"
        disabled={update.isPending}
        onClick={() => update.mutate({ id, content, revealAuthorConsent: consent }, { onSuccess: onDone })}
      >
        Valider
      </button>
      <button type="button" className="btn btn--secondary btn--small" onClick={onDone}>
        Annuler
      </button>
      {update.isError && <ErrorPanel error={update.error} title="Modification impossible" />}
    </div>
  );
}

export function WhoSaidItProposalForm() {
  const myQuestionsQuery = useMyQuestions();
  const propose = useProposeQuestion();
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { content: "", revealAuthorConsent: false } });

  const onSubmit = handleSubmit(({ content, revealAuthorConsent }) => {
    propose.mutate({ content, revealAuthorConsent }, { onSuccess: () => reset() });
  });

  const questions = myQuestionsQuery.data ?? [];

  return (
    <div className="card">
      <h2>Proposer une question &quot;Lui ou elle ?&quot;</h2>
      <p className="lobby-card__eyebrow">Quelques idées pour t&apos;inspirer :</p>
      <ul className="whosaidit-examples">
        {EXAMPLES.map((example) => (
          <li key={example}>{example}</li>
        ))}
      </ul>

      <form className="form" onSubmit={onSubmit} noValidate>
        <label htmlFor="whosaidit-content">Ta question</label>
        <textarea id="whosaidit-content" rows={2} {...register("content")} aria-invalid={errors.content ? "true" : "false"} />
        {errors.content && <p className="field-error" role="alert">{errors.content.message}</p>}

        <label className="checkbox-option">
          <input type="checkbox" {...register("revealAuthorConsent")} />
          Autoriser à révéler que c&apos;est moi qui ai proposé cette question
        </label>

        <div className="form__actions">
          <button type="submit" className="btn btn--primary" disabled={propose.isPending}>
            {propose.isPending ? "Envoi…" : "Proposer"}
          </button>
        </div>
      </form>
      {propose.isError && <ErrorPanel error={propose.error} title="Envoi impossible" />}

      {myQuestionsQuery.isLoading && <LoadingScreen label="Chargement de tes questions…" />}
      {questions.length > 0 && (
        <ul className="whosaidit-list">
          {questions.map((question) => {
            const status = question.status ? STATUS_LABELS[question.status] : undefined;
            const isEditing = editingId === question.id;
            return (
              <li key={question.id} className="whosaidit-list__item">
                {isEditing && question.id ? (
                  <EditQuestionRow
                    id={question.id}
                    initialContent={question.content ?? ""}
                    initialConsent={question.revealAuthorConsent ?? false}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div className="answer-list__header">
                      <span>{question.content}</span>
                      {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
                    </div>
                    {question.status === "PENDING" && (
                      <button type="button" className="btn btn--secondary btn--small" onClick={() => setEditingId(question.id ?? null)}>
                        Modifier
                      </button>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
