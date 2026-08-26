"use client";

import { useRoles } from "../../../../features/admin/hooks";
import { LoadingScreen } from "../../../../components/LoadingScreen";
import { ErrorPanel } from "../../../../components/ErrorPanel";
import { EmptyState } from "../../../../components/EmptyState";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  INTERVENANT: "Intervenant",
  JURY: "Jury",
  PARTICIPANT: "Participant",
  PROJECTION: "Écran",
};

export default function AdminRolesPage() {
  const rolesQuery = useRoles();

  if (rolesQuery.isLoading) return <LoadingScreen label="Chargement des rôles…" />;
  if (rolesQuery.isError) {
    return <ErrorPanel error={rolesQuery.error} onRetry={() => rolesQuery.refetch()} />;
  }
  if (!rolesQuery.data || rolesQuery.data.length === 0) {
    return <EmptyState title="Aucun rôle attribué" />;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Nom</th>
          <th scope="col">Rôle</th>
        </tr>
      </thead>
      <tbody>
        {rolesQuery.data.map((entry) => (
          <tr key={entry.participantId}>
            <td>{entry.firstName} {entry.lastName}</td>
            <td>{ROLE_LABELS[entry.role] ?? entry.role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
