"use client";

import { useState } from "react";
import { useAwardScore, usePodium, useTeams } from "./hooks";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { EmptyState } from "../../components/EmptyState";

export function ScorePanel() {
  const teamsQuery = useTeams();
  const podiumQuery = usePodium();
  const award = useAwardScore();
  const teams = teamsQuery.data ?? [];
  const [teamId, setTeamId] = useState("");
  const [points, setPoints] = useState(1);
  const [reason, setReason] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!teamId) return;
    award.mutate(
      { teamId, points, reason: reason.trim() || undefined },
      { onSuccess: () => setReason("") },
    );
  };

  return (
    <div className="card">
      <h2>Points &amp; podium</h2>

      <form className="form" onSubmit={onSubmit} noValidate>
        <label htmlFor="score-team">Équipe</label>
        <select id="score-team" value={teamId} onChange={(event) => setTeamId(event.target.value)}>
          <option value="">Choisir…</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.label}
            </option>
          ))}
        </select>

        <label htmlFor="score-points">Points (négatif pour retirer)</label>
        <input
          id="score-points"
          type="number"
          value={points}
          onChange={(event) => setPoints(Number(event.target.value))}
        />

        <label htmlFor="score-reason">Motif (optionnel)</label>
        <input id="score-reason" value={reason} onChange={(event) => setReason(event.target.value)} />

        <div className="form__actions">
          <button type="submit" className="btn btn--primary" disabled={!teamId || award.isPending}>
            {award.isPending ? "Attribution…" : "Attribuer"}
          </button>
        </div>
      </form>
      {award.isError && <ErrorPanel error={award.error} title="Attribution impossible" />}

      <h3>Podium</h3>
      {podiumQuery.isLoading && <LoadingScreen label="Chargement du podium…" />}
      {podiumQuery.isError && <ErrorPanel error={podiumQuery.error} onRetry={() => podiumQuery.refetch()} />}
      {podiumQuery.data && podiumQuery.data.length === 0 && <EmptyState title="Aucun point attribué pour le moment" />}
      {podiumQuery.data && podiumQuery.data.length > 0 && (
        <ol className="finalist-list">
          {podiumQuery.data.map((entry) => (
            <li key={entry.teamId}>
              #{entry.rank} — {entry.teamLabel} : {entry.totalPoints} pt{entry.totalPoints !== 1 ? "s" : ""}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
