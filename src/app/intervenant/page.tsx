"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleGuard } from "../../features/auth/RoleGuard";
import {
  admitParticipant,
  closeLobby,
  fetchLobbyParticipants,
  lockLobby,
  openLobby,
  type LobbyState,
} from "../../features/intervenant/api";
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
  const queryClient = useQueryClient();
  // Aucun endpoint staff ne permet de lire le statut du salon sans le modifier (seul ADMIN
  // le peut via /admin/events/{eventId}/lobby) : le badge ne se peuple qu'après une action.
  const [lobby, setLobby] = useState<LobbyState | null>(null);

  const participantsQuery = useQuery({
    queryKey: ["intervenant-lobby-participants"],
    queryFn: fetchLobbyParticipants,
    refetchInterval: 15_000,
  });

  const openMutation = useMutation({ mutationFn: openLobby, onSuccess: setLobby });
  const closeMutation = useMutation({ mutationFn: closeLobby, onSuccess: setLobby });
  const lockMutation = useMutation({ mutationFn: lockLobby, onSuccess: setLobby });
  const admitMutation = useMutation({
    mutationFn: admitParticipant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["intervenant-lobby-participants"] }),
  });

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
          <button type="button" className="btn btn--primary" disabled={isMutating} onClick={() => openMutation.mutate()}>
            Ouvrir le salon
          </button>
          <button type="button" className="btn btn--secondary" disabled={isMutating} onClick={() => lockMutation.mutate()}>
            Verrouiller
          </button>
          <button type="button" className="btn btn--secondary" disabled={isMutating} onClick={() => closeMutation.mutate()}>
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

      <EmptyState
        title="Jeux non disponibles"
        description="Le pilotage des jeux, questions et votes sera ajouté dans une prochaine phase."
        icon="🎲"
      />
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
