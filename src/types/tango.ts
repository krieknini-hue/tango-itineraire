export type EventType = 'milonga' | 'pratique' | 'festival' | 'marathon' | 'stage';

export type FloorType = 'Parquet amorti' | 'Parquet' | 'Béton ciré' | 'Carrelage' | 'Plein air / Estrade' | 'Autre';

export type DanceVibe = 
  | 'Traditionnelle (Mirada & Cabeceo)' 
  | 'Conviviale / Mixte' 
  | 'Néo & Alternative' 
  | 'Pratique libre et informelle';

export interface Organizer {
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  verified: boolean;
}

export type DanceRole = 'leader' | 'follower' | 'both';
export type ProfileVisibility = 'friends' | 'public' | 'ghost';

/** Logistique nomade : halte de nuit, sanitaires, eau */
export interface NomadLogistics {
  overnight_parking: boolean;
  parking_notes: string;
  toilets_accessible: boolean;
  showers_available: boolean;
  potable_water: boolean;
}

/** Affluence prévisionnelle par rôle (effectifs attendus) */
export interface ExpectedAttendance {
  leaders: number;
  followers: number;
  both: number;
}

/** Danseur inscrit/annoncé sur une fiche (données locales de démonstration) */
export interface EventAttendee {
  name: string;
  city?: string;
  role: DanceRole;
  visibility: Exclude<ProfileVisibility, 'ghost'>;
}

export interface TangoEvent {
  id: string;
  title: string;
  type: EventType;
  organizer: Organizer;
  
  // Date & Horaires
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  
  // Localisation
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  
  // Tarifs
  price: string; // ex: "12 € (boisson incluse)" ou "Gratuit"
  
  // Bloc Confort & Sol
  floor: FloorType;
  airConditioning: boolean;
  cloakroom: boolean;
  parking: string; // ex: "Grand parking gratuit sur place"
  catering: string; // ex: "Bar associatif & empanadas maison"
  
  // Bloc Ambiance & Danse
  vibe: DanceVibe;
  dj: string; // ex: "DJ Gonzalo (Sélection vinyles 100% traditionnel)"
  djStyle: string;
  liveMusic?: string; // ex: "Orchestre Trio Silbando en live à 22h"
  teachers?: string; // ex: "Stage débutants avec Maria & Lucas (19h-20h)"
  registrationRequired: boolean;
  roleBalanceEnforced: boolean; // Équilibre guides / suiveurs
  
  // Bloc Exposants
  exhibitors?: string[]; // ex: ["Chaussures Comme il Faut", "Robes Tangolera"]
  
  // Halte Nomade & Bivouac (optionnel : fiche non renseignée = bloc masqué)
  nomad_logistics?: NomadLogistics;

  // Affluence prévisionnelle (jauge de parité) & danseurs annoncés
  expected_attendance?: ExpectedAttendance;
  attendees?: EventAttendee[];

  // Statut & Urgence
  status: 'confirmed' | 'cancelled';
  cancellationReason?: string;
  
  // Calculé dynamiquement lors d'une recherche d'itinéraire
  detourKm?: number;
  detourMinutes?: number;
  distanceFromStartKm?: number;
}

export interface CityLocation {
  name: string;
  lat: number;
  lng: number;
}

export interface ItineraryQuery {
  startCity: string;
  endCity: string;
  date: string;
  maxDetourKm: number;
}

export interface RouteOption {
  id: string; // 'primary' | 'bis_toll_free'
  title: string;
  badge: string;
  description: string;
  isTollFree: boolean;
  estimatedTollEur: number;
  coordinates: [number, number][]; // [lat, lng]
  totalDistanceKm: number;
  totalDurationMinutes: number;
  eventsCount?: number;
}

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng]
  totalDistanceKm: number;
  totalDurationMinutes: number;
  isTollFree?: boolean;
  estimatedTollEur?: number;
  routes: RouteOption[];
  activeRouteId: string;
}
