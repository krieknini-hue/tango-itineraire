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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { TangoEvent, CityLocation, RouteResult } from '../../types/tango';
import { FRENCH_CITIES } from '../../data/frenchCities';
import { FileteadoCorner, BandoneonIcon, OchoLoader } from '../FileteadoOrnaments';
import { TangoMap } from '../TangoMap';
import { EventCard } from '../EventCard';
import { RouteFiltersBar } from '../RouteFiltersBar';
import { formatDurationToTandas } from '../../modules/tangoMetrics';

interface TunnelGuichetExpressProps {
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  startCity: string;
  setStartCity: (city: string) => void;
  endCity: string;
  setEndCity: (city: string) => void;
  date?: string;
  setDate?: (date: string) => void;
  maxDetourKm: number;
  setMaxDetourKm: (km: number) => void;
  avoidTolls: boolean;
  setAvoidTolls: (avoid: boolean) => void;
  overnightOnly?: boolean;
  setOvernightOnly?: (v: boolean) => void;
  discoveryMode?: boolean;
  setDiscoveryMode?: (v: boolean) => void;
  onOpenNearby?: () => void;
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
  date,
  setDate,
  maxDetourKm,
  setMaxDetourKm,
  avoidTolls,
  setAvoidTolls,
  overnightOnly = false,
  setOvernightOnly,
  discoveryMode = false,
  setDiscoveryMode,
  onOpenNearby,
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
  const [viewTab, setViewTab] = useState<'billets' | 'carte'>('billets');
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);

  const handleOpenCurtain = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(startCity, endCity, maxDetourKm, avoidTolls);
    setStep(3);
  };

  const activeFiltersCount = (overnightOnly ? 1 : 0) + (discoveryMode ? 1 : 0) + (avoidTolls ? 1 : 0);

  return (
    <div className={`w-full mx-auto space-y-4 transition-all duration-300 ${
      step === 3 ? 'max-w-6xl' : 'max-w-3xl'
    }`}>
      {/* ÉCRAN 1 : LE GUICHET D'ACCUEIL (1 seule question simple, zéro surcharge) */}
      {step === 1 && (
        <div className="relative bg-[#1b1210] rounded-3xl border-2 border-[#d4af37] p-6 sm:p-10 shadow-2xl text-center space-y-6 overflow-hidden">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileteadoCorner position="top-left" className="w-9 h-9 text-[#d4af37]/70" />
          </div>
          <div className="absolute top-3 right-3 pointer-events-none">
            <FileteadoCorner position="top-right" className="w-9 h-9 text-[#d4af37]/70" />
          </div>
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <FileteadoCorner position="bottom-left" className="w-9 h-9 text-[#d4af37]/50" />
          </div>
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <FileteadoCorner position="bottom-right" className="w-9 h-9 text-[#d4af37]/50" />
          </div>

          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8e1c2e] to-[#3a0a12] border-2 border-[#d4af37] flex items-center justify-center shadow-xl">
            <BandoneonIcon className="w-8 h-8 text-[#f5d77f]" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#120b0a] text-[#f5d77f] border border-[#d4af37]/40">
              Guichet Express
            </span>
            <h2 className="font-display text-xl sm:text-3xl font-bold text-[#f5d77f] pt-1">
              Bonsoir Tanguero, que cherches-tu ?
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-md mx-auto">
              Choisis simplement ta situation en un clic :
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Option 1 : Je suis sur la route */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#8e1c2e] to-[#4d0d17] hover:from-[#a42035] hover:to-[#63111e] border-2 border-[#d4af37] text-left space-y-2 shadow-xl transition cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🚗</span>
                <ArrowRight className="w-5 h-5 text-[#f5d77f] group-hover:translate-x-1 transition" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#fce59e] uppercase">
                Je suis sur la route
              </h3>
              <p className="text-xs text-amber-100/85">
                Trouver toutes les milongas sur mon trajet entre deux villes.
              </p>
            </button>

            {/* Option 2 : Autour d'une ville / de ma position */}
            <button
              type="button"
              onClick={() => {
                if (onOpenNearby) {
                  onOpenNearby();
                } else {
                  setStep(2);
                }
              }}
              className="group p-5 sm:p-6 rounded-2xl bg-[#120b0a] hover:bg-[#241614] border-2 border-[#d4af37]/50 hover:border-[#d4af37] text-left space-y-2 shadow-xl transition cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">📍</span>
                <ArrowRight className="w-5 h-5 text-[#d4af37] group-hover:translate-x-1 transition" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#f5d77f] uppercase">
                Autour d'une ville
              </h3>
              <p className="text-xs text-amber-200/75">
                Voir les parquets ouverts ce soir et ces 7 prochains jours autour de moi.
              </p>
            </button>
          </div>

          {/* Accès direct démo 1 clic */}
          <div className="pt-3 border-t border-[#d4af37]/20 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-amber-200/60 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              Trajets rapides :
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
                className="px-3 py-1.5 rounded-full bg-[#120b0a] hover:bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/40 font-bold cursor-pointer transition"
              >
                {item.s} ➔ {item.e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ÉCRAN 2 : BILLET DE SAISIE DU TRAJET ULTRA-SIMPLE */}
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
              <span>Retour</span>
            </button>
            <span className="text-xs font-display font-bold uppercase text-[#f5d77f] flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-[#d4af37]" />
              Ton Trajet Milonguero
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-amber-200 mb-1.5">
                🟢 Ville de départ
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
                🔴 Ville d'arrivée
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

          <datalist id="guichet-cities">
            {Object.values(FRENCH_CITIES).map((c) => (
              <option key={c.name} value={c.name} />
            ))}
          </datalist>

          <div className="grid grid-cols-3 gap-2">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8e1c2e] via-[#aa2137] to-[#731221] text-[#fce59e] font-display font-bold text-base uppercase tracking-wider border-2 border-[#d4af37] shadow-xl flex items-center justify-center gap-2 cursor-pointer transition hover:scale-[1.01]"
          >
            {isLoading ? (
              <OchoLoader size={28} label="Calcul de la route Tango..." />
            ) : (
              <>
                <Compass className="w-5 h-5" />
                <span>Voir les milongas sur ma route</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ÉCRAN 3 : RÉSULTATS ÉPURÉS + TIROIR REPLIABLE DE FILTRES */}
      {step === 3 && (
        <div className="space-y-3">
          {/* Barre supérieure compacte avec Tiroir d'options repliable */}
          <div className="bg-[#1b1210] border-2 border-[#d4af37]/60 rounded-2xl p-3 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Résumé du trajet cliquable pour revenir à l'étape 2 */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-left group cursor-pointer min-w-0"
              >
                <span className="p-2 rounded-xl bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37] shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#f5d77f] flex items-center gap-1.5 truncate">
                    <span>
                      {startCity} ➔ {endCity}
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#120b0a] text-amber-300 border border-[#d4af37]/30">
                      ±{maxDetourKm} km
                    </span>
                    {routeResult && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#242436] text-[#F4A261] border border-[#F4A261]/40 hidden sm:inline">
                        {formatDurationToTandas(routeResult.totalDurationMinutes).shortBadgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-200/70 underline group-hover:text-[#fce59e]">
                    Modifier les villes
                  </p>
                </div>
              </button>

              {/* Boutons : Tiroir Filtres + Switch Billets / Carte */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsFiltersDrawerOpen((v) => !v)}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    isFiltersDrawerOpen || activeFiltersCount > 0
                      ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37]'
                      : 'bg-[#120b0a] text-amber-200 border-[#d4af37]/40'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Options</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 rounded-full text-[10px] bg-black/50 text-[#fce59e]">
                      {activeFiltersCount}
                    </span>
                  )}
                  {isFiltersDrawerOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Switch Billets / Carte visible uniquement sur smartphone (< 768px). Sur tablette & desktop : vue scindée côte à côte ! */}
                <div className="flex md:hidden bg-[#120b0a] p-1 rounded-xl border border-[#d4af37]/40">
                  <button
                    type="button"
                    onClick={() => setViewTab('billets')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      viewTab === 'billets' ? 'bg-[#8e1c2e] text-[#fce59e]' : 'text-amber-200/60'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>{events.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab('carte')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      viewTab === 'carte' ? 'bg-[#8e1c2e] text-[#fce59e]' : 'text-amber-200/60'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>Carte</span>
                  </button>
                </div>
              </div>
            </div>

            {/* TIROIR REPLIABLE D'OPTIONS (Péage, Détour, Date, Logistique Nomade & Découverte) */}
            {isFiltersDrawerOpen && (
              <div className="pt-3 border-t border-[#d4af37]/25 space-y-3 bg-[#120b0a] p-3 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Choix Autoroute vs Sans Péage */}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAvoidTolls(false);
                        onSelectRoute('primary');
                      }}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        !avoidTolls
                          ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37]'
                          : 'bg-[#1b1210] text-amber-200/70 border-[#d4af37]/30'
                      }`}
                    >
                      ⚡ Autoroute
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvoidTolls(true);
                        onSelectRoute('bis_toll_free');
                      }}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        avoidTolls
                          ? 'bg-emerald-900 text-emerald-100 border-emerald-400'
                          : 'bg-[#1b1210] text-amber-200/70 border-[#d4af37]/30'
                      }`}
                    >
                      🌳 Sans péage (0 €)
                    </button>
                  </div>

                  {/* Choix rapide du détour */}
                  <div className="flex gap-1.5">
                    {[15, 30, 50].map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => setMaxDetourKm(km)}
                        className={`flex-1 py-2 px-2 rounded-xl text-xs font-mono font-bold border cursor-pointer ${
                          maxDetourKm === km
                            ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37]'
                            : 'bg-[#1b1210] text-amber-200/70 border-[#d4af37]/30'
                        }`}
                      >
                        ±{km} km
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date du trajet si fournie */}
                {date && setDate && (
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-amber-200/80 font-semibold">📅 Date du trajet :</span>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#1b1210] border border-[#d4af37]/40 text-xs font-bold text-[#f7f2e7]"
                    />
                  </div>
                )}

                {/* Filtres Nomades (Nuitée van & Mode Découverte) rangés dans ce tiroir */}
                {setOvernightOnly && setDiscoveryMode && (
                  <RouteFiltersBar
                    overnightOnly={overnightOnly}
                    setOvernightOnly={setOvernightOnly}
                    discoveryMode={discoveryMode}
                    setDiscoveryMode={setDiscoveryMode}
                  />
                )}
              </div>
            )}
          </div>

          {/* VUE SCINDÉE (SPLIT-VIEW) SUR TABLETTE & DESKTOP (>= 768px) / VUE ONGLETS SUR SMARTPHONE (< 768px) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Colonne Gauche : Liste des étapes & milongas (visible toujours sur >= 768px, ou sur mobile si onglet billets actif) */}
            <div className={`space-y-3 md:col-span-5 ${viewTab === 'carte' ? 'hidden md:block' : 'block'}`}>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-display font-bold text-[#f5d77f] uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#d4af37]" />
                  Étapes & Milongas sur la route
                </span>
                <span className="text-xs text-amber-200/60 font-mono font-medium">
                  {events.length} salon{events.length > 1 ? 's' : ''}
                </span>
              </div>

              {events.length === 0 ? (
                <div className="bg-[#1b1210] rounded-2xl p-6 border border-[#d4af37]/35 text-center space-y-2 shadow-lg">
                  <p className="font-bold text-[#f5d77f] text-sm">
                    Aucune milonga trouvée sur ce trajet
                  </p>
                  <p className="text-xs text-amber-200/80">
                    Ouvre les options ci-dessus pour augmenter le rayon de détour (±50 km) ou changer d'itinéraire.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMaxDetourKm(50)}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-[#8e1c2e] hover:bg-[#aa2137] text-[#fce59e] border border-[#d4af37]/60 font-bold text-xs uppercase cursor-pointer"
                  >
                    Passer à ±50 km
                  </button>
                </div>
              ) : (
                <div className="space-y-3 md:max-h-[calc(100vh-210px)] md:overflow-y-auto pr-1">
                  {events.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      isSelected={selectedEvent?.id === evt.id}
                      onSelect={onSelectEvent}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Colonne Droite : Carte Interactive Leaflet (visible toujours sur >= 768px, ou sur mobile si onglet carte actif) */}
            <div className={`md:col-span-7 h-[460px] md:h-[calc(100vh-210px)] md:min-h-[500px] md:sticky md:top-20 ${
              viewTab === 'billets' ? 'hidden md:block' : 'block'
            }`}>
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
          </div>
        </div>
      )}
    </div>
  );
};
