"use client";

import { useState } from "react";
import {
  useActivateCharacter,
  useCharacters,
  useCreateCharacter,
  useDeactivateCharacter,
  useDeleteCharacter,
  useUpdateCharacter,
} from "../../../../features/admin/hooks";
import { CharacterForm } from "../../../../features/admin/CharacterForm";
import { LoadingScreen } from "../../../../components/LoadingScreen";
import { ErrorPanel } from "../../../../components/ErrorPanel";
import { EmptyState } from "../../../../components/EmptyState";
import { StatusBadge } from "../../../../components/StatusBadge";
import type {
  GameCharacter,
  GameCharacterCreateInput,
  GameCharacterUpdateInput,
} from "../../../../features/admin/types";

const GENDER_LABELS: Record<string, string> = {
  MALE: "Masculin",
  FEMALE: "Féminin",
};

export default function AdminCharactersPage() {
  const [selected, setSelected] = useState<GameCharacter | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const charactersQuery = useCharacters();
  const createCharacter = useCreateCharacter();
  const updateCharacter = useUpdateCharacter();
  const activateCharacter = useActivateCharacter();
  const deactivateCharacter = useDeactivateCharacter();
  const deleteCharacter = useDeleteCharacter();

  const onCreate = (input: GameCharacterCreateInput | GameCharacterUpdateInput) => {
    createCharacter.mutate(input as GameCharacterCreateInput, { onSuccess: () => setShowCreate(false) });
  };

  const onUpdate = (input: GameCharacterCreateInput | GameCharacterUpdateInput) => {
    if (!selected?.id) return;
    updateCharacter.mutate(
      { id: selected.id, input: input as GameCharacterUpdateInput },
      { onSuccess: (character) => setSelected(character) },
    );
  };

  return (
    <div className="admin-participants">
      <div className="admin-participants__list">
        <div className="admin-participants__toolbar">
          <h2>Personnages</h2>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setSelected(null);
              setShowCreate(true);
            }}
          >
            Ajouter un personnage
          </button>
        </div>

        {charactersQuery.isLoading && <LoadingScreen label="Chargement des personnages…" />}
        {charactersQuery.isError && (
          <ErrorPanel error={charactersQuery.error} onRetry={() => charactersQuery.refetch()} />
        )}
        {charactersQuery.data && charactersQuery.data.length === 0 && (
          <EmptyState title="Aucun personnage dans le catalogue" />
        )}

        {charactersQuery.data && charactersQuery.data.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col">Genre</th>
                <th scope="col">État</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {charactersQuery.data.map((character) => (
                <tr key={character.id}>
                  <td>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        setSelected(character);
                        setShowCreate(false);
                      }}
                    >
                      {character.name}
                    </button>
                  </td>
                  <td>{(character.gender && GENDER_LABELS[character.gender]) ?? "—"}</td>
                  <td>
                    <StatusBadge tone={character.active ? "success" : "neutral"}>
                      {character.active ? "Actif" : "Désactivé"}
                    </StatusBadge>
                  </td>
                  <td>
                    <div className="form__actions">
                      <button
                        type="button"
                        className="btn btn--secondary btn--small"
                        disabled={!character.id || activateCharacter.isPending || deactivateCharacter.isPending}
                        onClick={() =>
                          character.id &&
                          (character.active
                            ? deactivateCharacter.mutate(character.id)
                            : activateCharacter.mutate(character.id))
                        }
                      >
                        {character.active ? "Désactiver" : "Activer"}
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary btn--small"
                        disabled={!character.id || deleteCharacter.isPending}
                        onClick={() =>
                          character.id &&
                          deleteCharacter.mutate(character.id, {
                            onSuccess: () => setSelected((current) => (current?.id === character.id ? null : current)),
                          })
                        }
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {(activateCharacter.isError || deactivateCharacter.isError || deleteCharacter.isError) && (
          <ErrorPanel
            error={activateCharacter.error ?? deactivateCharacter.error ?? deleteCharacter.error}
            title="Action impossible"
          />
        )}
      </div>

      <div className="admin-participants__detail">
        {showCreate && (
          <div className="card">
            <h2>Nouveau personnage</h2>
            <CharacterForm onSubmit={onCreate} isSubmitting={createCharacter.isPending} onCancel={() => setShowCreate(false)} />
            {createCharacter.isError && <ErrorPanel error={createCharacter.error} title="Création impossible" />}
          </div>
        )}

        {selected && !showCreate && (
          <div className="card">
            <h2>{selected.name}</h2>
            <CharacterForm character={selected} onSubmit={onUpdate} isSubmitting={updateCharacter.isPending} />
            {updateCharacter.isError && <ErrorPanel error={updateCharacter.error} title="Modification impossible" />}
          </div>
        )}

        {!selected && !showCreate && (
          <EmptyState
            title="Sélectionnez un personnage"
            description="Choisissez un personnage dans la liste pour le modifier, ou ajoutez-en un nouveau."
          />
        )}
      </div>
    </div>
  );
}
