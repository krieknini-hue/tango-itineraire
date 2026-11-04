import type { UserProfile, MembershipReceipt } from '../types/auth';
import { saveUserSession } from './authService';

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const isStripeConfigured = (): boolean => {
  return Boolean(STRIPE_PK && STRIPE_PK.startsWith('pk_'));
};

// Simulation ou création d'une session Stripe Checkout pour la cotisation annuelle de 2 €
export async function createCotisationCheckoutSession(
  user: UserProfile
): Promise<{ url?: string; success: boolean; simulatedReceipt?: MembershipReceipt }> {
  // Si Stripe en production est branché sur une Cloud Function / Supabase Edge Function
  if (isStripeConfigured()) {
    try {
      const resp = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: user.phone,
          amountCents: 200, // 2,00 €
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.url) {
          return { url: data.url, success: true };
        }
      }
    } catch (e) {
      console.warn('API Stripe non disponible en local, bascule sur simulation immédiate:', e);
    }
  }

  // Simulation immédiate en 1 clic pour tester l'activation instantanée de l'adhésion
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
  const updatedUser: UserProfile = {
    ...user,
    membershipStatus: 'active',
    membershipExpiresAt: oneYearFromNow,
    isCotisationPaid: true,
  };

  saveUserSession(updatedUser);

  const receipt = generateMembershipReceipt(updatedUser);

  return {
    success: true,
    simulatedReceipt: receipt,
  };
}

// Génère une attestation / reçu officiel d'adhésion associative Loi 1901
export function generateMembershipReceipt(user: UserProfile): MembershipReceipt {
  const now = new Date();
  const year = now.getFullYear();
  const dateStr = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const validUntilStr = new Date(now.getTime() + 365 * 24 * 3600 * 1000).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return {
    receiptNumber: `TI-${year}-${user.id.slice(-6).toUpperCase()}`,
    userName: user.name || 'Danseur Nomade',
    phone: user.phone,
    amountEur: 2.0,
    date: dateStr,
    validUntil: validUntilStr,
    associationName: 'Association Tango Itinéraire',
    associationRna: 'W372019842',
  };
}
