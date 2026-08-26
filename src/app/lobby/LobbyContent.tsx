"use client";

import { useSession } from "../../features/auth/useSession";
import { useLobby } from "../../features/lobby/useLobby";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { useOnlineStatus } from "../../lib/useOnlineStatus";

const LOBBY_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "warning" }> = {
  CLOSED: { label: "Salon fermé", tone: "neutral" },
  OPEN: { label: "Salon ouvert", tone: "success" },
  LOCKED: { label: "Salon verrouillé", tone: "warning" },
};

export function ParticipantLobbyContent() {
  const { session, isLoading: sessionLoading } = useSession();
  const { lobby, isLoading: lobbyLoading, isError, error, refetch } = useLobby();
  const isOnline = useOnlineStatus();

  if (sessionLoading || lobbyLoading) {
    return <LoadingScreen label="Chargement du salon…" />;
  }

  const lobbyInfo = lobby ? LOBBY_LABELS[lobby.status] : undefined;

  return (
    <div className="page">
      <div className="card lobby-card">
        <header className="lobby-card__header">
          <div>
            <p className="lobby-card__eyebrow">Vous êtes connecté·e en tant que</p>
            <h1>{session?.participant?.displayName}</h1>
          </div>
          <StatusBadge tone={isOnline ? "success" : "danger"}>
            {isOnline ? "Connecté" : "Hors connexion"}
          </StatusBadge>
        </header>

        <dl className="lobby-card__stats">
          <div>
            <dt>Points</dt>
            <dd>{session?.participant?.totalPoints ?? 0}</dd>
          </div>
          <div>
            <dt>Victoires</dt>
            <dd>{session?.participant?.totalWins ?? 0}</dd>
          </div>
        </dl>

        {isError && <ErrorPanel error={error} onRetry={() => refetch()} title="État du salon indisponible" />}

        {lobbyInfo && (
          <div className="lobby-card__status">
            <StatusBadge tone={lobbyInfo.tone}>{lobbyInfo.label}</StatusBadge>
            {typeof lobby?.connectedCount === "number" && (
              <span>{lobby.connectedCount} participant{lobby.connectedCount > 1 ? "s" : ""} connecté{lobby.connectedCount > 1 ? "s" : ""}</span>
            )}
          </div>
        )}

        {lobby?.message && (
          <p className="lobby-card__message" role="status">
            {lobby.message}
          </p>
        )}

        {!isOnline && (
          <button type="button" className="btn btn--secondary" onClick={() => refetch()}>
            Se reconnecter
          </button>
        )}
      </div>

      <EmptyState
        title="Les activités arrivent bientôt"
        description="Cet espace accueillera les jeux, questions et votes dès leur ouverture par l'équipe d'animation."
        icon="🎉"
      />
    </div>
  );
}
