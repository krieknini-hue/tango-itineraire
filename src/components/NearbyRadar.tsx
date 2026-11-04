import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LocateFixed, Loader2, AlertCircle, Moon, CalendarDays, Search } from 'lucide-react';
import { TangoMap } from './TangoMap';
import { EventCard } from './EventCard';
import {
  NEARBY_RADII,
  UPCOMING_DAYS,
  findTonightNearby,
  findUpcomingNearby,
  formatEventDate,
  getCurrentPosition,
  type NearbyEvent,
  type NearbyRadius,
  type UserPosition,
} from '../modules/nearby';
import { resolveCity } from '../services/routingService';
import type { TangoEvent } from '../types/tango';

/** Gros bouton d'accueil « Ce soir autour de moi » */
export const NearbyLaunchButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full min-h-[56px] px-4 rounded-2xl bg-gradient-to-r from-[#8e1c2e] to-[#6d1320] hover:from-[#aa2137] hover:to-[#8e1c2e] border-2 border-[#d4af37] text-[#fce59e] font-display font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-black/50 flex items-center justify-center gap-2.5 transition cursor-pointer active:scale-[0.99]"
  >
    <span className="text-xl leading-none" aria-hidden>📍</span>
    Ce soir autour de moi
  </button>
);

interface NearbyPanelProps {
  events: TangoEvent[];
  selectedEvent: TangoEvent | null;
  onSelectEvent: (evt: TangoEvent) => void;
  onClose: () => void;
}

const ResultList: React.FC<{
  list: NearbyEvent[];
  showDate: boolean;
  selectedEvent: TangoEvent | null;
  onSelectEvent: (evt: TangoEvent) => void;
}> = ({ list, showDate, selectedEvent, onSelectEvent }) => (
  <div className="space-y-3">
    {list.map((evt) => (
      <div key={evt.id} className="space-y-1">
        <div className="flex items-center justify-between px-1 text-[11px] font-mono">
          <span className="text-[#fce59e] font-bold">📍 à {evt.distanceKm} km</span>
          {showDate && <span className="text-amber-200/80 capitalize">{formatEventDate(evt.date)}</span>}
        </div>
        <EventCard event={evt} isSelected={selectedEvent?.id === evt.id} onSelect={onSelectEvent} />
      </div>
    ))}
  </div>
);

