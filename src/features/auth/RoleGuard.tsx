"use client";

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { useSession } from "./useSession";
import type { Role } from "./types";

interface RoleGuardProps {
  allow: Role[];
  children: ReactNode;
}

/** Protège une route selon le rôle retourné par le backend (session côté serveur, source de vérité). */
export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { session, isLoading, isAnonymous, isExpired, isUnexpectedError, error, refetch } = useSession();

  if (isLoading) {
    return <LoadingScreen label="Vérification de votre accès…" />;
  }

  if (isUnexpectedError) {
    return (
      <div className="page page--centered">
        <ErrorPanel error={error} onRetry={() => refetch()} title="Impossible de vérifier votre accès" />
      </div>
    );
  }

  if (isExpired) {
    redirect("/?reason=session-expired");
    return null;
  }

  if (isAnonymous || session === null) {
    redirect("/");
    return null;
  }

  if (!session.role || !allow.includes(session.role)) {
    redirect("/unauthorized");
    return null;
  }

  return <>{children}</>;
}
