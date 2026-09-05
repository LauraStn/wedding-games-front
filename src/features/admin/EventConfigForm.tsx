"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { EventConfig, EventConfigInput } from "./types";

const schema = z.object({
  title: z.string().trim().min(1, "Le titre est requis"),
  spouseOneName: z.string().trim().optional(),
  spouseTwoName: z.string().trim().optional(),
  eventDate: z.string().optional(),
  venueName: z.string().trim().optional(),
  welcomeMessage: z.string().trim().optional(),
  primaryColor: z.string().trim().optional(),
  secondaryColor: z.string().trim().optional(),
  logoUrl: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(config?: EventConfig): FormValues {
  const visual = (config?.visualConfig ?? {}) as Record<string, unknown>;
  const asString = (value: unknown) => (typeof value === "string" ? value : "");
  return {
    title: config?.title ?? "",
    spouseOneName: config?.spouseOneName ?? "",
    spouseTwoName: config?.spouseTwoName ?? "",
    eventDate: config?.eventDate ?? "",
    venueName: config?.venueName ?? "",
    welcomeMessage: config?.welcomeMessage ?? "",
    primaryColor: asString(visual.primaryColor),
    secondaryColor: asString(visual.secondaryColor),
    logoUrl: asString(visual.logoUrl),
  };
}

interface EventConfigFormProps {
  config?: EventConfig;
  onSubmit: (input: EventConfigInput) => void;
  isSubmitting: boolean;
}

export function EventConfigForm({ config, onSubmit, isSubmitting }: EventConfigFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(config) });

  useEffect(() => {
    reset(toFormValues(config));
  }, [config, reset]);

  const onValid = handleSubmit((values) => {
    onSubmit({
      title: values.title,
      spouseOneName: values.spouseOneName || undefined,
      spouseTwoName: values.spouseTwoName || undefined,
      eventDate: values.eventDate || undefined,
      venueName: values.venueName || undefined,
      welcomeMessage: values.welcomeMessage || undefined,
      visualConfig: {
        ...(values.primaryColor ? { primaryColor: values.primaryColor } : {}),
        ...(values.secondaryColor ? { secondaryColor: values.secondaryColor } : {}),
        ...(values.logoUrl ? { logoUrl: values.logoUrl } : {}),
      },
    });
  });

  return (
    <form className="form" onSubmit={onValid} noValidate>
      <label htmlFor="title">Titre de l&apos;événement</label>
      <input id="title" {...register("title")} aria-invalid={errors.title ? "true" : "false"} />
      {errors.title && <p className="field-error" role="alert">{errors.title.message}</p>}

      <label htmlFor="spouseOneName">Premier·ère marié·e</label>
      <input id="spouseOneName" {...register("spouseOneName")} />

      <label htmlFor="spouseTwoName">Second·e marié·e</label>
      <input id="spouseTwoName" {...register("spouseTwoName")} />

      <label htmlFor="eventDate">Date</label>
      <input id="eventDate" type="date" {...register("eventDate")} />

      <label htmlFor="venueName">Lieu</label>
      <input id="venueName" {...register("venueName")} />

      <label htmlFor="welcomeMessage">Texte d&apos;accueil</label>
      <textarea id="welcomeMessage" rows={3} {...register("welcomeMessage")} />

      <label htmlFor="primaryColor">Couleur principale</label>
      <input id="primaryColor" type="text" placeholder="#2457ff" {...register("primaryColor")} />

      <label htmlFor="secondaryColor">Couleur secondaire</label>
      <input id="secondaryColor" type="text" placeholder="#fafbff" {...register("secondaryColor")} />

      <label htmlFor="logoUrl">URL du logo</label>
      <input id="logoUrl" type="text" {...register("logoUrl")} />

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
