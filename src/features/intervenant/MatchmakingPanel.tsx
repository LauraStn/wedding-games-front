"use client";

import { useLaunchMatchmaking, useTeams } from "./hooks";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { EmptyState } from "../../components/EmptyState";

export function MatchmakingPanel() {
  const teamsQuery = useTeams();
  const launch = useLaunchMatchmaking();

  const teams = teamsQuery.data ?? [];

  return (
    <div className="card">
      <header className="lobby-card__header">
        <h2>Équipes</h2>
        <button type="button" className="btn btn--primary" disabled={launch.isPending} onClick={() => launch.mutate()}>
          {launch.isPending ? "Lancement…" : teams.length > 0 ? "Relancer le matchmaking" : "Lancer le matchmaking"}
        </button>
      </header>

      {launch.isError && <ErrorPanel error={launch.error} title="Lancement impossible" />}

      {teamsQuery.isLoading && <LoadingScreen label="Chargement des équipes…" />}
      {teamsQuery.isError && <ErrorPanel error={teamsQuery.error} onRetry={() => teamsQuery.refetch()} />}
      {teamsQuery.data && teams.length === 0 && (
        <EmptyState title="Aucune équipe générée" description="Lancez le matchmaking pour former les équipes." />
      )}
      {teams.length > 0 && (
        <ul className="team-list">
          {teams.map((team) => (
            <li key={team.id} className="team-list__item">
              <strong>{team.label}</strong>
              <span>{(team.members ?? []).map((m) => m.displayName).join(", ")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
