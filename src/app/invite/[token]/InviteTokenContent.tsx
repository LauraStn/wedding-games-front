"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { resolveInvitation } from "../../../features/auth/api";
import { useConfirmInvitation } from "../../../features/auth/mutations";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { ErrorPanel } from "../../../components/ErrorPanel";

export function InviteTokenContent({ token }: { token: string }) {
  const router = useRouter();
  const confirm = useConfirmInvitation();

  const query = useQuery({
    queryKey: ["invitation-resolve", token],
    queryFn: () => resolveInvitation(token),
    retry: false,
  });

  if (query.isPending) {
    return <LoadingScreen label="Vérification de votre invitation…" />;
  }

  if (query.isError) {
    return (
      <div className="page page--centered">
        <div className="card">
          <ErrorPanel
            error={query.error}
            onRetry={() => query.refetch()}
            title="Invitation invalide"
          />
        </div>
      </div>
    );
  }

  const preview = query.data;

  const onConfirm = () => {
    confirm.mutate(token, { onSuccess: () => router.replace("/lobby") });
  };

  return (
    <div className="page page--centered">
      <div className="card identity-confirm">
        <p>
          Bienvenue <strong>{preview.displayName}</strong>. Confirmez-vous votre
          identité ?
        </p>
        <div className="identity-confirm__actions">
          <button type="button" className="btn btn--primary" onClick={onConfirm} disabled={confirm.isPending}>
            {confirm.isPending ? "Confirmation…" : "C’est bien moi"}
          </button>
        </div>
        {confirm.isError && <ErrorPanel error={confirm.error} title="Confirmation impossible" />}
      </div>
    </div>
  );
}
