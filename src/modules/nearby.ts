import { point, distance } from '@turf/turf';
import type { TangoEvent } from '../types/tango';

/**
 * Mode « Ce soir autour de moi » — radar local sans saisie de trajet.
 * Logique pure (testable) : géoloc, distance Turf.js, fenêtre temporelle.
 */

export const NEARBY_RADII = [15, 30, 50] as const;
export type NearbyRadius = (typeof NEARBY_RADII)[number];

/** Fenêtre « tout de suite » : aujourd'hui ou dans les 12 prochaines heures */
export const NEARBY_WINDOW_HOURS = 12;

export interface UserPosition {
  lat: number;
  lng: number;
}

export interface NearbyEvent extends TangoEvent {
  /** Distance à vol d'oiseau depuis la position de l'utilisateur */
  distanceKm: number;
}

/** Promesse autour de navigator.geolocation avec messages d'erreur FR. */
export function getCurrentPosition(): Promise<UserPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas disponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Autorisation refusée : active la localisation pour ce site dans ton navigateur.'
            : err.code === err.TIMEOUT
              ? 'Position introuvable (délai dépassé). Réessaie en extérieur ou avec le GPS activé.'
              : 'Impossible de récupérer ta position.';
        reject(new Error(msg));
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

/** Distance en km (arrondie à 0,1) entre deux points via Turf.js. */
export function distanceKm(from: UserPosition, to: UserPosition): number {
  const d = distance(point([from.lng, from.lat]), point([to.lng, to.lat]), { units: 'kilometers' });
  return Math.round(d * 10) / 10;
}

/** Début / fin réels d'un événement (fin le lendemain si endTime <= startTime). */
export function getEventWindow(evt: Pick<TangoEvent, 'date' | 'startTime' | 'endTime'>): { start: Date; end: Date } {
  const start = new Date(`${evt.date}T${evt.startTime}:00`);
  const end = new Date(`${evt.date}T${evt.endTime}:00`);
  if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
  return { start, end };
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Vrai si l'événement n'est pas fini et a lieu aujourd'hui ou démarre sous 12 h. */
export function isTonight(evt: TangoEvent, now: Date = new Date()): boolean {
  const { start, end } = getEventWindow(evt);
  if (end.getTime() <= now.getTime()) return false;
  const horizon = now.getTime() + NEARBY_WINDOW_HOURS * 3600_000;
  return sameDay(start, now) || start.getTime() <= horizon;
}

/** Ajoute `distanceKm` à chaque événement, trié du plus proche au plus lointain. */
export function withDistances(events: TangoEvent[], from: UserPosition): NearbyEvent[] {
  return events
    .map((e) => ({ ...e, distanceKm: distanceKm(from, { lat: e.lat, lng: e.lng }) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Événements de ce soir dans le rayon, triés par proximité. */
export function findTonightNearby(
  events: TangoEvent[],
  from: UserPosition,
  radiusKm: number,
  now: Date = new Date(),
): NearbyEvent[] {
  return withDistances(
    events.filter((e) => isTonight(e, now)),
    from,
  ).filter((e) => e.distanceKm <= radiusKm);
}

/** Horizon des « prochains événements » (jours à partir de la recherche) */
export const UPCOMING_DAYS = 7;

/** Date lisible FR, ex : « sam. 7 nov. » (ou « samedi 7 novembre 2026 » en long). */
export function formatEventDate(date: string, long = false): string {
  const d = new Date(`${date}T12:00:00`);
  return long
    ? d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Événements des 7 prochains jours (hors « ce soir ») dans le rayon, par date puis distance. */
export function findUpcomingNearby(
  events: TangoEvent[],
  from: UserPosition,
  radiusKm: number,
  now: Date = new Date(),
  days = UPCOMING_DAYS,
): NearbyEvent[] {
  const horizon = now.getTime() + days * 24 * 3600_000;
  return withDistances(
    events.filter((e) => {
      const { start, end } = getEventWindow(e);
      return end.getTime() > now.getTime() && start.getTime() <= horizon && !isTonight(e, now);
    }),
    from,
  )
    .filter((e) => e.distanceKm <= radiusKm)
    .sort(
      (a, b) =>
        getEventWindow(a).start.getTime() - getEventWindow(b).start.getTime() || a.distanceKm - b.distanceKm,
    );
}
