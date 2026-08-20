"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { WeddupMark } from "../../components/WeddupMark";

const CONTACT_EMAIL = "contact@weddup.app";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Merci d'indiquer votre nom"),
  email: z.string().trim().email("Adresse e-mail invalide"),
  message: z.string().trim().min(10, "Votre message est un peu court"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = handleSubmit(({ name, email, message }) => {
    const subject = encodeURIComponent(`Contact Weddup — ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.assign(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`);
    setSent(true);
  });

  return (
    <div className="contact">
      <div className="contact__decor" aria-hidden="true">
        <span className="contact__blob" />
        <span className="contact__ring" />
        <div className="contact__mark-wrap">
          <span className="contact__mark-backdrop" />
          <span className="contact__mark-dot" />
          <div className="contact__mark">
            <WeddupMark className="contact__mark-svg" />
          </div>
        </div>
      </div>

      <div className="card contact-card">
        <Link href="/" className="link-button contact-card__back">
          ← Retour
        </Link>
        <Image
          src="/logo.png"
          alt="Weddup"
          width={1942}
          height={809}
          className="contact-card__logo"
        />
        <h1>Besoin d&apos;aide&nbsp;?</h1>
        <p>Décrivez votre besoin, nous vous répondons rapidement.</p>

        {sent ? (
          <div className="identity-confirm">
            <p>
              Votre client mail devrait s&apos;être ouvert avec votre message pré-rempli. S&apos;il
              ne s&apos;est pas ouvert, écrivez-nous directement à{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <Link href="/" className="btn btn--secondary">
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="form">
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name")}
            />
            {errors.name && (
              <p id="name-error" className="field-error" role="alert">
                {errors.name.message}
              </p>
            )}

            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="field-error" role="alert">
                {errors.email.message}
              </p>
            )}

            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              rows={5}
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "message-error" : undefined}
              {...register("message")}
            />
            {errors.message && (
              <p id="message-error" className="field-error" role="alert">
                {errors.message.message}
              </p>
            )}

            <button type="submit" className="btn btn--primary">
              Envoyer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
