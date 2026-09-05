"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Participant, ParticipantCreateInput, ParticipantUpdateInput } from "./types";

const schema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis"),
  lastName: z.string().trim().min(1, "Le nom est requis"),
});

type FormValues = z.infer<typeof schema>;

interface ParticipantFormProps {
  participant?: Participant;
  onSubmit: (input: ParticipantCreateInput | ParticipantUpdateInput) => void;
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
    },
  });

  useEffect(() => {
    reset({
      firstName: participant?.firstName ?? "",
      lastName: participant?.lastName ?? "",
    });
  }, [participant, reset]);

  const submit = handleSubmit(({ firstName, lastName }) => {
    const displayName = `${firstName} ${lastName}`.trim();
    if (participant) {
      onSubmit({
        firstName,
        lastName,
        displayName,
        participantType: participant.participantType ?? "GUEST",
        status: participant.status ?? "INVITED",
      } satisfies ParticipantUpdateInput);
    } else {
      onSubmit({ firstName, lastName, displayName, participantType: "GUEST" } satisfies ParticipantCreateInput);
    }
  });

  return (
    <form className="form" onSubmit={submit} noValidate>
      <label htmlFor="firstName">Prénom</label>
      <input id="firstName" {...register("firstName")} aria-invalid={errors.firstName ? "true" : "false"} />
      {errors.firstName && <p className="field-error" role="alert">{errors.firstName.message}</p>}

      <label htmlFor="lastName">Nom</label>
      <input id="lastName" {...register("lastName")} aria-invalid={errors.lastName ? "true" : "false"} />
      {errors.lastName && <p className="field-error" role="alert">{errors.lastName.message}</p>}

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
