"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../features/auth/useSession";
import { useConfirmInvitation, useResolveFallbackCode } from "../features/auth/mutations";
import { ErrorPanel } from "../components/ErrorPanel";
import { WeddupMark } from "../components/WeddupMark";
import type { InvitationPreview } from "../features/auth/types";

const fallbackSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "Le code doit contenir au moins 4 caractères"),
});

type FallbackFormValues = z.infer<typeof fallbackSchema>;

const ROLE_HOME: Record<string, string> = {
  PARTICIPANT: "/lobby",
  ADMIN: "/admin",
  INTERVENANT: "/intervenant",
  JURY: "/jury",
  SCREEN: "/screen",
};

function invitationStatusMessage(status: InvitationPreview["status"]): string | null {
  switch (status) {
    case "VALID":
      return null;
    case "REVOKED":
      return "Cette invitation a été révoquée. Rapprochez-vous des mariés.";
    case "ALREADY_USED":
      return "Cette invitation a déjà été utilisée sur un autre appareil.";
    case "EXPIRED":
      return "Cette invitation a expiré.";
  }
}

function SessionExpiredNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("reason") !== "session-expired") return null;

  return (
    <div className="error-panel" role="alert">
      <p className="error-panel__message">
        Votre session a expiré. Merci de rescanner votre invitation ou de saisir votre code de secours.
      </p>
    </div>
  );
}

export default function HomePage() {
  const { session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "code">("idle");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const resolveFallback = useResolveFallbackCode();
  const confirm = useConfirmInvitation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FallbackFormValues>({ resolver: zodResolver(fallbackSchema) });

  const onSubmitCode = handleSubmit(({ code }) => {
    setSubmittedCode(code);
    resolveFallback.mutate(code, {
      onSuccess: (result) => setPreview(result),
    });
  });

  const onConfirm = () => {
    if (!submittedCode) return;
    confirm.mutate(
      { code: submittedCode },
      { onSuccess: () => router.replace("/lobby") },
    );
  };

  const onRestart = () => {
    setPreview(null);
    setSubmittedCode(null);
    resolveFallback.reset();
    confirm.reset();
  };

  const onBackToHome = () => {
    onRestart();
    setStep("idle");
  };

  const blockingStatusMessage = preview ? invitationStatusMessage(preview.status) : null;

  return (
    <div className="home">
      <div className="home__visual" aria-hidden="true">
        <span className="home__blob" />
        <div className="home__mark-wrap">
          <span className="home__mark-backdrop" />
          <span className="home__mark-dot" />
          <div className="home__mark">
            <WeddupMark className="home__mark-svg" />
          </div>
        </div>
      </div>

      <div className="home__panel">
        <div className="home__inner">
          <Image
            src="/logo.png"
            alt="Weddup"
            width={1942}
            height={809}
            className="home__logotype"
            priority
          />

          <Suspense fallback={null}>
            <SessionExpiredNotice />
          </Suspense>

          {step === "idle" && (
            <>
              <h1 className="home__title">
                Mariés, prêts,
                <br />
                <span className="home__highlight">jouez&nbsp;!</span>
              </h1>
              <p className="home__subtitle">
                Vous avez reçu une invitation&nbsp;? Rejoignez les jeux de la soirée, découvrez
                votre binôme et laissez-vous guider.
              </p>

              {session ? (
                <Link href={ROLE_HOME[session.role] ?? "/"} className="btn btn--primary home__cta">
                  Continuer <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary home__cta"
                  onClick={() => setStep("code")}
                >
                  Commencer <span aria-hidden="true">→</span>
                </button>
              )}
              <p className="home__mention">Aucun compte nécessaire</p>
            </>
          )}

          {step === "code" && (
            <section className="home__form-section" aria-labelledby="fallback-heading">
              <button type="button" className="link-button home__back" onClick={onBackToHome}>
                ← Retour
              </button>
              <h2 id="fallback-heading">Pas de QR sous la main ?</h2>
              <p>Saisissez votre code d&apos;invitation de secours.</p>

              {!preview && (
                <form onSubmit={onSubmitCode} noValidate className="form">
                  <label htmlFor="code">Code d&apos;invitation</label>
                  <input
                    id="code"
                    type="text"
                    autoComplete="off"
                    inputMode="text"
                    aria-invalid={errors.code ? "true" : "false"}
                    aria-describedby={errors.code ? "code-error" : undefined}
                    {...register("code")}
                  />
                  {errors.code && (
                    <p id="code-error" className="field-error" role="alert">
                      {errors.code.message}
                    </p>
                  )}
                  <button type="submit" className="btn btn--primary" disabled={resolveFallback.isPending}>
                    {resolveFallback.isPending ? "Vérification…" : "Valider le code"}
                  </button>
                </form>
              )}

              {resolveFallback.isError && (
                <ErrorPanel error={resolveFallback.error} title="Code invalide" />
              )}

              {preview && !blockingStatusMessage && (
                <div className="identity-confirm">
                  <p>
                    Bienvenue <strong>{preview.firstName} {preview.lastName}</strong>. Confirmez-vous
                    votre identité ?
                  </p>
                  <div className="identity-confirm__actions">
                    <button type="button" className="btn btn--primary" onClick={onConfirm} disabled={confirm.isPending}>
                      {confirm.isPending ? "Confirmation…" : "C’est bien moi"}
                    </button>
                    <button type="button" className="btn btn--secondary" onClick={onRestart}>
                      Ce n&apos;est pas moi
                    </button>
                  </div>
                  {confirm.isError && <ErrorPanel error={confirm.error} title="Confirmation impossible" />}
                </div>
              )}

              {preview && blockingStatusMessage && (
                <div className="error-panel" role="alert">
                  <p className="error-panel__message">{blockingStatusMessage}</p>
                  <button type="button" className="btn btn--secondary" onClick={onRestart}>
                    Réessayer avec un autre code
                  </button>
                </div>
              )}
            </section>
          )}

          <Link href="/admin" className="home__admin-link">
            Administration
          </Link>
        </div>
      </div>
    </div>
  );
}
