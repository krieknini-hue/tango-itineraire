import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { TangoEvent, CityLocation, RouteOption } from '../types/tango';

interface TangoMapProps {
  startLocation: CityLocation | null;
  endLocation: CityLocation | null;
  routeCoords: [number, number][];
  events: TangoEvent[];
  selectedEvent: TangoEvent | null;
  onSelectEvent: (event: TangoEvent) => void;
  routes?: RouteOption[];
  activeRouteId?: string;
  onSelectRouteId?: (id: string) => void;
  /** Mode « autour de moi » : position + cercle de rayon (km) */
  userPosition?: { lat: number; lng: number } | null;
  radiusKm?: number;
}

export const TangoMap: React.FC<TangoMapProps> = ({
  startLocation,
  endLocation,
  routeCoords,
  events,
  selectedEvent,
  onSelectEvent,
  routes = [],
  activeRouteId = 'primary',
  onSelectRouteId,
  userPosition = null,
  radiusKm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [46.603354, 1.888334],
      zoom: 6,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tuiles OpenStreetMap France 100% libres et fluides
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    }).addTo(map);

    routesLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Mise à jour des tracés (Principal & Bis) et des marqueurs rétro
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const markersLayer = markersLayerRef.current;
    if (markersLayer) {
      markersLayer.clearLayers();
    }

    const routesGroup = routesLayerGroupRef.current;
    if (routesGroup) {
      routesGroup.clearLayers();
    }

    const bounds = L.latLngBounds([]);

    // Tracés routiers : gestion de l'itinéraire principal et des variantes bis
    if (routes && routes.length > 0) {
      // 1. Tracer d'abord les routes secondaires (inactives) en arrière-plan
      routes
        .filter((r) => r.id !== activeRouteId)
        .forEach((route) => {
          if (route.coordinates.length > 1) {
            const poly = L.polyline(route.coordinates, {
              color: route.isTollFree ? '#10b981' : '#f59e0b',
              weight: 4,
              opacity: 0.55,
              dashArray: '8, 8',
              lineCap: 'round',
            });

            poly.bindTooltip(
              `<b>${route.title}</b><br/>${route.totalDistanceKm} km • ${route.isTollFree ? '0 € péage' : `~${route.estimatedTollEur} € péage`}<br/><span style="font-size:10px; color:#d4af37">Cliquez pour activer</span>`,
              { sticky: true }
            );

            poly.on('click', () => {
              if (onSelectRouteId) {
                onSelectRouteId(route.id);
              }
            });

            routesGroup?.addLayer(poly);
          }
        });

      // 2. Tracer la route active en premier plan avec mise en valeur
      const activeRoute = routes.find((r) => r.id === activeRouteId) || routes[0];
      if (activeRoute && activeRoute.coordinates.length > 1) {
        const activeColor = activeRoute.isTollFree ? '#059669' : '#8e1c2e';
        const activePoly = L.polyline(activeRoute.coordinates, {
          color: activeColor,
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        });
        routesGroup?.addLayer(activePoly);
        bounds.extend(activePoly.getBounds());
      }
    } else if (routeCoords.length > 1) {
      // Fallback si pas d'options multi-routes
      const defaultPoly = L.polyline(routeCoords, {
        color: '#8e1c2e',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });
      routesGroup?.addLayer(defaultPoly);
      bounds.extend(defaultPoly.getBounds());
    }

    // Marqueur Départ (A) façon sceau
    if (startLocation) {
      const startIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background: linear-gradient(135deg, #059669, #047857); color: #fce59e; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-family: 'Playfair Display', serif; font-size: 14px; border: 2px solid #d4af37; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
            A
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const m = L.marker([startLocation.lat, startLocation.lng], { icon: startIcon })
        .bindPopup(`<b style="color: #f5d77f; font-family: 'Playfair Display', serif;">Départ : ${startLocation.name}</b>`);
      markersLayer?.addLayer(m);
      bounds.extend([startLocation.lat, startLocation.lng]);
    }

    // Marqueur Arrivée (B) façon sceau
    if (endLocation) {
      const endIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="background: linear-gradient(135deg, #8e1c2e, #5e0f1c); color: #fce59e; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-family: 'Playfair Display', serif; font-size: 14px; border: 2px solid #d4af37; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
            B
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const m = L.marker([endLocation.lat, endLocation.lng], { icon: endIcon })
        .bindPopup(`<b style="color: #fce59e; font-family: 'Playfair Display', serif;">Arrivée : ${endLocation.name}</b>`);
      markersLayer?.addLayer(m);
      bounds.extend([endLocation.lat, endLocation.lng]);
    }

    // Mode « autour de moi » : point bleu pulsant + cercle de rayon
    let userCircleBounds: L.LatLngBounds | null = null;
    if (userPosition) {
      const center: [number, number] = [userPosition.lat, userPosition.lng];
      const meIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 6px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.6);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      markersLayer?.addLayer(L.marker(center, { icon: meIcon, zIndexOffset: 1000 }).bindPopup('Vous êtes ici'));
      if (radiusKm) {
        const circle = L.circle(center, {
          radius: radiusKm * 1000,
          color: '#d4af37',
          weight: 2,
          dashArray: '6, 6',
          fillColor: '#d4af37',
          fillOpacity: 0.08,
          interactive: false,
        });
        markersLayer?.addLayer(circle);
        userCircleBounds = circle.getBounds();
      }
      bounds.extend(center);
    }

    // Marqueurs Événements Tango (Milongas, Pratiques, etc.)
    events.forEach((evt) => {
      const isSelected = selectedEvent?.id === evt.id;
      const isCancelled = evt.status === 'cancelled';

      let bgGradient = 'linear-gradient(135deg, #8e1c2e, #5e0f1c)';
      let label = 'M';
      if (evt.type === 'pratique') {
        bgGradient = 'linear-gradient(135deg, #d97706, #b45309)';
        label = 'P';
      } else if (evt.type === 'festival' || evt.type === 'marathon') {
        bgGradient = 'linear-gradient(135deg, #7c3aed, #5b21b6)';
        label = '★';
      }

      if (isCancelled) {
        bgGradient = 'linear-gradient(135deg, #450a0a, #1c0505)';
        label = '✕';
      }

      const size = isSelected ? 36 : 28;
      const borderWidth = isSelected ? 3 : 2;
      const borderColor = isSelected ? '#ffffff' : '#d4af37';

      const icon = L.divIcon({
        className: 'custom-tango-icon',
        html: `
          <div style="background: ${bgGradient}; color: #fce59e; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: 'Playfair Display', serif; font-size: ${isSelected ? 15 : 12}px; border: ${borderWidth}px solid ${borderColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.7); cursor: pointer; transition: transform 0.2s;">
            ${label}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([evt.lat, evt.lng], { icon });
      marker.on('click', () => onSelectEvent(evt));

      marker.bindPopup(`
        <div style="font-family: 'Playfair Display', serif; min-width: 170px; background: #1b1210; color: #f7f2e7; padding: 4px; border-radius: 8px;">
          <b style="color: #f5d77f; font-size: 13px;">${evt.title}</b>
          <div style="font-size: 11px; color: #e2d9cc; margin-top: 2px;">
            📍 ${evt.city} (${evt.postalCode})<br/>
            ⏰ ${evt.startTime} - ${evt.endTime}<br/>
            💰 ${evt.price}
          </div>
          ${
            evt.detourKm !== undefined
              ? `<div style="font-size: 11px; font-weight: bold; color: #fce59e; margin-top: 4px; background: #8e1c2e; padding: 2px 6px; border-radius: 4px; display: inline-block;">
                  +${evt.detourKm} km (~${evt.detourMinutes} min)
                </div>`
              : ''
          }
          ${isCancelled ? `<div style="color: #f87171; font-weight: bold; font-size: 11px; margin-top: 4px;">🔴 ANNULÉ</div>` : ''}
        </div>
      `);

      markersLayer?.addLayer(marker);
      bounds.extend([evt.lat, evt.lng]);
    });

    if (userCircleBounds) {
      // Centrage sur la position : le cercle de rayon est toujours entièrement visible
      map.fitBounds(userCircleBounds, { padding: [20, 20] });
    } else if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }
  }, [routes, activeRouteId, routeCoords, startLocation, endLocation, events, selectedEvent, onSelectEvent, onSelectRouteId, userPosition, radiusKm]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-[#d4af37]/60 shadow-2xl shadow-black">
      {/* Filet décoratif intérieur façon cadre d'estampe */}
      <div className="absolute inset-1 rounded-xl border border-[#d4af37]/20 pointer-events-none z-10" />

      {/* Récipient Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
