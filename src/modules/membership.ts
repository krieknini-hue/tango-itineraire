import { useSyncExternalStore } from 'react';
import type { TangueroProfile } from '../services/profileManager';

/**
 * Carte d'adhérent virtuelle & soutien associatif (2 € / an), sans paywall.
 * Le paiement se fait sur le guichet externe de l'association (HelloAsso/Stripe) ;
 * l'app ne gère aucun paiement. Statut « Actif » = déclaratif local jusqu'à
 * rapprochement par l'association (aucune vérification serveur).
 */

export const SEASON_LABEL = 'Saison 2026/2027';
export const ASSOCIATION_NAME = 'Association Tango Itinéraire';

export interface MembershipTier {
  amount: number;
  label: string;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  { amount: 2, label: 'Cotisation statutaire' },
  { amount: 5, label: 'Membre soutien' },
  { amount: 10, label: 'Membre bienfaiteur' },
];

export interface MembershipState {
  status: 'discovery' | 'active';
  season: string;
  amount?: number;
  declaredAt?: string;
}

const KEY = 'tango_membership_v1';

/** URL du guichet de paiement ; `{amount}` est remplacé par le montant choisi. */
const PAY_URL_TEMPLATE: string =
  (import.meta.env.VITE_MEMBERSHIP_PAY_URL as string | undefined) ||
  'https://www.helloasso.com/associations/tango-itineraire';

export function buildPaymentUrl(amount: number): string {
  return PAY_URL_TEMPLATE.replace('{amount}', String(amount));
}

function load(): MembershipState {
  const fallback: MembershipState = { status: 'discovery', season: SEASON_LABEL };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const s = JSON.parse(raw) as Partial<MembershipState>;
    // Un statut d'une saison passée retombe en Découverte
    if (s.status === 'active' && s.season === SEASON_LABEL) {
      return { status: 'active', season: SEASON_LABEL, amount: s.amount, declaredAt: s.declaredAt };
    }
  } catch {
    // données corrompues : on repart en Découverte
  }
  return fallback;
}

let state: MembershipState = load();
const listeners = new Set<() => void>();

export const membershipStore = {
  getState: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** L'utilisateur confirme avoir réglé sa cotisation sur le guichet externe. */
  declarePaid(amount: number) {
    state = { status: 'active', season: SEASON_LABEL, amount, declaredAt: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // quota : état gardé en mémoire
    }
    listeners.forEach((l) => l());
  },
};

export function useMembership(): MembershipState {
  return useSyncExternalStore(membershipStore.subscribe, membershipStore.getState);
}

/** N° d'adhérent stable dérivé du profil : TI-26-XXXXXX (code d'activation). */
export function formatMemberNumber(profile: Pick<TangueroProfile, 'activationCode' | 'createdAt'>): string {
  const yy = (new Date(profile.createdAt).getFullYear() % 100).toString().padStart(2, '0');
  return `TI-${yy}-${profile.activationCode.toUpperCase()}`;
}
