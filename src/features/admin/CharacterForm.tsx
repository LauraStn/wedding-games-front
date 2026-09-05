"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { GameCharacter, GameCharacterCreateInput, GameCharacterUpdateInput } from "./types";

const schema = z.object({
  name: z.string().trim().min(1, "Le nom est requis"),
  description: z.string().trim().optional(),
  avatarUrl: z.string().trim().optional(),
  gender: z.enum(["MALE", "FEMALE", ""]).optional(),
});

type FormValues = z.infer<typeof schema>;

interface CharacterFormProps {
  character?: GameCharacter;
  onSubmit: (input: GameCharacterCreateInput | GameCharacterUpdateInput) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

function toFormValues(character?: GameCharacter): FormValues {
  return {
    name: character?.name ?? "",
    description: character?.description ?? "",
    avatarUrl: character?.avatarUrl ?? "",
    gender: character?.gender ?? "",
  };
}

export function CharacterForm({ character, onSubmit, isSubmitting, onCancel }: CharacterFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(character) });

  useEffect(() => {
    reset(toFormValues(character));
  }, [character, reset]);

  const submit = handleSubmit(({ name, description, avatarUrl, gender }) => {
    onSubmit({
      name,
      description: description || undefined,
      avatarUrl: avatarUrl || undefined,
      gender: gender || undefined,
    });
  });

  return (
    <form className="form" onSubmit={submit} noValidate>
      <label htmlFor="character-name">Nom</label>
      <input id="character-name" {...register("name")} aria-invalid={errors.name ? "true" : "false"} />
      {errors.name && <p className="field-error" role="alert">{errors.name.message}</p>}

      <label htmlFor="character-description">Description</label>
      <textarea id="character-description" rows={2} {...register("description")} />

      <label htmlFor="character-avatar">URL de l&apos;avatar</label>
      <input id="character-avatar" type="text" {...register("avatarUrl")} />

      <fieldset>
        <legend>Genre du personnage</legend>
        <label className="radio-option">
          <input type="radio" value="" {...register("gender")} />
          Non précisé
        </label>
        <label className="radio-option">
          <input type="radio" value="MALE" {...register("gender")} />
          Masculin
        </label>
        <label className="radio-option">
          <input type="radio" value="FEMALE" {...register("gender")} />
          Féminin
        </label>
      </fieldset>

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {character ? "Enregistrer" : "Ajouter"}
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
