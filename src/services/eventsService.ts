import type { TangoEvent } from '../types/tango';

/**
 * Chargement du jeu d'événements réel (données scrapées) à l'exécution.
 * Fichier généré par `npm run build:events` → public/data/events.json
 * (hors bundle JS : 20 Mo ne doivent pas bloquer le démarrage de la PWA).
 */

const todayIso = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

let cache: Promise<TangoEvent[]> | null = null;

export function loadEvents(): Promise<TangoEvent[]> {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}data/events.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`events.json : HTTP ${r.status}`);
        return r.json() as Promise<TangoEvent[]>;
      })
      .then((list) => {
        const today = todayIso();
        // Le fichier peut dater de quelques jours : on écarte à nouveau le passé
        return list.filter((e) => e.date >= today);
      })
      .catch((err) => {
        cache = null; // permet de réessayer
        throw err;
      });
  }
  return cache;
}

/** Événements d'un jour donné (YYYY-MM-DD). */
export const eventsOnDate = (events: TangoEvent[], date: string): TangoEvent[] =>
  events.filter((e) => e.date === date);
