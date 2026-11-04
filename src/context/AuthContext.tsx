import React, { createContext, useState } from 'react';
import type { UserProfile, MembershipReceipt } from '../types/auth';
import {
  getCurrentUser,
  sendSmsOtp,
  verifySmsOtp,
  logout as authLogout,
} from '../services/authService';
import { createCotisationCheckoutSession } from '../services/stripeService';
import {
  getFavoriteEventIds,
  toggleFavoriteEvent,
} from '../services/storageService';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  favoriteIds: string[];
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; demoCode?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  payCotisation: () => Promise<{ success: boolean; receipt?: MembershipReceipt }>;
  toggleFavorite: (eventId: string) => boolean;
  isFavorite: (eventId: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteEventIds());
  const [isLoading] = useState(false);

  const handleSendOtp = async (phone: string) => {
    return await sendSmsOtp(phone);
  };

  const handleVerifyOtp = async (phone: string, code: string) => {
    const res = await verifySmsOtp(phone, code);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Échec de vérification' };
  };

  const handleLogout = async () => {
    await authLogout();
    setUser(null);
  };

  const handlePayCotisation = async (): Promise<{ success: boolean; receipt?: MembershipReceipt }> => {
    if (!user) {
      return { success: false };
    }
    const res = await createCotisationCheckoutSession(user);
    if (res.success && res.simulatedReceipt) {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
      return { success: true, receipt: res.simulatedReceipt };
    }
    return { success: false };
  };

  const handleToggleFavorite = (eventId: string): boolean => {
    const added = toggleFavoriteEvent(eventId);
    setFavoriteIds(getFavoriteEventIds());
    return added;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        favoriteIds,
        sendOtp: handleSendOtp,
        verifyOtp: handleVerifyOtp,
        logout: handleLogout,
        payCotisation: handlePayCotisation,
        toggleFavorite: handleToggleFavorite,
        isFavorite: (id: string) => favoriteIds.includes(id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from './useAuth';

