import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { TangoEvent } from '../types/tango';
import { INITIAL_MOCK_EVENTS } from '../data/mockEvents';

// Convertit un enregistrement SQL Supabase en objet TypeScript TangoEvent
function mapRowToTangoEvent(row: Record<string, unknown>): TangoEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    type: row.type as TangoEvent['type'],
    organizer: {
      name: String(row.organizer_name || 'Association'),
      email: row.organizer_email ? String(row.organizer_email) : undefined,
      phone: row.organizer_phone ? String(row.organizer_phone) : undefined,
      website: row.organizer_website ? String(row.organizer_website) : undefined,
      verified: Boolean(row.organizer_verified),
    },
    date: String(row.date),
    startTime: String(row.start_time),
    endTime: String(row.end_time),
    address: String(row.address),
    city: String(row.city),
    postalCode: String(row.postal_code),
    lat: Number(row.lat),
    lng: Number(row.lng),
    price: String(row.price),
    floor: row.floor as TangoEvent['floor'],
    airConditioning: Boolean(row.air_conditioning),
    cloakroom: Boolean(row.cloakroom),
    parking: String(row.parking || ''),
    catering: String(row.catering || ''),
    vibe: row.vibe as TangoEvent['vibe'],
    dj: String(row.dj || ''),
    djStyle: String(row.dj_style || ''),
    liveMusic: row.live_music ? String(row.live_music) : undefined,
    teachers: row.teachers ? String(row.teachers) : undefined,
    registrationRequired: Boolean(row.registration_required),
    roleBalanceEnforced: Boolean(row.role_balance_enforced),
    exhibitors: Array.isArray(row.exhibitors) ? (row.exhibitors as string[]) : undefined,
    status: (row.status as 'confirmed' | 'cancelled') || 'confirmed',
    cancellationReason: row.cancellation_reason ? String(row.cancellation_reason) : undefined,
  };
}

// Récupère les événements depuis Supabase (avec fallback transparent sur les mock events)
export async function fetchEventsFromDatabase(targetDate?: string): Promise<TangoEvent[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('events').select('*');
      if (targetDate) {
        query = query.eq('date', targetDate);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(mapRowToTangoEvent);
      }
    } catch (e) {
      console.warn('Erreur Supabase fetch, fallback local:', e);
    }
  }

  // Fallback initial
  return targetDate
    ? INITIAL_MOCK_EVENTS.filter((e) => e.date === targetDate)
    : INITIAL_MOCK_EVENTS;
}

// Signale une annulation d'urgence (canal d'alerte instantanée Asso)
export async function reportEmergencyCancellation(
  eventId: string,
  cancellationReason: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: 'cancelled',
          cancellation_reason: cancellationReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }

  // En local, l'état React prend immédiatement le relais
  return { success: true };
}

// Appel RPC PostGIS pour filtrer directement les événements côté PostgreSQL
export async function findEventsAlongRoutePostGIS(
  routeCoords: [number, number][],
  maxDetourKm: number,
  targetDate?: string
): Promise<TangoEvent[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    // GeoJSON Linestring: [lng, lat]
    const geoJsonLine = {
      type: 'LineString',
      coordinates: routeCoords.map(([lat, lng]) => [lng, lat]),
    };

    const { data, error } = await supabase.rpc('find_events_along_route', {
      route_geojson: JSON.stringify(geoJsonLine),
      buffer_meters: maxDetourKm * 1000,
      target_date: targetDate || null,
    });

    if (!error && Array.isArray(data)) {
      return data.map(mapRowToTangoEvent);
    }
  } catch (e) {
    console.warn('PostGIS RPC indisponible, utilisation du moteur client Turf.js:', e);
  }

  return null;
}
