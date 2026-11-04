import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Ticket,
  Map,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import type { TangoEvent, CityLocation, RouteResult } from '../../types/tango';
import { FRENCH_CITIES } from '../../data/frenchCities';
import { FileteadoCorner, BandoneonIcon } from '../FileteadoOrnaments';
import { TangoMap } from '../TangoMap';
import { EventCard } from '../EventCard';

interface TunnelGuichetExpressProps {
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  startCity: string;
  setStartCity: (city: string) => void;
  endCity: string;
  setEndCity: (city: string) => void;
  maxDetourKm: number;
  setMaxDetourKm: (km: number) => void;
  avoidTolls: boolean;
  setAvoidTolls: (avoid: boolean) => void;
  onSearch: (sCity?: string, eCity?: string, detour?: number, isAvoidTolls?: boolean) => Promise<void>;
  isLoading: boolean;
  routeResult: RouteResult | null;
  activeRouteId: string;
  onSelectRoute: (routeId: string) => void;
  startLocation: CityLocation | null;
  endLocation: CityLocation | null;
  events: TangoEvent[];
  selectedEvent: TangoEvent | null;
  onSelectEvent: (evt: TangoEvent) => void;
}

export const TunnelGuichetExpress: React.FC<TunnelGuichetExpressProps> = ({
  step,
  setStep,
  startCity,
  setStartCity,
  endCity,
  setEndCity,
  maxDetourKm,
  setMaxDetourKm,
  avoidTolls,
  setAvoidTolls,
  onSearch,
  isLoading,
  routeResult,
  activeRouteId,
  onSelectRoute,
  startLocation,
  endLocation,
  events,
  selectedEvent,
  onSelectEvent,
}) => {
  const [searchMode, setSearchMode] = useState<'route' | 'around'>('route');
  const [viewTab, setViewTab] = useState<'billets' | 'carte'>('billets');

  const handleOpenCurtain = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEnd = searchMode === 'around' ? startCity : endCity;
    if (searchMode === 'around') {
      setEndCity(startCity);
      setMaxDetourKm(60);
    }
    await onSearch(startCity, targetEnd, searchMode === 'around' ? 60 : maxDetourKm, avoidTolls);
    setStep(3);
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4">
      {/* ÉCRAN 1 : LE GUICHET D'ACCUEIL (1 seule question simple) */}
      {step === 1 && (
        <div className="relative bg-[#1b1210] rounded-3xl border-2 border-[#d4af37] p-6 sm:p-10 shadow-2xl text-center space-y-6 overflow-hidden">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileteadoCorner position="top-left" className="w-10 h-10 text-[#d4af37]/70" />
          </div>
          <div className="absolute top-3 right-3 pointer-events-none">
            <FileteadoCorner position="top-right" className="w-10 h-10 text-[#d4af37]/70" />
          </div>
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <FileteadoCorner position="bottom-left" className="w-10 h-10 text-[#d4af37]/50" />
          </div>
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <FileteadoCorner position="bottom-right" className="w-10 h-10 text-[#d4af37]/50" />
          </div>

          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8e1c2e] to-[#3a0a12] border-2 border-[#d4af37] flex items-center justify-center shadow-xl">
            <BandoneonIcon className="w-8 h-8 text-[#f5d77f]" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#120b0a] text-[#f5d77f] border border-[#d4af37]/40">
              Guichet Express • Entrada de Milonga
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#f5d77f]">
              Bonsoir Tanguero, que cherches-tu ?
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-md mx-auto">
              Pas de formulaire compliqué : choisis simplement ta situation en un clic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchMode('route');
                setStep(2);
              }}
              className="group p-6 rounded-2xl bg-gradient-to-br from-[#8e1c2e] to-[#4d0d17] hover:from-[#a42035] hover:to-[#63111e] border-2 border-[#d4af37] text-left space-y-2 shadow-xl transition cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🚗</span>
                <ArrowRight className="w-5 h-5 text-[#f5d77f] group-hover:translate-x-1 transition" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#fce59e] uppercase">
                Je suis sur la route
              </h3>
              <p className="text-xs text-amber-100/85">
                Trouver toutes les milongas sur mon trajet entre deux villes (avec ou sans péage).
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMode('around');
                setStep(2);
              }}
              className="group p-6 rounded-2xl bg-[#120b0a] hover:bg-[#241614] border-2 border-[#d4af37]/50 hover:border-[#d4af37] text-left space-y-2 shadow-xl transition cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">📍</span>
                <ArrowRight className="w-5 h-5 text-[#d4af37] group-hover:translate-x-1 transition" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#f5d77f] uppercase">
                Autour d'une ville
              </h3>
              <p className="text-xs text-amber-200/75">
                Voir directement les parquets et salons ouverts autour de ma position ce soir.
              </p>
            </button>
          </div>

          {/* Accès direct démo 1 clic */}
          <div className="pt-2 border-t border-[#d4af37]/20 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-amber-200/60 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              Accès direct 1 clic :
            </span>
            {[
              { s: 'Tours', e: 'Cannes' },
              { s: 'Paris', e: 'Nice' },
              { s: 'Bordeaux', e: 'Lyon' },
            ].map((item) => (
              <button
                key={`${item.s}-${item.e}`}
                type="button"
                onClick={async () => {
                  setStartCity(item.s);
                  setEndCity(item.e);
                  await onSearch(item.s, item.e, maxDetourKm, avoidTolls);
                  setStep(3);
                }}
                className="px-3 py-1 rounded-full bg-[#120b0a] hover:bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/40 font-bold cursor-pointer transition"
              >
                {item.s} ➔ {item.e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ÉCRAN 2 : BILLET DE SAISIE ULTRA-RAPIDE */}
      {step === 2 && (
        <form
          onSubmit={handleOpenCurtain}
          className="relative bg-[#1b1210] rounded-3xl border-2 border-[#d4af37] p-6 sm:p-8 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#d4af37]/25 pb-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-amber-200 hover:text-[#f5d77f] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au guichet</span>
            </button>
            <span className="text-xs font-display font-bold uppercase text-[#f5d77f] flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-[#d4af37]" />
              {searchMode === 'route' ? 'Ton Trajet Milonguero' : 'Autour de ta Ville'}
            </span>
          </div>

          {searchMode === 'route' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-amber-200 mb-1.5">
                  Départ
                </label>
                <input
                  type="text"
                  value={startCity}
                  onChange={(e) => setStartCity(e.target.value)}
                  list="guichet-cities"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#120b0a] border-2 border-[#d4af37]/50 text-base font-bold text-[#f7f2e7]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-amber-200 mb-1.5">
                  Arrivée
                </label>
                <input
                  type="text"
                  value={endCity}
                  onChange={(e) => setEndCity(e.target.value)}
                  list="guichet-cities"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#120b0a] border-2 border-[#d4af37]/50 text-base font-bold text-[#f7f2e7]"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase text-amber-200 mb-1.5">
                Dans quelle ville (ou étape) es-tu ce soir ?
              </label>
              <input
                type="text"
                value={startCity}
                onChange={(e) => {
                  setStartCity(e.target.value);
                  setEndCity(e.target.value);
                }}
                list="guichet-cities"
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-[#120b0a] border-2 border-[#d4af37]/50 text-base font-bold text-[#f7f2e7]"
              />
            </div>
          )}

          <datalist id="guichet-cities">
            {Object.values(FRENCH_CITIES).map((c) => (
              <option key={c.name} value={c.name} />
            ))}
          </datalist>

          {searchMode === 'route' && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { km: 15, label: 'Détour 15 km' },
                { km: 30, label: 'Détour 30 km' },
                { km: 50, label: 'Détour 50 km' },
              ].map((d) => (
                <button
                  key={d.km}
                  type="button"
                  onClick={() => setMaxDetourKm(d.km)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs border cursor-pointer transition ${
                    maxDetourKm === d.km
                      ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37]'
                      : 'bg-[#120b0a] text-amber-200/75 border-[#d4af37]/30'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8e1c2e] via-[#aa2137] to-[#731221] text-[#fce59e] font-display font-bold text-base uppercase tracking-wider border-2 border-[#d4af37] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-5 h-5" />
            <span>Ouvrir le rideau des milongas</span>
          </button>
        </form>
      )}

      {/* ÉCRAN 3 : LE SALON OUVERT (Barre repliée en haut + 100% place aux résultats) */}
      {step === 3 && (
        <div className="space-y-3">
          {/* Barre repliée ultra-compacte */}
          <div className="bg-[#1b1210] border-2 border-[#d4af37]/60 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-xl">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <span className="p-2 rounded-xl bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <div className="font-bold text-sm text-[#f5d77f] flex items-center gap-1.5">
                  <span>
                    {startCity} ➔ {endCity}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#120b0a] text-amber-300 border border-[#d4af37]/30">
                    ±{maxDetourKm} km
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/70 underline group-hover:text-[#fce59e]">
                  Cliquer ici pour changer le trajet ou le détour
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              {/* Switch Rapide Autoroute / Sans Péage */}
              <button
                type="button"
                onClick={() => {
                  const nextAvoid = !avoidTolls;
                  setAvoidTolls(nextAvoid);
                  onSelectRoute(nextAvoid ? 'bis_toll_free' : 'primary');
                }}
                className="px-3 py-2 rounded-xl bg-[#120b0a] border border-[#d4af37]/40 text-xs font-bold text-[#fce59e] flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{avoidTolls ? '🌳 Sans péage' : '⚡ Autoroute'}</span>
              </button>

              {/* Switch Billets / Carte */}
              <div className="flex bg-[#120b0a] p-1 rounded-xl border border-[#d4af37]/40">
                <button
                  type="button"
                  onClick={() => setViewTab('billets')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    viewTab === 'billets' ? 'bg-[#8e1c2e] text-[#fce59e]' : 'text-amber-200/60'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Billets ({events.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('carte')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    viewTab === 'carte' ? 'bg-[#8e1c2e] text-[#fce59e]' : 'text-amber-200/60'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Carte</span>
                </button>
              </div>
            </div>
          </div>

          {viewTab === 'billets' ? (
            <div className="space-y-3">
              {events.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  isSelected={selectedEvent?.id === evt.id}
                  onSelect={onSelectEvent}
                />
              ))}
            </div>
          ) : (
            <div className="h-[460px]">
              <TangoMap
                startLocation={startLocation}
                endLocation={endLocation}
                routeCoords={routeResult?.coordinates || []}
                routes={routeResult?.routes || []}
                activeRouteId={activeRouteId}
                onSelectRouteId={onSelectRoute}
                events={events}
                selectedEvent={selectedEvent}
                onSelectEvent={onSelectEvent}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
