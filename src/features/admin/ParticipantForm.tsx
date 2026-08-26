"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Participant, ParticipantInput } from "./types";

const schema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis"),
  lastName: z.string().trim().min(1, "Le nom est requis"),
  role: z.enum(["ADMIN", "INTERVENANT", "JURY", "PARTICIPANT", "PROJECTION"]),
});

type FormValues = z.infer<typeof schema>;

interface ParticipantFormProps {
  participant?: Participant;
  onSubmit: (input: ParticipantInput) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function ParticipantForm({ participant, onSubmit, isSubmitting, onCancel }: ParticipantFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: participant?.firstName ?? "",
      lastName: participant?.lastName ?? "",
      role: participant?.role ?? "PARTICIPANT",
    },
  });

  useEffect(() => {
    reset({
      firstName: participant?.firstName ?? "",
      lastName: participant?.lastName ?? "",
      role: participant?.role ?? "PARTICIPANT",
    });
  }, [participant, reset]);

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="firstName">Prénom</label>
      <input id="firstName" {...register("firstName")} aria-invalid={errors.firstName ? "true" : "false"} />
      {errors.firstName && <p className="field-error" role="alert">{errors.firstName.message}</p>}

      <label htmlFor="lastName">Nom</label>
      <input id="lastName" {...register("lastName")} aria-invalid={errors.lastName ? "true" : "false"} />
      {errors.lastName && <p className="field-error" role="alert">{errors.lastName.message}</p>}

      <label htmlFor="role">Rôle</label>
      <select id="role" {...register("role")}>
        <option value="PARTICIPANT">Participant</option>
        <option value="INTERVENANT">Intervenant</option>
        <option value="JURY">Jury</option>
        <option value="ADMIN">Administrateur</option>
        <option value="PROJECTION">Écran de projection</option>
      </select>

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {participant ? "Enregistrer" : "Ajouter"}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
