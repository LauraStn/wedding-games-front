"use client";

import { RoleGuard } from "../../features/auth/RoleGuard";
import { useSession } from "../../features/auth/useSession";
import { LoadingScreen } from "../../components/LoadingScreen";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { useOnlineStatus } from "../../lib/useOnlineStatus";

function JuryContent() {
  const { session, isLoading } = useSession();
  const isOnline = useOnlineStatus();

  if (isLoading) {
    return <LoadingScreen label="Chargement…" />;
  }

  return (
    <div className="page page--centered">
      <div className="card">
        <header className="lobby-card__header">
          <div>
            <p className="lobby-card__eyebrow">Membre du jury</p>
            <h1>{session?.firstName} {session?.lastName}</h1>
          </div>
          <StatusBadge tone={isOnline ? "success" : "danger"}>
            {isOnline ? "Connecté" : "Hors connexion"}
          </StatusBadge>
        </header>
        <EmptyState
          title="En attente du lancement d'une activité"
          description="Aucune activité à juger pour le moment. Cet écran s'actualisera dès qu'une activité sera lancée."
          icon="⏳"
        />
      </div>
    </div>
  );
}

export default function JuryPage() {
  return (
    <RoleGuard allow={["JURY"]}>
      <JuryContent />
    </RoleGuard>
  );
}
