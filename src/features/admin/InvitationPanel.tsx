"use client";

import { useState } from "react";
import {
  useGenerateInvitation,
  useParticipantInvitation,
  useRenewFallbackCode,
  useRevokeInvitation,
} from "./hooks";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { StatusBadge } from "../../components/StatusBadge";
import type { InvitationAdmin } from "./types";

const STATUS_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "danger" }> = {
  ACTIVE: { label: "Active", tone: "success" },
  REVOKED: { label: "Révoquée", tone: "danger" },
};

export function InvitationPanel({ participantId }: { participantId: string }) {
  const invitationQuery = useParticipantInvitation(participantId, true);
  const generate = useGenerateInvitation();
  const revoke = useRevokeInvitation();
  const renewFallbackCode = useRenewFallbackCode();
  const [justGenerated, setJustGenerated] = useState<InvitationAdmin | null>(null);

  if (invitationQuery.isLoading) {
    return <LoadingScreen label="Chargement de l'invitation…" />;
  }

  if (invitationQuery.isError) {
    return (
      <ErrorPanel error={invitationQuery.error} onRetry={() => invitationQuery.refetch()} title="Invitation indisponible" />
    );
  }

  const invitation = invitationQuery.data;
  const status = invitation?.status ? STATUS_LABELS[invitation.status] : undefined;
  const isMutating = generate.isPending || revoke.isPending || renewFallbackCode.isPending;

  return (
    <div className="invitation-panel">
      <div className="invitation-panel__status">
        {status ? <StatusBadge tone={status.tone}>{status.label}</StatusBadge> : <p>Aucune invitation générée</p>}
      </div>

      <div className="form__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={isMutating}
          onClick={() =>
            generate.mutate(participantId, { onSuccess: (result) => setJustGenerated(result) })
          }
        >
          {invitation ? "Régénérer l’invitation" : "Générer l’invitation"}
        </button>
        {invitation?.status === "ACTIVE" && (
          <button
            type="button"
            className="btn btn--secondary"
            disabled={isMutating}
            onClick={() => revoke.mutate(participantId, { onSuccess: () => setJustGenerated(null) })}
          >
            Révoquer
          </button>
        )}
        {invitation && (
          <button
            type="button"
            className="btn btn--secondary"
            disabled={isMutating}
            onClick={() => renewFallbackCode.mutate(participantId)}
          >
            Renouveler le code de secours
          </button>
        )}
      </div>
      {(generate.isError || revoke.isError || renewFallbackCode.isError) && (
        <ErrorPanel
          error={generate.error ?? revoke.error ?? renewFallbackCode.error}
          title="Action impossible"
        />
      )}

      {justGenerated && (
        <div className="invitation-panel__reveal">
          <p role="status">
            Lien à transmettre au participant — il ne sera plus jamais affiché après avoir quitté cette page.
          </p>
          {justGenerated.invitationUrl && (
            <p className="invitation-panel__link">
              <a href={justGenerated.invitationUrl} target="_blank" rel="noreferrer">
                {justGenerated.invitationUrl}
              </a>
            </p>
          )}
          {justGenerated.fallbackCode && (
            <p>
              Code de secours : <strong>{justGenerated.fallbackCode}</strong>
            </p>
          )}
        </div>
      )}

      {renewFallbackCode.data?.fallbackCode && (
        <p>
          Nouveau code de secours : <strong>{renewFallbackCode.data.fallbackCode}</strong>
        </p>
      )}
    </div>
  );
}
