import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Cache uniquement le shell statique (JS/CSS/icônes précompilés par Next,
 * listés dans __SW_MANIFEST). Volontairement AUCUNE règle `runtimeCaching` :
 * les appels vers NEXT_PUBLIC_API_BASE_URL (autre origine que le frontend)
 * ne sont donc jamais interceptés ni mis en cache par le service worker —
 * aucune réponse API, jeton ou donnée personnelle ne peut y transiter.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [],
  fallbacks: {
    entries: [
      {
        url: "/offline.html",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
