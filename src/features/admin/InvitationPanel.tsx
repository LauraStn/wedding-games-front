"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useGenerateInvitation,
  useParticipantInvitation,
  useRegenerateInvitation,
} from "./hooks";
import { fetchParticipantQrBlob } from "./api";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { StatusBadge } from "../../components/StatusBadge";

const STATUS_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "warning" | "danger" }> = {
  NOT_GENERATED: { label: "Non générée", tone: "neutral" },
  VALID: { label: "Valide", tone: "success" },
  REVOKED: { label: "Révoquée", tone: "danger" },
  ALREADY_USED: { label: "Déjà utilisée", tone: "warning" },
  EXPIRED: { label: "Expirée", tone: "warning" },
};

function useQrObjectUrl(participantId: string, enabled: boolean) {
  const [url, setUrl] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["admin-participant-qr", participantId],
    queryFn: () => fetchParticipantQrBlob(participantId),
    enabled,
  });

  // Cycle de vie d'une ressource externe (Blob URL) : setState + nettoyage
  // sont ici le mécanisme React recommandé, pas un état dérivable au rendu.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!query.data) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(query.data);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [query.data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { url, isLoading: query.isLoading };
}

export function InvitationPanel({ participantId }: { participantId: string }) {
  const invitationQuery = useParticipantInvitation(participantId, true);
  const generate = useGenerateInvitation();
  const regenerate = useRegenerateInvitation();
  const qr = useQrObjectUrl(participantId, invitationQuery.data?.qrAvailable === true);

  if (invitationQuery.isLoading) {
    return <LoadingScreen label="Chargement de l'invitation…" />;
  }

  if (invitationQuery.isError) {
    return (
      <ErrorPanel error={invitationQuery.error} onRetry={() => invitationQuery.refetch()} title="Invitation indisponible" />
    );
  }

  const invitation = invitationQuery.data;
  const status = invitation ? STATUS_LABELS[invitation.status] : undefined;
  const isMutating = generate.isPending || regenerate.isPending;

  return (
    <div className="invitation-panel">
      <div className="invitation-panel__status">
        {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
      </div>

      <div className="form__actions">
        {invitation?.status === "NOT_GENERATED" ? (
          <button
            type="button"
            className="btn btn--primary"
            disabled={isMutating}
            onClick={() => generate.mutate(participantId)}
          >
            Générer l’invitation
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--secondary"
            disabled={isMutating}
            onClick={() => regenerate.mutate(participantId)}
          >
            Régénérer l’invitation
          </button>
        )}
      </div>
      {(generate.isError || regenerate.isError) && (
        <ErrorPanel error={generate.error ?? regenerate.error} title="Action impossible" />
      )}

      {invitation?.qrAvailable && (
        <div className="invitation-panel__qr">
          {qr.isLoading && <LoadingScreen label="Chargement du QR…" />}
          {qr.url && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- blob local, non optimisable */}
              <img src={qr.url} alt={`QR code d'invitation`} width={200} height={200} />
              <a className="btn btn--secondary" href={qr.url} download={`invitation-${participantId}.png`}>
                Télécharger le QR
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
