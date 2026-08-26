"use client";

import { useState } from "react";
import {
  useCreateParticipant,
  useDisableParticipant,
  useParticipants,
  useUpdateParticipant,
} from "../../../../features/admin/hooks";
import { ParticipantForm } from "../../../../features/admin/ParticipantForm";
import { InvitationPanel } from "../../../../features/admin/InvitationPanel";
import { LoadingScreen } from "../../../../components/LoadingScreen";
import { ErrorPanel } from "../../../../components/ErrorPanel";
import { EmptyState } from "../../../../components/EmptyState";
import { StatusBadge } from "../../../../components/StatusBadge";
import { readPref, writePref } from "../../../../lib/localPrefs";
import type { Participant, ParticipantInput } from "../../../../features/admin/types";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  INTERVENANT: "Intervenant",
  JURY: "Jury",
  PARTICIPANT: "Participant",
  PROJECTION: "Écran",
};

export default function AdminParticipantsPage() {
  const [search, setSearch] = useState(() => readPref("admin-participants-search-draft") ?? "");
  const [selected, setSelected] = useState<Participant | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const participantsQuery = useParticipants(search);
  const createParticipant = useCreateParticipant();
  const updateParticipant = useUpdateParticipant();
  const disableParticipant = useDisableParticipant();

  const onSearchChange = (value: string) => {
    setSearch(value);
    writePref("admin-participants-search-draft", value);
  };

  const onCreate = (input: ParticipantInput) => {
    createParticipant.mutate(input, { onSuccess: () => setShowCreate(false) });
  };

  const onUpdate = (input: ParticipantInput) => {
    if (!selected) return;
    updateParticipant.mutate({ id: selected.id, input });
  };

  return (
    <div className="admin-participants">
      <div className="admin-participants__list">
        <div className="admin-participants__toolbar">
          <label htmlFor="participant-search" className="visually-hidden">
            Rechercher un participant
          </label>
          <input
            id="participant-search"
            type="search"
            placeholder="Rechercher un participant…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setSelected(null);
              setShowCreate(true);
            }}
          >
            Ajouter un participant
          </button>
        </div>

        {participantsQuery.isLoading && <LoadingScreen label="Chargement des participants…" />}
        {participantsQuery.isError && (
          <ErrorPanel error={participantsQuery.error} onRetry={() => participantsQuery.refetch()} />
        )}
        {participantsQuery.data && participantsQuery.data.length === 0 && (
          <EmptyState title="Aucun participant trouvé" />
        )}

        {participantsQuery.data && participantsQuery.data.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col">Rôle</th>
                <th scope="col">État</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {participantsQuery.data.map((participant) => (
                <tr key={participant.id}>
                  <td>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        setSelected(participant);
                        setShowCreate(false);
                      }}
                    >
                      {participant.firstName} {participant.lastName}
                    </button>
                  </td>
                  <td>{ROLE_LABELS[participant.role] ?? participant.role}</td>
                  <td>
                    <StatusBadge tone={participant.active ? "success" : "neutral"}>
                      {participant.active ? "Actif" : "Désactivé"}
                    </StatusBadge>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--secondary btn--small"
                      disabled={!participant.active || disableParticipant.isPending}
                      onClick={() => disableParticipant.mutate(participant.id)}
                    >
                      Désactiver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-participants__detail">
        {showCreate && (
          <div className="card">
            <h2>Nouveau participant</h2>
            <ParticipantForm
              onSubmit={onCreate}
              isSubmitting={createParticipant.isPending}
              onCancel={() => setShowCreate(false)}
            />
            {createParticipant.isError && (
              <ErrorPanel error={createParticipant.error} title="Création impossible" />
            )}
          </div>
        )}

        {selected && !showCreate && (
          <div className="card">
            <h2>{selected.firstName} {selected.lastName}</h2>
            <ParticipantForm
              participant={selected}
              onSubmit={onUpdate}
              isSubmitting={updateParticipant.isPending}
            />
            {updateParticipant.isError && (
              <ErrorPanel error={updateParticipant.error} title="Modification impossible" />
            )}

            <h3>Invitation</h3>
            <InvitationPanel participantId={selected.id} />
          </div>
        )}

        {!selected && !showCreate && (
          <EmptyState
            title="Sélectionnez un participant"
            description="Choisissez un participant dans la liste pour voir ou modifier ses informations et son invitation."
          />
        )}
      </div>
    </div>
  );
}
