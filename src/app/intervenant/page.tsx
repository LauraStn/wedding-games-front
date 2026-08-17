"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RoleGuard } from "../../features/auth/RoleGuard";
import {
  closeLobby,
  fetchIntervenantLobby,
  fetchLateArrivals,
  fetchRecentArrivals,
  lockLobby,
  openLobby,
} from "../../features/intervenant/api";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";

const LOBBY_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "warning" }> = {
  CLOSED: { label: "Fermé", tone: "neutral" },
  OPEN: { label: "Ouvert", tone: "success" },
  LOCKED: { label: "Verrouillé", tone: "warning" },
};

function IntervenantContent() {
  const queryClient = useQueryClient();

  const lobbyQuery = useQuery({
    queryKey: ["intervenant-lobby"],
    queryFn: fetchIntervenantLobby,
    refetchInterval: 10_000,
  });
  const recentArrivalsQuery = useQuery({
    queryKey: ["intervenant-arrivals-recent"],
    queryFn: fetchRecentArrivals,
    refetchInterval: 15_000,
  });
  const lateArrivalsQuery = useQuery({
    queryKey: ["intervenant-arrivals-late"],
    queryFn: fetchLateArrivals,
    refetchInterval: 15_000,
  });

  const invalidateLobby = () => queryClient.invalidateQueries({ queryKey: ["intervenant-lobby"] });
  const openMutation = useMutation({ mutationFn: openLobby, onSuccess: invalidateLobby });
  const closeMutation = useMutation({ mutationFn: closeLobby, onSuccess: invalidateLobby });
  const lockMutation = useMutation({ mutationFn: lockLobby, onSuccess: invalidateLobby });

  if (lobbyQuery.isLoading) {
    return <LoadingScreen label="Chargement du salon…" />;
  }

  const lobby = lobbyQuery.data;
  const status = lobby ? LOBBY_LABELS[lobby.status] : undefined;
  const isMutating = openMutation.isPending || closeMutation.isPending || lockMutation.isPending;

  return (
    <div className="page">
      <div className="card">
        <header className="lobby-card__header">
          <h1>Pilotage du salon</h1>
          {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
        </header>

        {lobbyQuery.isError && (
          <ErrorPanel error={lobbyQuery.error} onRetry={() => lobbyQuery.refetch()} title="État du salon indisponible" />
        )}

        {typeof lobby?.connectedCount === "number" && (
          <p>{lobby.connectedCount} participant{lobby.connectedCount > 1 ? "s" : ""} connecté{lobby.connectedCount > 1 ? "s" : ""}</p>
        )}

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
        {recentArrivalsQuery.isLoading && <LoadingScreen label="Chargement…" />}
        {recentArrivalsQuery.isError && (
          <ErrorPanel error={recentArrivalsQuery.error} onRetry={() => recentArrivalsQuery.refetch()} />
        )}
        {recentArrivalsQuery.data && recentArrivalsQuery.data.length === 0 && (
          <EmptyState title="Aucune arrivée pour le moment" icon="👋" />
        )}
        {recentArrivalsQuery.data && recentArrivalsQuery.data.length > 0 && (
          <ul className="arrival-list">
            {recentArrivalsQuery.data.map((arrival) => (
              <li key={arrival.participantId}>
                {arrival.firstName} {arrival.lastName}
                <span className="arrival-list__time">
                  {new Date(arrival.arrivedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Retardataires</h2>
        {lateArrivalsQuery.isLoading && <LoadingScreen label="Chargement…" />}
        {lateArrivalsQuery.isError && (
          <ErrorPanel error={lateArrivalsQuery.error} onRetry={() => lateArrivalsQuery.refetch()} />
        )}
        {lateArrivalsQuery.data && lateArrivalsQuery.data.length === 0 && (
          <EmptyState title="Aucun retardataire signalé" icon="✓" />
        )}
        {lateArrivalsQuery.data && lateArrivalsQuery.data.length > 0 && (
          <ul className="arrival-list">
            {lateArrivalsQuery.data.map((guest, index) => (
              <li key={index}>
                <span>{guest.firstName} {guest.lastName}</span>
                <button type="button" className="btn btn--secondary btn--small" disabled title="Bientôt disponible">
                  Ajouter manuellement
                </button>
              </li>
            ))}
          </ul>
        )}
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
