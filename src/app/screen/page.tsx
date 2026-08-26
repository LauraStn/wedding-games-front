"use client";

import { useQuery } from "@tanstack/react-query";
import { RoleGuard } from "../../features/auth/RoleGuard";
import { fetchScreenState } from "../../features/screen/api";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";

const LOBBY_LABELS: Record<string, string> = {
  CLOSED: "Le salon va bientôt ouvrir",
  OPEN: "Le salon est ouvert",
  LOCKED: "Le salon est verrouillé",
};

function ScreenContent() {
  const query = useQuery({
    queryKey: ["screen-state"],
    queryFn: fetchScreenState,
    refetchInterval: 15_000,
  });

  if (query.isPending) {
    return <LoadingScreen label="Chargement de l'écran…" />;
  }

  if (query.isError) {
    return (
      <div className="page page--centered">
        <ErrorPanel error={query.error} onRetry={() => query.refetch()} />
      </div>
    );
  }

  const { theme, lobby } = query.data;

  return (
    <div className="screen">
      <p className="screen__eyebrow">{theme.spouseNames.join(" & ")} · {new Date(theme.eventDate).toLocaleDateString("fr-FR")}</p>
      <h1 className="screen__title">{theme.eventTitle}</h1>
      <p className="screen__status">{LOBBY_LABELS[lobby.status] ?? lobby.status}</p>
      {typeof lobby.connectedCount === "number" && (
        <p className="screen__count">{lobby.connectedCount} participants connectés</p>
      )}
      <p className="screen__hint">Scannez le QR posé sur votre table pour rejoindre l&apos;expérience.</p>
    </div>
  );
}

export default function ScreenPage() {
  return (
    <RoleGuard allow={["PROJECTION"]}>
      <ScreenContent />
    </RoleGuard>
  );
}
