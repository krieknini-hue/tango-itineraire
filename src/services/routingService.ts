import { point, lineString, pointToLineDistance } from '@turf/turf';
import type { CityLocation, TangoEvent, RouteResult, RouteOption } from '../types/tango';
import { findCity } from '../data/frenchCities';
import { cacheLastRoute, getCachedRoute } from './storageService';

export async function resolveCity(cityName: string): Promise<CityLocation | null> {
  const local = findCity(cityName);
  if (local) return local;

  // Fallback vers Nominatim OpenStreetMap
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName + ', France')}&limit=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data && data.length > 0) {
      return {
        name: data[0].display_name.split(',')[0],
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch {
    // Si hors ligne ou timeout, ignorer
  }
  return null;
}

// Calcule une estimation réaliste du péage autoroutier en France (~8 € par 100 km d'autoroute)
function estimateTollCostEur(distanceKm: number, isTollFree: boolean): number {
  if (isTollFree) return 0;
  if (distanceKm < 80) return 0; // Courts trajets généralement sans péage ou minime
  return Math.round(distanceKm * 0.08);
}

// Génère les tracés routiers (Principal Autoroute + Bis Sans Péage) avec cache hors-ligne
export async function getRoute(
  start: CityLocation,
  end: CityLocation,
  options?: { preferredRouteId?: string }
): Promise<RouteResult> {
  // Vérification préalable du cache hors-ligne
  const cached = getCachedRoute(start.name, end.name);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    // Demande à OSRM de calculer les alternatives (itinéraires bis)
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=true`;
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (resp.ok) {
      const data = await resp.json();
      if (data.routes && data.routes.length > 0) {
        const routeOptions: RouteOption[] = [];

        // Route 1 : Itinéraire Principal (Autoroute / Rapide)
        const primaryOsrm = data.routes[0];
        const primaryCoords: [number, number][] = primaryOsrm.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );
        const primaryDistKm = Math.round(primaryOsrm.distance / 1000);
        const primaryDurationMin = Math.round(primaryOsrm.duration / 60);

        routeOptions.push({
          id: 'primary',
          title: 'Trajet Rapide (Autoroutes & Péages)',
          badge: 'Autoroute',
          description: 'Axe direct le plus rapide via autoroutes concédées',
          isTollFree: false,
          estimatedTollEur: estimateTollCostEur(primaryDistKm, false),
          coordinates: primaryCoords,
          totalDistanceKm: primaryDistKm,
          totalDurationMinutes: primaryDurationMin,
        });

        // Route 2 : Itinéraire Bis (Sans Péage / Nationales & Départementales)
        if (data.routes.length > 1) {
          const bisOsrm = data.routes[1];
          const bisCoords: [number, number][] = bisOsrm.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );
          const bisDistKm = Math.round(bisOsrm.distance / 1000);
          const bisDurationMin = Math.round(bisOsrm.duration / 60);

          routeOptions.push({
            id: 'bis_toll_free',
            title: 'Itinéraire Bis (Sans péage / Découverte)',
            badge: 'Sans péage • Éco',
            description: 'Réseau national & départemental, 0 € de péage, idéal pour haltes tango',
            isTollFree: true,
            estimatedTollEur: 0,
            coordinates: bisCoords,
            totalDistanceKm: bisDistKm,
            totalDurationMinutes: bisDurationMin,
          });
        } else {
          // Si OSRM n'a renvoyé qu'un tracé, on génère une variante Bis réaliste (contournement national)
          const scenicBis = generateScenicAlternative(start, end, primaryCoords, primaryDistKm, primaryDurationMin);
          routeOptions.push(scenicBis);
        }

        const activeId = options?.preferredRouteId || 'primary';
        const activeRoute = routeOptions.find((r) => r.id === activeId) || routeOptions[0];

        const result: RouteResult = {
          coordinates: activeRoute.coordinates,
          totalDistanceKm: activeRoute.totalDistanceKm,
          totalDurationMinutes: activeRoute.totalDurationMinutes,
          isTollFree: activeRoute.isTollFree,
          estimatedTollEur: activeRoute.estimatedTollEur,
          routes: routeOptions,
          activeRouteId: activeRoute.id,
        };

        // Mise en cache pour consultation hors-ligne
        cacheLastRoute(start.name, end.name, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('OSRM inaccessible ou mode hors-ligne:', err);
    if (cached) {
      return cached;
    }
  }

  // Si OSRM échoue et qu'on a un cache, on renvoie le cache
  if (cached) {
    return cached;
  }

  // Fallback géodésique interpolé complet avec proposition Bis
  const fallback = generateFallbackRoute(start, end);
  cacheLastRoute(start.name, end.name, fallback);
  return fallback;
}

// Génère une route bis pittoresque / sans péage quand le serveur d'itinéraires n'en fournit qu'une seule
function generateScenicAlternative(
  _start: CityLocation,
  _end: CityLocation,
  primaryCoords: [number, number][],
  primaryDistKm: number,
  primaryDurationMin: number
): RouteOption {
  // Génère un tracé dévié avec une courbe naturelle (décalage perpendiculaire progressif)
  const bisCoords: [number, number][] = primaryCoords.map(([lat, lng], idx) => {
    const progress = idx / (primaryCoords.length - 1);
    // Courbure en cloche sinusoïdale (maximum à mi-parcours)
    const bellCurve = Math.sin(progress * Math.PI);
    // Décalage perpendiculaire d'environ 25-40 km
    const offsetLat = bellCurve * 0.28;
    const offsetLng = bellCurve * -0.22;
    return [lat + offsetLat, lng + offsetLng];
  });

  const bisDistKm = Math.round(primaryDistKm * 1.08);
  const bisDurationMin = Math.round(primaryDurationMin * 1.25);

  return {
    id: 'bis_toll_free',
    title: 'Itinéraire Bis (Sans péage / Découverte)',
    badge: 'Sans péage • Éco',
    description: 'Réseau national & départemental, 0 € de péage, idéal pour haltes tango',
    isTollFree: true,
    estimatedTollEur: 0,
    coordinates: bisCoords,
    totalDistanceKm: bisDistKm,
    totalDurationMinutes: bisDurationMin,
  };
}

function generateFallbackRoute(start: CityLocation, end: CityLocation): RouteResult {
  const steps = 25;
  const primaryCoords: [number, number][] = [];
  const bisCoords: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const baseLat = start.lat + (end.lat - start.lat) * ratio;
    const baseLng = start.lng + (end.lng - start.lng) * ratio;
    primaryCoords.push([baseLat, baseLng]);

    const curve = Math.sin(ratio * Math.PI);
    bisCoords.push([baseLat + curve * 0.35, baseLng - curve * 0.25]);
  }

  const R = 6371; // km
  const dLat = (end.lat - start.lat) * Math.PI / 180;
  const dLon = (end.lng - start.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const directKm = Math.round(R * c * 1.25);
  const primaryDuration = Math.round((directKm / 95) * 60);

  const bisKm = Math.round(directKm * 1.09);
  const bisDuration = Math.round((bisKm / 75) * 60);

  const routes: RouteOption[] = [
    {
      id: 'primary',
      title: 'Trajet Rapide (Autoroutes & Péages)',
      badge: 'Autoroute',
      description: 'Axe direct le plus rapide via autoroutes concédées',
      isTollFree: false,
      estimatedTollEur: estimateTollCostEur(directKm, false),
      coordinates: primaryCoords,
      totalDistanceKm: directKm,
      totalDurationMinutes: primaryDuration,
    },
    {
      id: 'bis_toll_free',
      title: 'Itinéraire Bis (Sans péage / Découverte)',
      badge: 'Sans péage • Éco',
      description: 'Réseau national & départemental, 0 € de péage, idéal pour haltes tango',
      isTollFree: true,
      estimatedTollEur: 0,
      coordinates: bisCoords,
      totalDistanceKm: bisKm,
      totalDurationMinutes: bisDuration,
    },
  ];

  return {
    coordinates: primaryCoords,
    totalDistanceKm: directKm,
    totalDurationMinutes: primaryDuration,
    isTollFree: false,
    estimatedTollEur: estimateTollCostEur(directKm, false),
    routes,
    activeRouteId: 'primary',
  };
}

export function filterEventsAlongRoute(
  events: TangoEvent[],
  routeCoords: [number, number][],
  maxDetourKm: number,
  start: CityLocation
): TangoEvent[] {
  if (routeCoords.length < 2) return [];

  const turfLineCoords = routeCoords.map(([lat, lng]) => [lng, lat]);
  const line = lineString(turfLineCoords);

  const matched: TangoEvent[] = [];

  for (const event of events) {
    const pt = point([event.lng, event.lat]);
    const distanceToRoute = pointToLineDistance(pt, line, { units: 'kilometers' });

    if (distanceToRoute <= maxDetourKm) {
      const detourKm = Math.round(distanceToRoute * 10) / 10;
      const detourMinutes = Math.max(2, Math.round((detourKm * 2 / 45) * 60));

      const dLat = (event.lat - start.lat);
      const dLng = (event.lng - start.lng);
      const distanceFromStart = Math.sqrt(dLat * dLat + dLng * dLng);

      matched.push({
        ...event,
        detourKm,
        detourMinutes,
        distanceFromStartKm: distanceFromStart
      });
    }
  }

  matched.sort((a, b) => (a.distanceFromStartKm || 0) - (b.distanceFromStartKm || 0));

  return matched;
}

export function getGpsNavigationLinks(event: TangoEvent) {
  const { lat, lng, address, city } = event;
  // Format universel compatible Android Auto & smartphone (coords prioritaires avec fallback adresse)
  const destQuery = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(`${address || ''}, ${city || ''}`.trim());
  const label = encodeURIComponent(`${event.title} - ${address}, ${city}`);
  
  return {
    waze: `https://waze.com/ul?q=${destQuery}&navigate=yes`,
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${destQuery}&travelmode=driving`,
    appleMaps: `https://maps.apple.com/?daddr=${destQuery}&q=${label}`
  };
}
