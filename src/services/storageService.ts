import type { RouteResult } from '../types/tango';

const FAVORITES_KEY = 'tango_favorite_events';
const ROUTE_CACHE_KEY = 'tango_cached_route';
const USER_PREFERENCES_KEY = 'tango_user_preferences';

export interface UserPreferences {
  defaultDetourKm: number;
  preferredFloor?: string;
  autoRefresh: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultDetourKm: 30,
  autoRefresh: true,
};

// --- GESTION DES FAVORIS (HORS-LIGNE) ---

export function getFavoriteEventIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Erreur lecture favoris:', e);
    return [];
  }
}

export function isFavoriteEvent(eventId: string): boolean {
  return getFavoriteEventIds().includes(eventId);
}

export function toggleFavoriteEvent(eventId: string): boolean {
  const current = getFavoriteEventIds();
  const exists = current.includes(eventId);
  const updated = exists ? current.filter((id) => id !== eventId) : [...current, eventId];
  
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Erreur sauvegarde favoris:', e);
  }

  return !exists;
}

// --- CACHE DU DERNIER ITINÉRAIRE (MODE SANS RÉSEAU) ---

export interface CachedRouteData {
  startCity: string;
  endCity: string;
  route: RouteResult;
  timestamp: number;
}

export function cacheLastRoute(startCity: string, endCity: string, route: RouteResult): void {
  try {
    const data: CachedRouteData = {
      startCity,
      endCity,
      route,
      timestamp: Date.now(),
    };
    localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Impossible de mettre en cache le tracé:', e);
  }
}

export function getCachedRoute(startCity: string, endCity: string): RouteResult | null {
  try {
    const raw = localStorage.getItem(ROUTE_CACHE_KEY);
    if (!raw) return null;
    const data: CachedRouteData = JSON.parse(raw);
    
    // Correspondance insensible à la casse
    if (
      data.startCity.trim().toLowerCase() === startCity.trim().toLowerCase() &&
      data.endCity.trim().toLowerCase() === endCity.trim().toLowerCase()
    ) {
      return data.route;
    }
  } catch (e) {
    console.warn('Erreur lecture cache route:', e);
  }
  return null;
}

// --- PRÉFÉRENCES UTILISATEUR ---

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(USER_PREFERENCES_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): void {
  try {
    const current = getUserPreferences();
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch (e) {
    console.warn('Erreur sauvegarde préférences:', e);
  }
}
