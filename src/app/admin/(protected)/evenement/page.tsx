"use client";

import { useEventConfig, useUpdateEventConfig } from "../../../../features/admin/hooks";
import { EventConfigForm } from "../../../../features/admin/EventConfigForm";
import { LoadingScreen } from "../../../../components/LoadingScreen";
import { ErrorPanel } from "../../../../components/ErrorPanel";
import type { EventConfigInput } from "../../../../features/admin/types";

export default function AdminEventPage() {
  const configQuery = useEventConfig();
  const updateConfig = useUpdateEventConfig();

  const onSubmit = (input: EventConfigInput) => {
    updateConfig.mutate(input);
  };

  return (
    <div className="card">
      <h2>Configuration de l&apos;événement</h2>
      <p>
        Noms des mariés, date, lieu, thème et textes d&apos;accueil : ces informations personnalisent
        l&apos;application, sans toucher au code.
      </p>

      {configQuery.isLoading && <LoadingScreen label="Chargement de la configuration…" />}
      {configQuery.isError && (
        <ErrorPanel error={configQuery.error} onRetry={() => configQuery.refetch()} />
      )}

      {configQuery.data && (
        <EventConfigForm
          config={configQuery.data}
          onSubmit={onSubmit}
          isSubmitting={updateConfig.isPending}
        />
      )}

      {updateConfig.isError && <ErrorPanel error={updateConfig.error} title="Enregistrement impossible" />}
      {updateConfig.isSuccess && (
        <p className="form__success" role="status">
          Configuration enregistrée.
        </p>
      )}
    </div>
  );
}
