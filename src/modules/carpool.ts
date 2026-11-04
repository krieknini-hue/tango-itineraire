import { useSyncExternalStore } from 'react';
import type { DanceRole } from '../types/tango';

/**
 * Covoit' Milonga — annonces directes, zéro intermédiaire, zéro paiement in-app.
 * Stockage localStorage (démo) derrière l'interface `CarpoolRepository` :
 * pour passer en temps réel, implémenter la même interface (ex. table Supabase
 * `carpool_rides` + Realtime) et l'injecter via `setCarpoolRepository`.
 */

export interface CarpoolRide {
  id: string;
  eventId: string;
  driverName: string;
  /** Mobile E.164, ex : +33612345678 */
  driverPhone: string;
  driverRole: DanceRole;
  departureCity: string;
  /** HH:mm */
  departureTime: string;
  /** 1 à 4 */
  seats: number;
  createdAt: string;
  /** Annonce d'exemple (non joignable) */
  demo?: boolean;
}

export type NewCarpoolRide = Omit<CarpoolRide, 'id' | 'createdAt' | 'demo'>;

/** Contrat à implémenter pour brancher un backend temps réel léger. */
export interface CarpoolRepository {
  list(eventId: string): CarpoolRide[];
  add(ride: NewCarpoolRide): CarpoolRide;
  remove(id: string): void;
  subscribe(listener: () => void): () => void;
  /** Identifiant stable du dernier état (pour useSyncExternalStore) */
  getVersion(): number;
}

const STORAGE_KEY = 'tango_carpool_rides_v1';
export const MAX_SEATS = 4;

const ROLE_LABEL: Record<DanceRole, string> = { leader: 'Guide', follower: 'Suiveur', both: 'Double rôle' };
export const carpoolRoleLabel = (r: DanceRole) => ROLE_LABEL[r];

const SEED: CarpoolRide[] = [
  {
    id: 'demo-ride-1',
    eventId: 'evt-tours-1',
    driverName: 'Camille',
    driverPhone: '+33600000001',
    driverRole: 'follower',
    departureCity: 'Sortie A10 Amboise',
    departureTime: '19:45',
    seats: 2,
    createdAt: '2026-11-01T10:00:00.000Z',
    demo: true,
  },
];

function load(): CarpoolRide[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return SEED;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CarpoolRide[]) : [];
  } catch {
    return SEED;
  }
}

function createLocalRepository(): CarpoolRepository {
  let rides = load();
  let version = 0;
  const listeners = new Set<() => void>();

  const commit = (next: CarpoolRide[]) => {
    rides = next;
    version += 1;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
    } catch {
      // quota / navigation privée : état gardé en mémoire
    }
    listeners.forEach((l) => l());
  };

  return {
    list: (eventId) => rides.filter((r) => r.eventId === eventId),
    add(ride) {
      const created: CarpoolRide = {
        ...ride,
        id: `ride-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      commit([created, ...rides]);
      return created;
    },
    remove: (id) => commit(rides.filter((r) => r.id !== id)),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getVersion: () => version,
  };
}

let repository: CarpoolRepository = createLocalRepository();

/** Remplace le stockage local par un backend temps réel. */
export function setCarpoolRepository(repo: CarpoolRepository) {
  repository = repo;
}

export const carpoolStore = {
  list: (eventId: string) => repository.list(eventId),
  add: (ride: NewCarpoolRide) => repository.add(ride),
  remove: (id: string) => repository.remove(id),
};

/** Hook : liste réactive des trajets d'un événement. */
export function useCarpoolRides(eventId: string): CarpoolRide[] {
  useSyncExternalStore(
    (cb) => repository.subscribe(cb),
    () => repository.getVersion(),
  );
  return repository.list(eventId);
}

/** Validation douce du formulaire — retourne un message d'erreur ou null. */
export function validateRide(input: { departureCity: string; departureTime: string; seats: number }): string | null {
  if (input.departureCity.trim().length < 2) return 'Indique un lieu de départ.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.departureTime)) return 'Heure de départ invalide.';
  if (!Number.isInteger(input.seats) || input.seats < 1 || input.seats > MAX_SEATS) return 'Entre 1 et 4 places.';
  return null;
}

/** Message pré-rempli envoyé au conducteur. */
export function buildContactMessage(ride: CarpoolRide, eventTitle: string): string {
  return `Bonjour ${ride.driverName}, j'ai vu ta proposition de covoiturage pour ${eventTitle} sur Tango Itinéraire (départ ${ride.departureCity} à ${ride.departureTime}). Il te reste de la place ?`;
}

/** Liens 1 tap WhatsApp / SMS (le numéro doit être en E.164). */
export function buildContactLinks(ride: CarpoolRide, eventTitle: string) {
  const text = encodeURIComponent(buildContactMessage(ride, eventTitle));
  return {
    whatsapp: `https://wa.me/${ride.driverPhone.replace(/\D/g, '')}?text=${text}`,
    sms: `sms:${ride.driverPhone}?body=${text}`,
  };
}
