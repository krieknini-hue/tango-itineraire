import { useSyncExternalStore } from 'react';

/**
 * Validation Express — lien magique pour associations partenaires.
 * `?admin_token=asso-amboise-2026` ouvre l'Espace Organisateur sans compte.
 *
 * ⚠️ Démo front-only : le jeton est visible dans le bundle et les mises à jour
 * restent dans localStorage. En production, valider le jeton côté serveur
 * (ex. Supabase RLS / Edge Function) et pousser `OrganizerUpdate` vers une table.
 */

export interface RecurringRule {
  /** 0 = dimanche … 6 = samedi */
  weekday: number;
  /** 1..4 = n-ième occurrence dans le mois */
  nth: number;
  startTime: string;
  endTime: string;
}

export interface OrganizerSpace {
  token: string;
  name: string;
  city: string;
  venue: string;
  rule: RecurringRule;
}

export const ORGANIZER_SPACES: OrganizerSpace[] = [
  {
    token: 'asso-amboise-2026',
    name: 'Tango Amboise',
    city: 'Amboise',
    venue: 'Salle des fêtes',
    rule: { weekday: 6, nth: 2, startTime: '21:00', endTime: '01:00' },
  },
];

export function findOrganizerByToken(token: string | null): OrganizerSpace | null {
  if (!token) return null;
  return ORGANIZER_SPACES.find((s) => s.token === token) ?? null;
}

export function getAdminTokenFromUrl(search: string = window.location.search): string | null {
  return new URLSearchParams(search).get('admin_token');
}

export interface OccurrenceDate {
  /** YYYY-MM-DD */
  date: string;
  startTime: string;
  endTime: string;
}

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (nth - 1) * 7);
}

/** Les `count` prochaines occurrences (à partir d'aujourd'hui inclus). */
export function nextOccurrences(rule: RecurringRule, count = 4, from: Date = new Date()): OccurrenceDate[] {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const out: OccurrenceDate[] = [];
  for (let m = 0; out.length < count && m < 24; m++) {
    const d = nthWeekdayOfMonth(today.getFullYear(), today.getMonth() + m, rule.weekday, rule.nth);
    if (d >= today) out.push({ date: toIso(d), startTime: rule.startTime, endTime: rule.endTime });
  }
  return out;
}

export type OccurrenceStatus = 'pending' | 'confirmed' | 'cancelled';

export interface OrganizerUpdate {
  statuses: Record<string, OccurrenceStatus>;
  logistics: {
    overnight_parking: boolean;
    toilets_accessible: boolean;
    showers_available: boolean;
  };
  savedAt?: string;
}

export const DEFAULT_UPDATE: OrganizerUpdate = {
  statuses: {},
  logistics: { overnight_parking: false, toilets_accessible: false, showers_available: false },
};

const key = (token: string) => `tango_organizer_update_v1_${token}`;
let version = 0;
const listeners = new Set<() => void>();

export function loadOrganizerUpdate(token: string): OrganizerUpdate {
  try {
    const raw = localStorage.getItem(key(token));
    if (!raw) return DEFAULT_UPDATE;
    const p = JSON.parse(raw) as Partial<OrganizerUpdate>;
    return {
      statuses: p.statuses && typeof p.statuses === 'object' ? p.statuses : {},
      logistics: { ...DEFAULT_UPDATE.logistics, ...(p.logistics ?? {}) },
      savedAt: p.savedAt,
    };
  } catch {
    return DEFAULT_UPDATE;
  }
}

export function saveOrganizerUpdate(token: string, update: OrganizerUpdate): OrganizerUpdate {
  const saved = { ...update, savedAt: new Date().toISOString() };
  try {
    localStorage.setItem(key(token), JSON.stringify(saved));
  } catch {
    // quota : ignoré en démo
  }
  version += 1;
  listeners.forEach((l) => l());
  return saved;
}

/** Hook réactif sur la dernière mise à jour enregistrée. */
export function useOrganizerUpdate(token: string): OrganizerUpdate {
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
  return loadOrganizerUpdate(token);
}
