import { useSyncExternalStore } from 'react';
import type { DanceRole, ProfileVisibility } from '../types/tango';

/**
 * ProfileManager — inscription express « Zero Password » 100 % locale.
 * Pas de serveur ni de SMS payant : activation par « Reverse Ping » (message
 * WhatsApp / SMS envoyé par l'utilisateur vers le numéro de gestion).
 * Store compatible useSyncExternalStore (Navbar, modale, fiches synchronisées).
 */

export interface TangueroProfile {
  name: string;
  /** Mobile au format international E.164, ex: +33612345678 */
  phone: string;
  homeCity: string;
  role: DanceRole;
  visibility: ProfileVisibility;
  /** Code court d'activation (Reverse Ping) */
  activationCode: string;
  createdAt: string;
}

/** Données saisies dans le formulaire (avant génération du code) */
export type ProfileDraft = Pick<TangueroProfile, 'name' | 'phone' | 'homeCity' | 'role' | 'visibility'>;

export interface ProfileState {
  profile: TangueroProfile | null;
  /** Mode Découverte / Surprise : masque les profils des autres danseurs */
  discoveryMode: boolean;
}

const PROFILE_KEY = 'tango_user_profile';
const DISCOVERY_KEY = 'tango_discovery_mode';

/** Numéro de gestion qui reçoit les pings d'activation (à définir dans .env) */
export const ACTIVATION_PHONE: string =
  (import.meta.env.VITE_ACTIVATION_PHONE as string | undefined) || '+33600000000';

export const DEFAULT_DRAFT: ProfileDraft = {
  name: '',
  phone: '',
  homeCity: '',
  role: 'both',
  visibility: 'friends',
};

export const ROLE_META: Record<DanceRole, { emoji: string; label: string; short: string }> = {
  leader: { emoji: '🟢', label: 'Guide (Leader)', short: 'Guide' },
  follower: { emoji: '🟣', label: 'Suiveur (Follower)', short: 'Suiveur' },
  both: { emoji: '🔄', label: 'Double rôle', short: 'Double' },
};

export const VISIBILITY_META: Record<ProfileVisibility, { emoji: string; label: string }> = {
  friends: { emoji: '👥', label: 'Amis uniquement' },
  public: { emoji: '🌍', label: 'Tout le monde' },
  ghost: { emoji: '👻', label: 'Fantôme' },
};

/**
 * Normalise un mobile en E.164. Accepte "+33 6 12 34 56 78", "0612345678",
 * "0033612345678". Retourne null si le format est invalide.
 */
export function normalizePhone(input: string): string | null {
  let s = input.replace(/[\s.\-()]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  else if (/^0\d{9}$/.test(s)) s = '+33' + s.slice(1);
  return /^\+[1-9]\d{7,14}$/.test(s) ? s : null;
}

/** Code court sans caractères ambigus (0/O, 1/I) — 6 caractères */
export function generateActivationCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export function buildActivationMessage(profile: Pick<TangueroProfile, 'activationCode' | 'name'>): string {
  return `ACTIVATION TANGO ${profile.activationCode} - ${profile.name}`;
}

/** Liens Reverse Ping vers le numéro de gestion */
export function buildActivationLinks(profile: Pick<TangueroProfile, 'activationCode' | 'name'>) {
  const text = encodeURIComponent(buildActivationMessage(profile));
  return {
    whatsapp: `https://wa.me/${ACTIVATION_PHONE.replace(/\D/g, '')}?text=${text}`,
    sms: `sms:${ACTIVATION_PHONE}?body=${text}`,
  };
}

const isRole = (v: unknown): v is DanceRole => v === 'leader' || v === 'follower' || v === 'both';
const isVisibility = (v: unknown): v is ProfileVisibility =>
  v === 'friends' || v === 'public' || v === 'ghost';

function loadProfile(): TangueroProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<TangueroProfile>;
    if (!p || typeof p !== 'object' || typeof p.name !== 'string' || typeof p.phone !== 'string') return null;
    return {
      name: p.name,
      phone: p.phone,
      homeCity: typeof p.homeCity === 'string' ? p.homeCity : '',
      role: isRole(p.role) ? p.role : 'both',
      visibility: isVisibility(p.visibility) ? p.visibility : 'friends',
      activationCode: typeof p.activationCode === 'string' ? p.activationCode : generateActivationCode(),
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function loadDiscovery(): boolean {
  try {
    return localStorage.getItem(DISCOVERY_KEY) === '1';
  } catch {
    return false;
  }
}

let state: ProfileState = { profile: loadProfile(), discoveryMode: loadDiscovery() };
const listeners = new Set<() => void>();

function commit(next: ProfileState) {
  state = next;
  try {
    if (state.profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
    else localStorage.removeItem(PROFILE_KEY);
    localStorage.setItem(DISCOVERY_KEY, state.discoveryMode ? '1' : '0');
  } catch {
    // quota / navigation privée : on garde l'état en mémoire
  }
  listeners.forEach((l) => l());
}

export const profileManager = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Crée la session locale (nouveau code d'activation) et la persiste. */
  register(draft: ProfileDraft): TangueroProfile {
    const profile: TangueroProfile = {
      ...draft,
      name: draft.name.trim(),
      homeCity: draft.homeCity.trim(),
      activationCode: generateActivationCode(),
      createdAt: new Date().toISOString(),
    };
    commit({ ...state, profile });
    return profile;
  },
  /** Modifie la fiche existante (téléphone et code d'activation conservés). */
  update(draft: Pick<ProfileDraft, 'name' | 'homeCity' | 'role' | 'visibility'>) {
    if (!state.profile) return;
    commit({
      ...state,
      profile: {
        ...state.profile,
        ...draft,
        name: draft.name.trim(),
        homeCity: draft.homeCity.trim(),
      },
    });
  },
  clearProfile() {
    commit({ ...state, profile: null });
  },
  setDiscoveryMode(discoveryMode: boolean) {
    commit({ ...state, discoveryMode });
  },
};

export function useProfileState(): ProfileState {
  return useSyncExternalStore(profileManager.subscribe, profileManager.getState);
}
