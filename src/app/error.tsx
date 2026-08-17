"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Ne jamais journaliser de jeton, de code d'invitation ou de donnée personnelle ici.
    console.error("Erreur applicative non gérée :", error.message);
  }, [error]);

  return (
    <div className="page page--centered">
      <div className="card">
        <h1>Une erreur inattendue est survenue</h1>
        <p>Désolé, quelque chose s&apos;est mal passé. Vous pouvez réessayer ou revenir à l&apos;accueil.</p>
        <div className="form__actions">
          <button type="button" className="btn btn--primary" onClick={reset}>
            Réessayer
          </button>
          <Link className="btn btn--secondary" href="/">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
