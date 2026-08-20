import Link from "next/link";
import { WeddupMark } from "../../components/WeddupMark";

export default function DecouvrirPage() {
  return (
    <div className="page page--centered">
      <div className="card discover-card">
        <div className="discover-card__mark">
          <WeddupMark />
        </div>
        <h1>Weddup pour les organisateurs de mariage</h1>
        <p>
          Weddup anime la soirée de vos invités avec des jeux pensés pour créer des souvenirs :
          binômes surprise, défis, votes du jury… Cette page de présentation est en cours de
          préparation.
        </p>
        <p>
          En attendant, l&apos;équipe se tient à votre disposition pour vous en dire plus.
        </p>
        <div className="discover-card__actions">
          <Link href="/contact" className="btn btn--primary">
            Nous contacter
          </Link>
          <Link href="/" className="btn btn--secondary">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
