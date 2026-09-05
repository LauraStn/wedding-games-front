"use client";

import { useMyTeam } from "./useMyTeam";
import { ApiError } from "../../api/errors";
import { LoadingScreen } from "../../components/LoadingScreen";
import { ErrorPanel } from "../../components/ErrorPanel";
import { EmptyState } from "../../components/EmptyState";

/**
 * Le partenaire est présenté par son personnage, jamais par son prénom réel : le jeu consiste
 * à le retrouver dans la salle en cherchant qui porte quel costume, pas à lire son nom ici.
 */
export function TeamReveal() {
  const query = useMyTeam();

  if (query.isLoading) {
    return <LoadingScreen label="Chargement de ton équipe…" />;
  }

  if (query.isError) {
    const isNotFormedYet = query.error instanceof ApiError && query.error.kind === "not-found";
    if (isNotFormedYet) {
      return (
        <EmptyState
          title="Les activités arrivent bientôt"
          description="Ton équipe et ton personnage apparaîtront ici dès leur formation par l'équipe d'animation."
          icon="🎉"
        />
      );
    }
    return <ErrorPanel error={query.error} onRetry={() => query.refetch()} title="Équipe indisponible" />;
  }

  const team = query.data;
  if (!team) return null;
  const partners = team.partners ?? [];

  return (
    <div className="card team-reveal">
      <p className="lobby-card__eyebrow">Tu es</p>
      <div className="team-reveal__character">
        {team.myCharacterAvatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- avatar fourni par l'admin, non optimisable
          <img src={team.myCharacterAvatarUrl} alt="" className="team-reveal__avatar" />
        )}
        <h2>{team.myCharacterName}</h2>
      </div>
      {team.myCharacterDescription && <p>{team.myCharacterDescription}</p>}

      {partners.length > 0 && (
        <>
          <p className="lobby-card__eyebrow">
            {partners.length > 1 ? "Tes binômes à retrouver" : "Ton binôme à retrouver"}
          </p>
          <ul className="team-reveal__partners">
            {partners.map((partner) => (
              <li key={partner.participantId} className="team-reveal__character">
                {partner.characterAvatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar fourni par l'admin, non optimisable
                  <img src={partner.characterAvatarUrl} alt="" className="team-reveal__avatar" />
                )}
                <strong>{partner.characterName}</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