/** Radar local : géoloc ou ville saisie → rayon 15/30/50 km → ce soir + 7 prochains jours */
export const NearbyPanel: React.FC<NearbyPanelProps> = ({ events, selectedEvent, onSelectEvent, onClose }) => {
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [radius, setRadius] = useState<NearbyRadius>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualCity, setManualCity] = useState('');

  const locate = useCallback(() => {
    setLoading(true);
    setError(null);
    getCurrentPosition()
      .then((p) => {
        setPosition(p);
        setPlaceLabel('ta position');
      })
      .catch((e: Error) => setError(`${e.message} Tu peux saisir une ville ci-dessous.`))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = manualCity.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const loc = await resolveCity(q);
      if (loc) {
        setPosition({ lat: loc.lat, lng: loc.lng });
        setPlaceLabel(loc.name);
      } else {
        setError(`Ville introuvable : « ${q} ». Essaie un autre nom ou un code postal proche.`);
      }
    } catch {
      setError('Recherche impossible (connexion ?). Réessaie dans un instant.');
    } finally {
      setLoading(false);
    }
  };

  const tonight = useMemo(
    () => (position ? findTonightNearby(events, position, radius) : []),
    [events, position, radius],
  );
  const upcoming = useMemo(
    () => (position ? findUpcomingNearby(events, position, radius) : []),
    [events, position, radius],
  );
  const mapEvents = useMemo(() => [...tonight, ...upcoming], [tonight, upcoming]);

  return (
    <section className="space-y-3" aria-label="Ce soir autour de moi">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] px-3 rounded-xl bg-[#1b1210] border border-[#d4af37]/40 text-[#f5d77f] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Mes itinéraires
        </button>
        <button
          type="button"
          onClick={locate}
          disabled={loading}
          className="min-h-[44px] px-3 rounded-xl bg-[#1b1210] border border-[#d4af37]/40 text-[#f5d77f] text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <LocateFixed className="w-4 h-4" /> Me géolocaliser
        </button>
      </div>

      {/* Saisie manuelle (sans géolocalisation) */}
      <form onSubmit={submitManual} className="flex gap-2">
        <input
          type="text"
          value={manualCity}
          onChange={(e) => setManualCity(e.target.value)}
          placeholder="Ou saisis une ville (ex : Tours)"
          autoComplete="address-level2"
          aria-label="Ville ou lieu de recherche"
          className="flex-1 min-w-0 min-h-[48px] px-3 rounded-xl bg-[#150d0b] border border-[#d4af37]/40 text-[#f7f2e7] text-base focus:outline-none focus:border-[#d4af37]"
        />
        <button
          type="submit"
          disabled={loading || !manualCity.trim()}
          className="min-h-[48px] px-4 rounded-xl bg-[#8e1c2e] hover:bg-[#aa2137] disabled:opacity-40 text-[#fce59e] border border-[#d4af37]/70 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" /> Chercher
        </button>
      </form>

      {/* Sélecteur de rayon */}
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Rayon de recherche">
        {NEARBY_RADII.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={radius === r}
            onClick={() => setRadius(r)}
            className={`min-h-[48px] rounded-xl border text-sm font-bold font-mono transition cursor-pointer ${
              radius === r
                ? 'bg-gradient-to-b from-[#8e1c2e] to-[#6d1320] text-[#fce59e] border-[#d4af37] shadow-md'
                : 'bg-[#150d0b] text-amber-200/70 border-[#d4af37]/25 hover:border-[#d4af37]/60'
            }`}
          >
            {r} km
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-[#1b1210] border border-[#d4af37]/35 rounded-xl p-4 text-sm text-amber-100 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" /> Localisation en cours…
        </div>
      )}

      {error && (
        <div className="bg-[#3a0d14] border border-rose-500 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {position && (
        <>
          <div className="h-[300px] sm:h-[380px]">
            <TangoMap
              startLocation={null}
              endLocation={null}
              routeCoords={[]}
              events={mapEvents}
              selectedEvent={selectedEvent}
              onSelectEvent={onSelectEvent}
              userPosition={position}
              radiusKm={radius}
            />
          </div>

          <h2 className="text-xs font-display font-bold text-[#f5d77f] uppercase tracking-wider flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-[#d4af37]" />
            Ce soir · {tonight.length} à moins de {radius} km de {placeLabel}
          </h2>
          {tonight.length === 0 ? (
            <div className="bg-[#1b1210] rounded-2xl p-4 border border-[#d4af37]/35 text-center text-xs text-amber-200/80">
              Rien dans les 12 prochaines heures{radius < 50 ? ' — élargis le rayon ?' : '.'}
            </div>
          ) : (
            <ResultList list={tonight} showDate={false} selectedEvent={selectedEvent} onSelectEvent={onSelectEvent} />
          )}

          <h2 className="text-xs font-display font-bold text-[#f5d77f] uppercase tracking-wider flex items-center gap-1.5 pt-1">
            <CalendarDays className="w-3.5 h-3.5 text-[#d4af37]" />
            Prochains {UPCOMING_DAYS} jours · {upcoming.length}
          </h2>
          {upcoming.length === 0 ? (
            <div className="bg-[#1b1210] rounded-2xl p-4 border border-[#d4af37]/35 text-center text-xs text-amber-200/80">
              Aucun événement dans les {UPCOMING_DAYS} prochains jours dans ce rayon.
            </div>
          ) : (
            <ResultList list={upcoming} showDate selectedEvent={selectedEvent} onSelectEvent={onSelectEvent} />
          )}
        </>
      )}
    </section>
  );
};
