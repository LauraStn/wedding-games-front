import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page page--centered">
      <div className="card">
        <h1>Page introuvable</h1>
        <p>Cette page n&apos;existe pas ou plus.</p>
        <Link href="/" className="btn btn--secondary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
