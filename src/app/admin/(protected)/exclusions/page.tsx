"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateExclusion,
  useDeleteExclusion,
  useExclusions,
  useParticipants,
} from "../../../../features/admin/hooks";
import { LoadingScreen } from "../../../../components/LoadingScreen";
import { ErrorPanel } from "../../../../components/ErrorPanel";
import { EmptyState } from "../../../../components/EmptyState";
import { StatusBadge } from "../../../../components/StatusBadge";

const schema = z
  .object({
    participantAId: z.string().min(1, "Sélectionnez un premier participant"),
    participantBId: z.string().min(1, "Sélectionnez un second participant"),
    exclusionType: z.enum(["HARD", "PREFERENCE"]),
    reason: z.string().trim().optional(),
  })
  .refine((values) => values.participantAId !== values.participantBId, {
    message: "Les deux participants doivent être différents",
    path: ["participantBId"],
  });

type FormValues = z.infer<typeof schema>;

export default function AdminExclusionsPage() {
  const participantsQuery = useParticipants("");
  const exclusionsQuery = useExclusions();
  const createExclusion = useCreateExclusion();
  const deleteExclusion = useDeleteExclusion();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { exclusionType: "PREFERENCE" },
  });

  const participants = participantsQuery.data ?? [];
  const nameOf = (id: string | undefined) => {
    const participant = participants.find((p) => p.id === id);
    return participant ? `${participant.firstName} ${participant.lastName}` : (id ?? "");
  };

  const onSubmit = handleSubmit((values) => {
    createExclusion.mutate(
      {
        participantAId: values.participantAId,
        participantBId: values.participantBId,
        exclusionType: values.exclusionType,
        reason: values.reason || undefined,
      },
      { onSuccess: () => reset({ exclusionType: "PREFERENCE" }) },
    );
  });

  return (
    <div className="admin-exclusions">
      <div className="card">
        <h2>Nouvelle exclusion</h2>
        <form className="form" onSubmit={onSubmit} noValidate>
          <label htmlFor="participantAId">Premier participant</label>
          <select id="participantAId" {...register("participantAId")}>
            <option value="">Choisir…</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
          {errors.participantAId && <p className="field-error" role="alert">{errors.participantAId.message}</p>}

          <label htmlFor="participantBId">Second participant</label>
          <select id="participantBId" {...register("participantBId")}>
            <option value="">Choisir…</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
          {errors.participantBId && <p className="field-error" role="alert">{errors.participantBId.message}</p>}

          <fieldset>
            <legend>Type d&apos;exclusion</legend>
            <label className="radio-option">
              <input type="radio" value="PREFERENCE" {...register("exclusionType")} />
              Préférence (évitée si possible)
            </label>
            <label className="radio-option">
              <input type="radio" value="HARD" {...register("exclusionType")} />
              Absolue (jamais associés)
            </label>
          </fieldset>

          <label htmlFor="reason">Motif (optionnel)</label>
          <input id="reason" {...register("reason")} />

          <button type="submit" className="btn btn--primary" disabled={createExclusion.isPending}>
            {createExclusion.isPending ? "Création…" : "Créer l'exclusion"}
          </button>
        </form>
        {createExclusion.isError && <ErrorPanel error={createExclusion.error} title="Création impossible" />}
      </div>

      <div className="card">
        <h2>Exclusions existantes</h2>
        {exclusionsQuery.isLoading && <LoadingScreen label="Chargement…" />}
        {exclusionsQuery.isError && (
          <ErrorPanel error={exclusionsQuery.error} onRetry={() => exclusionsQuery.refetch()} />
        )}
        {exclusionsQuery.data && exclusionsQuery.data.length === 0 && (
          <EmptyState title="Aucune exclusion enregistrée" />
        )}
        {exclusionsQuery.data && exclusionsQuery.data.length > 0 && (
          <ul className="exclusion-list">
            {exclusionsQuery.data.map((exclusion) => (
              <li key={exclusion.id} className="exclusion-list__item">
                <div>
                  <StatusBadge tone={exclusion.exclusionType === "HARD" ? "danger" : "neutral"}>
                    {exclusion.exclusionType === "HARD" ? "Interdiction absolue" : "Préférence"}
                  </StatusBadge>
                  <p>
                    {nameOf(exclusion.participantAId)} — {nameOf(exclusion.participantBId)}
                  </p>
                  {exclusion.reason && <p className="exclusion-list__reason">{exclusion.reason}</p>}
                </div>
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  disabled={!exclusion.id || deleteExclusion.isPending}
                  onClick={() => exclusion.id && deleteExclusion.mutate(exclusion.id)}
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
        {deleteExclusion.isError && <ErrorPanel error={deleteExclusion.error} title="Suppression impossible" />}
      </div>
    </div>
  );
}
