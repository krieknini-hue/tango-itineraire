export type ContactStatus = 'to_contact' | 'contacted' | 'partner_confirmed' | 'declined';

export interface OrganizerContact {
  id: string;
  organizerName: string;
  email: string;
  phone?: string;
  waPhone?: string;
  website?: string;
  milongaTitle: string;
  city: string;
  postalCode?: string;
  address?: string;
  floor?: string;
  status: ContactStatus;
  lastContactedAt?: string | null;
  notes?: string;
}
