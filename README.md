# Jeux de mariage — Frontend

Frontend Next.js (App Router) / TypeScript de l'application privée d'animations
de mariage. Ce dépôt est **totalement indépendant** du backend Spring Boot
(dépôt `games-app-back`) : aucune classe Java, migration ou logique de base de
données n'est présente ici. Toute communication avec le backend passe par
l'API HTTP décrite dans `openapi/wedding-games.yaml`.

## Périmètre de cette phase

Cette première phase construit uniquement le **socle** de l'application :
navigation, identification (QR / code de secours), salon, administration,
pilotage intervenant, jury et écran de projection.

**Volontairement absents de cette phase** (espaces "bientôt disponible", sans
aucune donnée simulée) : jeux, questions, réponses, votes, binômes,
personnages, matchmaking, podiums.

## Pourquoi Next.js, et comment il est utilisé ici

L'application est rendue **côté client** (chaque page interactive est un
Client Component "use client"). Ce choix est volontaire : le backend est sur
une origine différente du frontend, l'authentification repose sur un cookie
de session backend, et faire du SSR authentifié impliquerait de relayer ce
cookie et de gérer le CORS entre les deux origines — hors périmètre de cette
phase. Next.js apporte malgré tout des bénéfices concrets, exploités ici :

- routage par fichiers (`src/app/**/page.tsx`) et layouts imbriqués (ex.
  `src/app/admin/layout.tsx` pour la navigation par onglets) ;
- boundaries d'erreur natives (`error.tsx`, `global-error.tsx`, `not-found.tsx`) ;
- génération du manifest PWA côté serveur (`src/app/manifest.ts`), qui peut
  interroger l'endpoint public `/theme` du backend sans transmettre de cookie ;
- convention d'icône (`src/app/icon.svg`).

Une évolution future vers du rendu serveur authentifié (RSC + relais de
cookie) est possible mais nécessite d'abord de clarifier le CORS/la politique
de cookies côté backend.

## Architecture

```
src/
  api/            Client HTTP généré depuis le contrat OpenAPI (schema.d.ts, client.ts, errors.ts)
  app/            Routes Next.js (App Router)
    layout.tsx, providers.tsx, error.tsx, global-error.tsx, not-found.tsx
    manifest.ts   Génération du manifest PWA (peut lire /theme, public, côté serveur)
    sw.ts         Source du service worker (Serwist)
    page.tsx                Accueil
    join/[token]/            Résolution du QR personnel
    lobby/                   Salon participant
    admin/                   Administration (layout à onglets + sous-routes)
    intervenant/, jury/, screen/, unauthorized/
  components/     Composants d'UI partagés (états de chargement, erreurs, badges…)
  features/
    auth/         Session, résolution/confirmation d'invitation, garde de rôle (RoleGuard)
    theme/        Configuration visuelle/textuelle de l'événement (fournie par le backend)
    lobby/        Salon participant (hooks/API)
    intervenant/  Pilotage du salon (hooks/API)
    admin/        Participants, invitations, exclusions, rôles (hooks/API + composants)
    screen/       État public pour l'écran de projection
  lib/            Utilitaires (statut réseau, préférences locales non sensibles)
  styles/         CSS global + composants (variables de thème, mobile-first)
  test/           Configuration Vitest, utilitaires de rendu pour les tests
openapi/
  wedding-games.yaml   Contrat OpenAPI (voir "Génération du client OpenAPI" ci-dessous)
```

Les composants de contenu interactifs (formulaires, requêtes, etc.) vivent en
dehors des fichiers `page.tsx`/`layout.tsx` eux-mêmes (ex.
`join/[token]/JoinTokenContent.tsx`, `lobby/LobbyContent.tsx`) : Next.js
n'autorise que certains exports nommés précis dans un fichier `page.tsx`, ce
qui rendrait ces fichiers impossibles à tester unitairement s'ils exportaient
aussi leurs composants de contenu.

### Séparation frontend/backend

