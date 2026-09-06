"use client";

import { useState } from "react";
import { RoleGuard } from "../../features/auth/RoleGuard";
import {
  useAdmitParticipant,
  useCloseLobby,
  useLobbyParticipants,
  useLockLobby,
  useOpenLobby,
} from "../../features/intervenant/hooks";
import type { LobbyState } from "../../features/intervenant/api";
import { MatchmakingPanel } from "../../features/intervenant/MatchmakingPanel";
import { GamePilotPanel } from "../../features/intervenant/GamePilotPanel";
import { ScorePanel } from "../../features/intervenant/ScorePanel";
import { WhoSaidItPanel } from "../../features/whoSaidIt/WhoSaidItPanel";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";

const LOBBY_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "warning" }> = {
  CLOSED: { label: "Fermé", tone: "neutral" },
  OPEN: { label: "Ouvert", tone: "success" },
  LOCKED: { label: "Verrouillé", tone: "warning" },
  ACTIVE: { label: "Activité en cours", tone: "success" },
  PAUSED: { label: "Activité en pause", tone: "warning" },
  FINISHED: { label: "Soirée terminée", tone: "neutral" },
};

function IntervenantContent() {
  // Aucun endpoint staff ne permet de lire le statut du salon sans le modifier (seul ADMIN
  // le peut via /admin/events/{eventId}/lobby) : le badge ne se peuple qu'après une action.
  const [lobby, setLobby] = useState<LobbyState | null>(null);

  const participantsQuery = useLobbyParticipants();
  const openMutation = useOpenLobby();
  const closeMutation = useCloseLobby();
  const lockMutation = useLockLobby();
  const admitMutation = useAdmitParticipant();

  const status = lobby?.status ? LOBBY_LABELS[lobby.status] : undefined;
  const isMutating = openMutation.isPending || closeMutation.isPending || lockMutation.isPending;

  const participants = participantsQuery.data ?? [];
  const recentArrivals = [...participants]
    .filter((p) => p.arrivedAt)
    .sort((a, b) => (b.arrivedAt ?? "").localeCompare(a.arrivedAt ?? ""))
    .slice(0, 10);
  const lateArrivals = participants.filter((p) => p.connectionStatus === "LATE");

  return (
    <div className="page">
      <div className="card">
        <header className="lobby-card__header">
          <h1>Pilotage du salon</h1>
          {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
        </header>

        <div className="intervenant-actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={isMutating}
            onClick={() => openMutation.mutate(undefined, { onSuccess: setLobby })}
          >
            Ouvrir le salon
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={isMutating}
            onClick={() => lockMutation.mutate(undefined, { onSuccess: setLobby })}
          >
            Verrouiller
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={isMutating}
            onClick={() => closeMutation.mutate(undefined, { onSuccess: setLobby })}
          >
            Fermer
          </button>
        </div>
        {(openMutation.isError || closeMutation.isError || lockMutation.isError) && (
          <ErrorPanel
            error={openMutation.error ?? closeMutation.error ?? lockMutation.error}
            title="Action impossible"
          />
        )}
      </div>

      <div className="card">
        <h2>Dernières arrivées</h2>
        {participantsQuery.isLoading && <LoadingScreen label="Chargement…" />}
        {participantsQuery.isError && (
          <ErrorPanel error={participantsQuery.error} onRetry={() => participantsQuery.refetch()} />
        )}
        {participantsQuery.data && recentArrivals.length === 0 && (
          <EmptyState title="Aucune arrivée pour le moment" icon="👋" />
        )}
        {recentArrivals.length > 0 && (
          <ul className="arrival-list">
            {recentArrivals.map((arrival) => (
              <li key={arrival.participantId}>
                {arrival.displayName}
                {arrival.arrivedAt && (
                  <span className="arrival-list__time">
                    {new Date(arrival.arrivedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Retardataires</h2>
        {participantsQuery.data && lateArrivals.length === 0 && (
          <EmptyState title="Aucun retardataire signalé" icon="✓" />
        )}
        {lateArrivals.length > 0 && (
          <ul className="arrival-list">
            {lateArrivals.map((guest) => (
              <li key={guest.participantId}>
                <span>{guest.displayName}</span>
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  disabled={!guest.participantId || admitMutation.isPending}
                  onClick={() => guest.participantId && admitMutation.mutate(guest.participantId)}
                >
                  Ajouter manuellement
                </button>
              </li>
            ))}
          </ul>
        )}
        {admitMutation.isError && <ErrorPanel error={admitMutation.error} title="Action impossible" />}
      </div>

      <MatchmakingPanel />
      <GamePilotPanel />
      <WhoSaidItPanel />
      <ScorePanel />
    </div>
  );
}

export default function IntervenantPage() {
  return (
    <RoleGuard allow={["INTERVENANT"]}>
      <IntervenantContent />
    </RoleGuard>
  );
}
