"use client";

import { useOnlineStatus } from "../lib/useOnlineStatus";

export function ConnectionBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="connection-banner" role="status" aria-live="assertive">
      Connexion perdue — tentative de reconnexion en cours…
    </div>
  );
}