Le backend est la **source de vérité** pour les participants, invitations,
sessions, rôles, exclusions, l'état du salon, les points et les victoires.
Rien de tout cela n'est jamais stocké dans `localStorage`/`sessionStorage` :
chaque page relit ces informations depuis l'API (via TanStack Query) au
chargement et après reconnexion. Le stockage navigateur (`src/lib/localPrefs.ts`)
ne contient que des préférences visuelles ou des brouillons non sensibles (ex.
le brouillon de recherche de l'écran admin participants) — voir le test
`src/app/lobby/LobbyContent.test.tsx` qui vérifie l'absence de données
personnelles dans `localStorage`.

Toutes les requêtes authentifiées transmettent les cookies de session
(`credentials: "include"`, configuré une fois dans `src/api/client.ts`).

## Installation

Prérequis : Node.js 20+.

```bash
npm install
cp .env.example .env.local
# éditer .env.local si le backend ne tourne pas sur http://localhost:8080
npm run dev
```

## Variables d'environnement

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | URL de base du backend (ex. `http://localhost:8080`). Requise : l'application refuse de démarrer sans elle. Préfixe `NEXT_PUBLIC_` obligatoire (convention Next.js) pour être lisible côté client. |

Le contenu affiché *dans* l'application (titre de l'événement, noms des
mariés, date, logo, textes d'accueil, couleurs) provient exclusivement de
`GET /api/theme` et n'est jamais codé en dur dans les composants.

## Génération du client OpenAPI

**Important — contrat provisoire.** Au moment de la rédaction, le dépôt
backend (`games-app-back`) est vide : aucun contrat OpenAPI officiel n'existe
encore. Le fichier `openapi/wedding-games.yaml` a donc été écrit côté
frontend, à partir des besoins fonctionnels de cette phase, pour pouvoir
générer un client typé sans recopier de DTO à la main. **Il devra être
remplacé par le contrat exposé par le backend dès qu'il sera disponible**
(généralement via `/v3/api-docs.yaml` ou un fichier versionné côté backend).

Régénérer les types après toute modification du contrat :

```bash
npm run api:generate
```

Cela régénère `src/api/schema.d.ts` à partir de `openapi/wedding-games.yaml`.
Le client HTTP typé (`src/api/client.ts`, basé sur `openapi-fetch`) et les
fonctions d'appel (`src/features/*/api.ts`) n'ont pas besoin d'être modifiés
tant que les noms d'opérations (`operationId`) et les schémas restent stables.

Pour pointer vers le vrai contrat backend :

1. Remplacer `openapi/wedding-games.yaml` par le fichier généré par le
   backend (ou changer la cible de `api:generate` pour pointer vers son URL,
   ex. `openapi-typescript http://localhost:8080/v3/api-docs.yaml -o src/api/schema.d.ts`).
2. Relancer `npm run api:generate`.
3. Corriger les erreurs de typage éventuelles dans `src/features/*/api.ts`
   (renommage de champs, changements de forme des réponses, etc.).

## Lancement local

```bash
npm run dev        # serveur de développement (webpack — voir note PWA ci-dessous)
npm run build       # build de production
npm run start        # sert le build de production
npm run typecheck   # vérification TypeScript (app + service worker)
```

**Note bundler.** Next 16 utilise Turbopack par défaut, mais Serwist (PWA)
n'est pas encore compatible avec Turbopack ; `dev`/`build` utilisent donc
explicitement `--webpack`. Cette limitation est suivie par le projet Serwist
(voir le lien affiché si vous lancez `next dev`/`next build` sans ce flag).

## Tests

```bash
npm run test        # exécution unique (CI)
npm run test:watch  # mode watch
```

Les tests utilisent Vitest + React Testing Library (config dans
`vitest.config.mts`, séparée de `next.config.ts` car Next et Vitest ont des
pipelines de build distincts). Les appels réseau sont simulés en mockant les
fonctions de `src/features/*/api.ts` (pas de dépendance à un backend réel).
Les hooks `next/navigation` (`useRouter`, `redirect`, `useParams`) sont
mockés par test file avec `vi.mock("next/navigation", ...)`.

Couverture notamment :

- résolution d'un QR valide et affichage de l'identité reconnue ;
- affichage d'une invitation invalide ;
- confirmation de l'identité et redirection vers le salon ;
- restauration d'une session existante après rechargement ;
- protection des routes selon le rôle renvoyé par le backend (`RoleGuard`),
  y compris le refus d'accès admin pour un rôle intervenant ;
- affichage et signalement des exclusions absolues (à partir de données
  d'API, jamais d'un tableau codé en React) ;
- comportement du salon participant sur un viewport mobile ;
- état hors connexion (bannière globale + salon participant) ;
- absence de donnée sensible (identité, points, jeton) dans le stockage
  navigateur.

## Communication avec le backend

- Toutes les requêtes passent par `src/api/client.ts` (`openapi-fetch`),
  configuré avec `credentials: "include"` pour transmettre le cookie de
  session sur chaque appel authentifié.
- Les erreurs sont normalisées par `src/api/errors.ts` en une `ApiError`
  typée (`validation`, `unauthorized`, `forbidden`, `not-found`, `conflict`,
  `offline`, `server`, `unknown`), avec des messages par défaut en français,
  affichés via `src/components/ErrorPanel.tsx`.
- Les jetons d'invitation et codes de secours ne sont **jamais** journalisés
  ni interpolés dans un message d'erreur : seuls les messages renvoyés par le
  backend (ou des messages génériques) sont affichés.
- `TanStack Query` gère le cache, les tentatives (uniquement pour les erreurs
  réseau/serveur, pas pour les 401/403/404) et le rafraîchissement au retour
  de focus, pour supporter la reconnexion après perte de réseau. Le
  `QueryClient` est instancié une fois par montage (`useState` dans
  `src/app/providers.tsx`), pas en singleton de module, pour rester
  compatible avec un futur rendu serveur (éviter le partage de cache entre
  requêtes/utilisateurs).

## Politique de cache PWA

- L'installation est facultative (pas d'invite forcée).
- Le service worker (`src/app/sw.ts`, Serwist) précache **uniquement le
  shell statique** listé dans `self.__SW_MANIFEST` (JS/CSS/icônes générés par
  Next) plus `public/offline.html`. `runtimeCaching` est explicitement vide :
  aucune règle ne cible les appels vers `NEXT_PUBLIC_API_BASE_URL` (autre
  origine que le frontend), donc aucune réponse API, jeton ou donnée
  personnelle n'est jamais interceptée ni mise en cache par le service
  worker.
