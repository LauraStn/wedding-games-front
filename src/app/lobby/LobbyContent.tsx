"use client";

import { useSession } from "../../features/auth/useSession";
import { useLobby } from "../../features/lobby/useLobby";
import { TeamReveal } from "../../features/team/TeamReveal";
import { WhoSaidItProposalForm } from "../../features/whoSaidIt/WhoSaidItProposalForm";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { StatusBadge } from "../../components/StatusBadge";
import { useOnlineStatus } from "../../lib/useOnlineStatus";

const LOBBY_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "warning" }> = {
  CLOSED: { label: "Salon fermé", tone: "neutral" },
  OPEN: { label: "Salon ouvert", tone: "success" },
  LOCKED: { label: "Salon verrouillé", tone: "warning" },
  ACTIVE: { label: "Activité en cours", tone: "success" },
  PAUSED: { label: "Activité en pause", tone: "warning" },
  FINISHED: { label: "Soirée terminée", tone: "neutral" },
};

export function ParticipantLobbyContent() {
  const { session, isLoading: sessionLoading } = useSession();
  const { lobby, isLoading: lobbyLoading, isError, error, refetch } = useLobby();
  const isOnline = useOnlineStatus();

  if (sessionLoading || lobbyLoading) {
    return <LoadingScreen label="Chargement du salon…" />;
  }

  const lobbyInfo = lobby?.status ? LOBBY_LABELS[lobby.status] : undefined;

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
            {typeof lobby?.presentCount === "number" && (
              <span>{lobby.presentCount} participant{lobby.presentCount > 1 ? "s" : ""} connecté{lobby.presentCount > 1 ? "s" : ""}</span>
            )}
          </div>
        )}

        {lobby?.welcomeMessage && (
          <p className="lobby-card__message" role="status">
            {lobby.welcomeMessage}
          </p>
        )}

        {!isOnline && (
          <button type="button" className="btn btn--secondary" onClick={() => refetch()}>
            Se reconnecter
          </button>
        )}
      </div>

      <TeamReveal />
      {lobby?.status === "OPEN" && <WhoSaidItProposalForm />}
    </div>
  );
}
