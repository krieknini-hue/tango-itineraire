export type MembershipStatus = 'beta_free' | 'active' | 'expired';

export interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  membershipStatus: MembershipStatus;
  trialEndsAt: string; // ISO date
  membershipExpiresAt?: string; // ISO date
  isCotisationPaid: boolean;
  daysRemainingInTrial: number;
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  token?: string;
  isAuthenticated: boolean;
}

export interface StripePaymentSession {
  sessionId: string;
  url: string;
  amountCents: number;
  currency: string;
}

export interface MembershipReceipt {
  receiptNumber: string;
  userName: string;
  phone: string;
  amountEur: number;
  date: string;
  validUntil: string;
  associationName: string;
  associationRna: string;
}
