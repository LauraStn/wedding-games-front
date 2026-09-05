import { fetchTheme, type EventTheme } from "../theme/api";

export interface ScreenState {
  theme: EventTheme;
}

/**
 * Pas d'endpoint agrégé de projection côté backend pour l'instant (voir ASST-139) :
 * en attendant, seules les informations publiques de l'événement sont disponibles ici.
 */
export async function fetchScreenState(): Promise<ScreenState> {
  const theme = await fetchTheme();
  return { theme };
}
