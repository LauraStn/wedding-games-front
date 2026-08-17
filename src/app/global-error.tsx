"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body>
        <div className="page page--centered">
          <div className="card">
            <h1>Une erreur inattendue est survenue</h1>
            <p>L&apos;application n&apos;a pas pu démarrer correctement.</p>
            <button type="button" className="btn btn--primary" onClick={reset}>
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
