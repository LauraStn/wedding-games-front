import type { Role } from "./types";

/** Page d'accueil de chaque rôle après confirmation d'identité. */
export const ROLE_HOME: Record<Role, string> = {
  PARTICIPANT: "/lobby",
  ADMIN: "/admin",
  INTERVENANT: "/intervenant",
  JURY: "/jury",
  PROJECTION: "/screen",
};
