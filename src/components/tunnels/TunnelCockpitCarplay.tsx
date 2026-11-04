import React, { useState } from 'react';
import {
  Navigation,
  ChevronLeft,
  ChevronRight,
  Clock,
  Wind,
  Layers,
  Zap,
  Trees,
  Edit3,
  Info,
  Sparkles,
} from 'lucide-react';
import type { TangoEvent, CityLocation, RouteResult } from '../../types/tango';
import { FRENCH_CITIES } from '../../data/frenchCities';
import { TangoMap } from '../TangoMap';
import { getGpsNavigationLinks } from '../../services/routingService';

interface TunnelCockpitCarplayProps {
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
  onSelectEvent: (evt: TangoEvent) => void;
}

export const TunnelCockpitCarplay: React.FC<TunnelCockpitCarplayProps> = ({
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
  onSelectEvent,
}) => {
  const [stopIdx, setStopIdx] = useState(0);

  const activeStop = events[stopIdx] || events[0] || null;

  const quickRoutes = [
    { s: 'Tours', e: 'Cannes', label: 'TOURS ➔ CANNES' },
    { s: 'Paris', e: 'Nice', label: 'PARIS ➔ NICE' },
    { s: 'Bordeaux', e: 'Lyon', label: 'BORDEAUX ➔ LYON' },
    { s: 'Lille', e: 'Marseille', label: 'LILLE ➔ MARSEILLE' },
  ];

  const handleLaunchCockpit = async (s = startCity, e = endCity) => {
    await onSearch(s, e, maxDetourKm, avoidTolls);
    setStopIdx(0);
    setStep(3);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-4">
      {/* ÉCRAN 1 : SÉLECTEUR AUTORADIO GÉANT (Zéro distraction) */}
      {step !== 3 ? (
        <div className="bg-[#1b1210] border-2 border-[#d4af37] rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                🚘 Mode Cockpit Autoradio & Conduite
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f5d77f] mt-0.5">
                CHOISISSEZ VOTRE DESTINATION
              </h2>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#120b0a] border border-[#d4af37]/50 text-xs font-mono font-bold text-amber-300">
              GROS BOUTONS • 1 CLIC
            </span>
          </div>

          {/* 4 Gros Pavés Tactiles Autoradio */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200/80 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              Lignes favorites (appui direct) :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickRoutes.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => {
                    setStartCity(q.s);
                    setEndCity(q.e);
                    handleLaunchCockpit(q.s, q.e);
                  }}
                  className="py-4 px-5 rounded-2xl bg-[#120b0a] hover:bg-[#8e1c2e] text-[#fce59e] border-2 border-[#d4af37]/50 hover:border-[#d4af37] font-display font-bold text-base sm:text-lg tracking-wider flex items-center justify-between transition cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  <span>{q.label}</span>
                  <Navigation className="w-5 h-5 text-[#d4af37] rotate-45" />
                </button>
              ))}
            </div>
          </div>

          {/* Saisie personnalisée grand format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#d4af37]/20">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-200 mb-1">
                DÉPART
              </label>
              <input
                type="text"
                value={startCity}
                onChange={(e) => setStartCity(e.target.value)}
                list="cockpit-cities"
                className="w-full px-4 py-4 rounded-2xl bg-[#120b0a] border-2 border-[#d4af37]/50 text-lg font-bold text-[#f7f2e7]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-200 mb-1">
                ARRIVÉE
              </label>
              <input
                type="text"
                value={endCity}
                onChange={(e) => setEndCity(e.target.value)}
                list="cockpit-cities"
                className="w-full px-4 py-4 rounded-2xl bg-[#120b0a] border-2 border-[#d4af37]/50 text-lg font-bold text-[#f7f2e7]"
              />
            </div>
          </div>

          <datalist id="cockpit-cities">
            {Object.values(FRENCH_CITIES).map((c) => (
              <option key={c.name} value={c.name} />
            ))}
          </datalist>

          {/* Pavés XXL Péages + Détour */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAvoidTolls(false)}
                className={`py-3.5 px-3 rounded-2xl font-bold text-sm border-2 flex items-center justify-center gap-2 cursor-pointer ${
                  !avoidTolls
                    ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37]'
                    : 'bg-[#120b0a] text-amber-200/70 border-[#d4af37]/30'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>AUTOROUTE</span>
              </button>
              <button
                type="button"
                onClick={() => setAvoidTolls(true)}
                className={`py-3.5 px-3 rounded-2xl font-bold text-sm border-2 flex items-center justify-center gap-2 cursor-pointer ${
                  avoidTolls
                    ? 'bg-emerald-900 text-emerald-100 border-emerald-400'
                    : 'bg-[#120b0a] text-amber-200/70 border-[#d4af37]/30'
                }`}
              >
                <Trees className="w-4 h-4" />
                <span>SANS PÉAGE</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[20, 35, 50].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setMaxDetourKm(km)}
                  className={`py-3.5 px-2 rounded-2xl font-mono font-bold text-sm border-2 cursor-pointer ${
                    maxDetourKm === km
                      ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37]'
                      : 'bg-[#120b0a] text-amber-200/70 border-[#d4af37]/30'
                  }`}
                >
                  ±{km} KM
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleLaunchCockpit()}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#8e1c2e] via-[#b8253d] to-[#731221] text-[#fce59e] font-display font-bold text-lg uppercase tracking-widest border-2 border-[#d4af37] shadow-2xl flex items-center justify-center gap-3 cursor-pointer"
          >
            <Navigation className="w-6 h-6 rotate-45" />
            <span>AFFICHER LE COCKPIT DE ROUTE</span>
          </button>
        </div>
      ) : (
        /* ÉCRAN COCKPIT EN ROUTE : Tableau de bord 2 colonnes (Escale Géante + Carte) */
        <div className="space-y-3">
          {/* Barre supérieure Tableau de bord */}
          <div className="bg-[#1b1210] border-2 border-[#d4af37]/70 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-[#8e1c2e] text-[#fce59e] font-mono font-bold text-sm border border-[#d4af37]">
                🚘 {startCity.toUpperCase()} ➔ {endCity.toUpperCase()}
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-amber-300">
                {routeResult?.totalDistanceKm} km • Détour max ±{maxDetourKm} km
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !avoidTolls;
                  setAvoidTolls(next);
                  onSelectRoute(next ? 'bis_toll_free' : 'primary');
                }}
                className="px-3 py-2 rounded-xl bg-[#120b0a] border border-[#d4af37]/50 text-xs font-bold text-[#fce59e] cursor-pointer"
              >
                {avoidTolls ? '🌳 Route Sans Péage' : '⚡ Route Autoroute'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-xl bg-[#120b0a] hover:bg-[#251815] border border-[#d4af37] text-xs font-bold text-[#f5d77f] flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>CHANGER TRAJET</span>
              </button>
            </div>
          </div>

          {/* Grille Cockpit Horizontale (Idéale écran autoradio ou smartphone paysage/portrait) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Panneau Gauche : Prochaine Escale en Très Gros Caractères */}
            <div className="lg:col-span-7 bg-[#1b1210] border-2 border-[#d4af37] rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-5">
              {activeStop ? (
                <>
                  {/* Navigation Escale Précédente / Suivante XXL */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#d4af37]/30">
                    <button
                      type="button"
                      disabled={stopIdx === 0}
                      onClick={() => setStopIdx((i) => Math.max(0, i - 1))}
                      className="py-3 px-4 rounded-2xl bg-[#120b0a] border-2 border-[#d4af37]/50 text-sm font-bold text-[#fce59e] disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>PRÉCÉDENTE</span>
                    </button>

                    <div className="text-center">
                      <span className="text-[11px] uppercase tracking-widest text-amber-200/70 block font-bold">
                        PROCHAINE ESCALE TANGO
                      </span>
                      <span className="text-base sm:text-lg font-mono font-extrabold text-[#f5d77f]">
                        {stopIdx + 1} / {events.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={stopIdx >= events.length - 1}
                      onClick={() => setStopIdx((i) => Math.min(events.length - 1, i + 1))}
                      className="py-3 px-4 rounded-2xl bg-[#120b0a] border-2 border-[#d4af37]/50 text-sm font-bold text-[#fce59e] disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>SUIVANTE</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Infos Géantes de l'Escale */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-3.5 py-1 rounded-xl bg-[#8e1c2e] text-[#fce59e] font-bold text-base uppercase tracking-wider border border-[#d4af37]">
                        📍 {activeStop.city}
                      </span>
                      {activeStop.detourKm !== undefined && (
                        <span className="px-3.5 py-1 rounded-xl bg-[#120b0a] text-amber-300 font-mono font-extrabold text-base border border-[#d4af37]/50">
                          DÉTOUR +{activeStop.detourKm} KM (~{activeStop.detourMinutes} MIN)
                        </span>
                      )}
                    </div>

                    <h3 className="font-tango-serif text-2xl sm:text-3xl font-bold text-[#f5d77f] leading-tight">
                      {activeStop.title}
                    </h3>

                    {/* Pavés d'infos rapides très lisibles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="bg-[#120b0a] p-3 rounded-2xl border border-[#d4af37]/30">
                        <div className="text-[10px] uppercase text-amber-200/60 font-bold">HORAIRES</div>
                        <div className="text-sm sm:text-base font-mono font-bold text-[#f7f2e7] flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-4 h-4 text-[#d4af37]" />
                          {activeStop.startTime} - {activeStop.endTime}
                        </div>
                      </div>

                      <div className="bg-[#120b0a] p-3 rounded-2xl border border-[#d4af37]/30">
                        <div className="text-[10px] uppercase text-amber-200/60 font-bold">PARQUET / SOL</div>
                        <div className="text-sm font-bold text-amber-100 truncate flex items-center gap-1.5 mt-0.5">
                          <Layers className="w-4 h-4 text-[#d4af37] shrink-0" />
                          <span className="truncate">{activeStop.floor}</span>
                        </div>
                      </div>

                      <div className="bg-[#120b0a] p-3 rounded-2xl border border-[#d4af37]/30 col-span-2 sm:col-span-1">
                        <div className="text-[10px] uppercase text-amber-200/60 font-bold">CONFORT & ENTRÉE</div>
                        <div className="text-sm font-bold text-[#f5d77f] flex items-center gap-2 mt-0.5">
                          <span>{activeStop.price}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-sky-300">
                            <Wind className="w-4 h-4" />
                            {activeStop.airConditioning ? 'Clim ❄️' : 'Sans clim'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Boutons Géants GPS / Fiche en bas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <a
                      href={getGpsNavigationLinks(activeStop).waze}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-4 px-4 rounded-2xl bg-[#8e1c2e] hover:bg-[#a82237] text-[#fce59e] border-2 border-[#d4af37] font-display font-bold text-base text-center flex items-center justify-center gap-2 shadow-xl transition"
                    >
                      <Navigation className="w-5 h-5 rotate-45" />
                      <span>WAZE DIRECT</span>
                    </a>

                    <a
                      href={getGpsNavigationLinks(activeStop).googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-4 px-4 rounded-2xl bg-[#120b0a] hover:bg-[#251815] text-[#fce59e] border-2 border-[#d4af37] font-display font-bold text-base text-center flex items-center justify-center gap-2 shadow-xl transition"
                    >
                      <span>GOOGLE MAPS</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onSelectEvent(activeStop)}
                      className="py-4 px-4 rounded-2xl bg-[#120b0a] hover:bg-[#251815] text-amber-200 border-2 border-[#d4af37]/50 font-bold text-sm uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-[#d4af37]" />
                      <span>DÉTAILS SALON</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <p className="text-lg font-bold text-[#f5d77f]">Aucune escale dans ce rayon</p>
                  <button
                    type="button"
                    onClick={() => setMaxDetourKm(55)}
                    className="py-3 px-5 rounded-2xl bg-[#8e1c2e] text-[#fce59e] font-bold border border-[#d4af37]"
                  >
                    PASSER LE DÉTOUR À 55 KM
                  </button>
                </div>
              )}
            </div>

            {/* Panneau Droit : Carte GPS Centrée */}
            <div className="lg:col-span-5 h-[360px] lg:h-auto min-h-[360px]">
              <TangoMap
                startLocation={startLocation}
                endLocation={endLocation}
                routeCoords={routeResult?.coordinates || []}
                routes={routeResult?.routes || []}
                activeRouteId={activeRouteId}
                onSelectRouteId={onSelectRoute}
                events={events}
                selectedEvent={activeStop}
                onSelectEvent={(evt) => {
                  const idx = events.findIndex((e) => e.id === evt.id);
                  if (idx !== -1) setStopIdx(idx);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
