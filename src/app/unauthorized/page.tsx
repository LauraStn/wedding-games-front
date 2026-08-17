import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="page page--centered">
      <div className="card">
        <h1>Accès refusé</h1>
        <p>Votre rôle ne permet pas d&apos;accéder à cette page.</p>
        <Link href="/" className="btn btn--secondary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
