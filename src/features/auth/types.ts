import type { components } from "../../api/schema";

export type Role = components["schemas"]["Role"];
export type Session = components["schemas"]["Session"];
/** Réponse de résolution d'un jeton QR — flow réel, pas de champ `status`. */
export type InvitationResolvePreview = components["schemas"]["InvitationResolveResponse"];
/**
 * Réponse du flow "code de secours" — non supporté par le backend actuel,
 * conservée telle quelle en attendant une décision produit (voir le plan
 * "Réaligner l'auth sur le vrai backend").
 */
export type InvitationPreview = components["schemas"]["InvitationPreview"];
export type StaffLoginInput = components["schemas"]["StaffLoginRequest"];
export type StaffAccount = components["schemas"]["StaffAccountResponse"];