- `public/offline.html` est précaché et servi comme page de secours pour
  toute navigation qui échoue hors connexion (`fallbacks.entries` dans
  `src/app/sw.ts`).
- `src/app/icon.svg` est un **placeholder temporaire** (explicitement marqué
  "TEMPORAIRE" dans le SVG) à remplacer par les visuels définitifs des
  mariés.
- Le nom, les couleurs et le titre affichés dans l'application viennent de
  `/api/theme` (backend). Le *manifest* PWA (`src/app/manifest.ts`), lui, est
  généré **côté serveur à chaque requête** et interroge directement
  `/api/theme` (endpoint public, sans cookie) pour reprendre le titre et les
  couleurs de l'événement, avec un repli sur des valeurs neutres si le
  backend est injoignable — pas de configuration statique à maintenir.

## Fonctionnalités volontairement reportées

- Jeux, questions, réponses, votes, binômes, personnages, matchmaking,
  podiums (tout ce qui touche au déroulé des animations elles-mêmes).
- Ajout manuel d'un invité en retard depuis l'espace intervenant : le bouton
  est présent mais désactivé, en attente de l'endpoint backend correspondant.
- Authentification propre aux rôles ADMIN / INTERVENANT / JURY / SCREEN : le
  contrat provisoire suppose que le backend établit la session (cookie) par un
  mécanisme qui lui est propre (ex. formulaire de connexion côté backend) ;
  le frontend se contente de lire le rôle via `GET /api/session` et de
  protéger les routes en conséquence. À confirmer avec l'équipe backend.
- Rendu serveur authentifié (voir "Pourquoi Next.js" ci-dessus) : nécessite
  de clarifier d'abord le CORS et la politique de cookies côté backend.
- Migration de Serwist vers `@serwist/turbopack` une fois cette intégration
  stabilisée, pour pouvoir utiliser Turbopack en dev/build sans le flag
  `--webpack`.

## Endpoints backend attendus mais non confirmés

Le contrat `openapi/wedding-games.yaml` liste l'ensemble des endpoints
attendus par cette phase. Voir aussi la section "Génération du client
OpenAPI" : **tant que le backend n'expose pas son propre contrat, ces
endpoints sont des hypothèses de travail**, en particulier :

- `POST /invitations/resolve`, `POST /invitations/confirm`,
  `POST /invitations/fallback` — flux d'identification (QR + code de secours).
- `GET /session`, `DELETE /session` — session courante, avec un code d'erreur
  `SESSION_EXPIRED` optionnel pour distinguer une session expirée d'une
  simple absence de session.
- `GET /lobby`, `GET /screen/state` — état du salon côté participant / écran.
- `GET/POST/PATCH /admin/participants`, `.../disable`,
  `.../invitation`, `.../invitation/generate`, `.../invitation/regenerate`,
  `.../invitation/qr` — gestion des participants et de leurs invitations.
- `GET/POST /admin/exclusions`, `DELETE /admin/exclusions/{id}` — la
  suppression d'une exclusion absolue doit être refusée par le backend
  (403) ; le frontend ne fait que relayer cette contrainte, il ne la
  réimplémente pas.
- `GET /admin/roles`, `GET /admin/lobby`.
- `GET /intervenant/lobby`, `POST /intervenant/lobby/{open,close,lock}`,
  `GET /intervenant/arrivals/recent`, `GET /intervenant/arrivals/late`.
- `GET /theme` — configuration visuelle/textuelle de l'événement (endpoint
  public, appelé aussi côté serveur par `src/app/manifest.ts`).

À confirmer/ajuster avec l'équipe backend : le endpoint permettant l'ajout
manuel d'un invité en retard (mentionné dans les spécifications comme "à
venir") n'a pas d'équivalent dans le contrat provisoire.
