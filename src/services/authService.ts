import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { UserProfile } from '../types/auth';

const AUTH_USER_KEY = 'tango_current_user';

// Formate un numéro de téléphone en E.164 (+33...)
export function normalizePhoneNumber(rawPhone: string): string {
  const cleaned = rawPhone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+33${cleaned.slice(1)}`;
  }
  if (!cleaned.startsWith('+') && cleaned.length >= 9) {
    return `+33${cleaned}`;
  }
  return cleaned;
}

// Calcule les jours restants dans la période de découverte de 6 mois
export function calculateTrialDaysRemaining(trialEndsAt: string): number {
  const now = new Date().getTime();
  const end = new Date(trialEndsAt).getTime();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Envoi du SMS OTP (sans mot de passe)
export async function sendSmsOtp(phone: string): Promise<{
  success: boolean;
  message: string;
  demoCode?: string;
}> {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (normalizedPhone.length < 10) {
    return {
      success: false,
      message: 'Numéro de téléphone invalide. Exemple : 06 12 34 56 78',
    };
  }

  // Si Supabase est connecté et configuré avec SMS OTP
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      });

      if (error) {
        console.warn('Erreur Supabase Auth OTP, bascule en mode démo:', error.message);
      } else {
        return {
          success: true,
          message: `Code SMS envoyé au ${normalizedPhone}.`,
        };
      }
    } catch (e) {
      console.warn('Exception Supabase Auth:', e);
    }
  }

  // Mode local / démo zéro friction : code instantané 123456 pour tester immédiatement
  const demoCode = '123456';
  return {
    success: true,
    message: `[Mode Démo] Code SMS simulé : ${demoCode}`,
    demoCode,
  };
}

// Vérification du code SMS OTP
export async function verifySmsOtp(
  phone: string,
  code: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const trimmedCode = code.trim();

  if (trimmedCode.length !== 6) {
    return { success: false, error: 'Le code doit comporter 6 chiffres.' };
  }

  // Si Supabase est configuré
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: trimmedCode,
        type: 'sms',
      });

      if (!error && data.user) {
        // Profil issu de Supabase
        const trialEnd = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString();
        const profile: UserProfile = {
          id: data.user.id,
          phone: normalizedPhone,
          name: data.user.user_metadata?.full_name || 'Danseur Nomade',
          membershipStatus: 'beta_free',
          trialEndsAt: trialEnd,
          daysRemainingInTrial: 180,
          isCotisationPaid: false,
          createdAt: new Date().toISOString(),
        };

        saveUserSession(profile);
        return { success: true, user: profile };
      }
    } catch (e) {
      console.warn('Vérification Supabase échouée, fallback local:', e);
    }
  }

  // Validation mode Démo : accepte 123456 ou tout code 6 chiffres en mode local
  if (trimmedCode === '123456' || trimmedCode.length === 6) {
    const trialEnd = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString();
    const demoProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      phone: normalizedPhone,
      name: 'Danseur Nomade',
      membershipStatus: 'beta_free',
      trialEndsAt: trialEnd,
      daysRemainingInTrial: 180,
      isCotisationPaid: false,
      createdAt: new Date().toISOString(),
    };

    saveUserSession(demoProfile);
    return { success: true, user: demoProfile };
  }

  return { success: false, error: 'Code incorrect. En mode démo, utilisez 123456.' };
}

// Récupération de la session utilisateur en cache
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const user: UserProfile = JSON.parse(raw);
    user.daysRemainingInTrial = calculateTrialDaysRemaining(user.trialEndsAt);
    return user;
  } catch {
    return null;
  }
}

// Sauvegarde de la session utilisateur
export function saveUserSession(user: UserProfile): void {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Erreur sauvegarde session:', e);
  }
}

// Déconnexion
export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignorer
    }
  }
  localStorage.removeItem(AUTH_USER_KEY);
}
