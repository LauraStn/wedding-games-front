"use client";

import { useStaffAccounts } from "../../../../features/admin/hooks";
import { LoadingScreen } from "../../../../components/LoadingScreen";
import { ErrorPanel } from "../../../../components/ErrorPanel";
import { EmptyState } from "../../../../components/EmptyState";
import { StatusBadge } from "../../../../components/StatusBadge";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  INTERVENANT: "Intervenant",
  JURY: "Jury",
  PROJECTION: "Écran",
};

export default function AdminRolesPage() {
  const staffQuery = useStaffAccounts();

  if (staffQuery.isLoading) return <LoadingScreen label="Chargement des comptes staff…" />;
  if (staffQuery.isError) {
    return <ErrorPanel error={staffQuery.error} onRetry={() => staffQuery.refetch()} />;
  }
  if (!staffQuery.data || staffQuery.data.length === 0) {
    return <EmptyState title="Aucun compte staff" />;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Identifiant</th>
          <th scope="col">Nom affiché</th>
          <th scope="col">Rôle</th>
          <th scope="col">État</th>
        </tr>
      </thead>
      <tbody>
        {staffQuery.data.map((account) => (
          <tr key={account.id}>
            <td>{account.username}</td>
            <td>{account.displayName}</td>
            <td>{ROLE_LABELS[account.role] ?? account.role}</td>
            <td>
              <StatusBadge tone={account.active ? "success" : "neutral"}>
                {account.active ? "Actif" : "Désactivé"}
              </StatusBadge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
