"use client";

import { useAdminLobby } from "../../../../features/admin/hooks";
import { LoadingScreen } from "../../../../components/LoadingScreen";
import { ErrorPanel } from "../../../../components/ErrorPanel";
import { StatusBadge } from "../../../../components/StatusBadge";

const LOBBY_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "warning" }> = {
  CLOSED: { label: "Fermé", tone: "neutral" },
  OPEN: { label: "Ouvert", tone: "success" },
  LOCKED: { label: "Verrouillé", tone: "warning" },
};

export default function AdminLobbyPage() {
  const lobbyQuery = useAdminLobby();

  if (lobbyQuery.isLoading) return <LoadingScreen label="Chargement du salon…" />;
  if (lobbyQuery.isError) {
    return <ErrorPanel error={lobbyQuery.error} onRetry={() => lobbyQuery.refetch()} />;
  }

  const lobby = lobbyQuery.data;
  const status = lobby ? LOBBY_LABELS[lobby.status] : undefined;

  return (
    <div className="card">
      <p>
        L&apos;ouverture, la fermeture et le verrouillage du salon sont pilotés depuis l&apos;espace
        intervenant. Cette page est en lecture seule.
      </p>
      {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
      {typeof lobby?.connectedCount === "number" && (
        <p>{lobby.connectedCount} participant{lobby.connectedCount > 1 ? "s" : ""} connecté{lobby.connectedCount > 1 ? "s" : ""}</p>
      )}
      {lobby?.message && <p>{lobby.message}</p>}
    </div>
  );
}
