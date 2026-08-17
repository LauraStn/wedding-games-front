/**
 * Stockage navigateur : uniquement des préférences visuelles / UX locales,
 * jamais une source de vérité (participants, sessions, rôles, points...).
 * Voir README, section "Séparation frontend/backend".
 */

const PREFIX = "wga:pref:";

type PrefKey = "install-prompt-dismissed" | "admin-participants-search-draft";

export function readPref(key: PrefKey): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writePref(key: PrefKey, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    // Stockage indisponible (mode privé, quota) : dégrader silencieusement.
  }
}

export function clearPref(key: PrefKey): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
