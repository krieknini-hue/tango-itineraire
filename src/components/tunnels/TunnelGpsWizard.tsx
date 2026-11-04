import React, { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  Zap,
  Trees,
  Navigation,
  Sparkles,
  Check,
  Edit3,
  Clock,
  Wind,
  Layers,
  Disc3,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
} from 'lucide-react';
import type { TangoEvent, CityLocation, RouteResult } from '../../types/tango';
import { FRENCH_CITIES } from '../../data/frenchCities';
import { FileteadoCorner } from '../FileteadoOrnaments';
import { TangoMap } from '../TangoMap';
import { EventCard } from '../EventCard';
import { getGpsNavigationLinks } from '../../services/routingService';

interface TunnelGpsWizardProps {
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  startCity: string;
  setStartCity: (city: string) => void;
  endCity: string;
  setEndCity: (city: string) => void;
  date: string;
  setDate: (date: string) => void;
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

export const TunnelGpsWizard: React.FC<TunnelGpsWizardProps> = ({
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
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);
  const [resultTab, setResultTab] = useState<'escales' | 'liste'>('escales');

  const presets = [
    { start: 'Tours', end: 'Cannes', label: 'Tours ➔ Cannes' },
    { start: 'Paris', end: 'Nice', label: 'Paris ➔ Nice' },
    { start: 'Bordeaux', end: 'Lyon', label: 'Bordeaux ➔ Lyon' },
    { start: 'Lille', end: 'Marseille', label: 'Lille ➔ Marseille' },
  ];

  const detourPresets = [
    { km: 15, label: 'Sur la route', sub: '±15 km (~15 min)', icon: '🎯' },
    { km: 30, label: 'Détour confort', sub: '±30 km (~30 min)', icon: '🚗' },
    { km: 45, label: 'Détour passion', sub: '±45 km (~45 min)', icon: '💃' },
    { km: 60, label: 'Grand rayon', sub: '±60 km (~1h)', icon: '🌟' },
  ];

  const handleGoToStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(startCity, endCity, maxDetourKm, avoidTolls);
    setStep(2);
  };

  const handleQuickPreset = async (s: string, end: string) => {
    setStartCity(s);
    setEndCity(end);
    await onSearch(s, end, maxDetourKm, avoidTolls);
    setStep(2);
  };

  const currentEscale = events[activeCarouselIdx] || events[0] || null;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4">
      {/* Barre de progression du Tunnel (3 étapes très claires) */}
      <div className="bg-[#1b1210] border border-[#d4af37]/40 rounded-2xl p-3 shadow-lg">
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, title: '1. Où vas-tu ?' },
            { num: 2, title: '2. Quel trajet ?' },
            { num: 3, title: `3. Milongas (${events.length})` },
          ].map((item) => {
            const isCurrent = step === item.num;
            const isDone = step > item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => setStep(item.num as 1 | 2 | 3)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  isCurrent
                    ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37] shadow-md scale-[1.01]'
                    : isDone
                    ? 'bg-[#251815] text-emerald-300 border-emerald-500/40'
                    : 'bg-[#120b0a] text-amber-200/50 border-[#d4af37]/20'
                }`}
              >
                {isDone && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                <span className="truncate">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ÉTAPE 1 : OÙ VAS-TU ? (Zéro distraction, gros boutons) */}
      {step === 1 && (
        <div className="relative bg-[#1b1210] rounded-3xl border-2 border-[#d4af37]/60 p-5 sm:p-7 shadow-2xl space-y-6 overflow-hidden">
          <div className="absolute top-2.5 left-2.5 pointer-events-none">
            <FileteadoCorner position="top-left" className="w-9 h-9 text-[#d4af37]/60" />
          </div>
          <div className="absolute top-2.5 right-2.5 pointer-events-none">
            <FileteadoCorner position="top-right" className="w-9 h-9 text-[#d4af37]/60" />
          </div>

          <div className="text-center space-y-1.5 pt-1">
            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[#8e1c2e]/80 text-[#fce59e] border border-[#d4af37]/50">
              Étape 1 sur 3
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f5d77f]">
              Quelle est ta route aujourd'hui ?
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/75">
              Indique ton départ et ta destination, on s'occupe de trouver les parquets sur ton chemin.
            </p>
          </div>

          {/* Raccourcis 1-clic pour tester sans taper */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-200/70 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              Trajets rapides en 1 clic :
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleQuickPreset(p.start, p.end)}
                  className="py-2.5 px-3 rounded-xl bg-[#120b0a] hover:bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/40 hover:border-[#d4af37] text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGoToStep2} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ville de départ */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-200">
                    🟢 Ville de départ
                  </label>
                  <button
                    type="button"
                    onClick={() => setStartCity('Tours')}
                    className="text-[11px] text-[#f5d77f] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LocateFixed className="w-3 h-3" />
                    Ma position
                  </button>
                </div>
                <input
                  type="text"
                  value={startCity}
                  onChange={(e) => setStartCity(e.target.value)}
                  list="tunnel-cities-list"
                  placeholder="Ex: Tours, Paris..."
                  required
                  className="w-full px-4 py-3.5 bg-[#120b0a] border-2 border-[#d4af37]/50 rounded-2xl text-base font-bold text-[#f7f2e7] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Ville d'arrivée */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-200">
                  🔴 Ville d'arrivée
                </label>
                <input
                  type="text"
                  value={endCity}
                  onChange={(e) => setEndCity(e.target.value)}
                  list="tunnel-cities-list"
                  placeholder="Ex: Cannes, Nice..."
                  required
                  className="w-full px-4 py-3.5 bg-[#120b0a] border-2 border-[#d4af37]/50 rounded-2xl text-base font-bold text-[#f7f2e7] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <datalist id="tunnel-cities-list">
              {Object.values(FRENCH_CITIES).map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>

            {/* Choix rapide de la date */}
            <div className="bg-[#120b0a] p-3.5 rounded-2xl border border-[#d4af37]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                📅 Quand prends-tu la route ?
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setDate('2026-11-06')}
                  className="px-3 py-2 rounded-xl bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37] text-xs font-bold cursor-pointer"
                >
                  Ce soir / Week-end
                </button>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 sm:w-40 px-3 py-2 bg-[#1b1210] border border-[#d4af37]/40 rounded-xl text-xs font-bold text-[#f7f2e7]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8e1c2e] via-[#aa2137] to-[#731221] hover:from-[#aa2137] hover:to-[#8e1c2e] text-[#fce59e] font-display font-bold text-sm sm:text-base uppercase tracking-wider border-2 border-[#d4af37] shadow-xl flex items-center justify-center gap-3 cursor-pointer transition active:scale-[0.99]"
            >
              <span>Continuer ➔ Choisir ma route</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* ÉTAPE 2 : CHOIX DE LA ROUTE & DU DÉTOUR (Pavés tactiles géants) */}
      {step === 2 && (
        <div className="relative bg-[#1b1210] rounded-3xl border-2 border-[#d4af37]/60 p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[#8e1c2e]/80 text-[#fce59e] border border-[#d4af37]/50">
              Étape 2 sur 3 • {startCity} ➔ {endCity}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f5d77f]">
              Comment préfères-tu voyager ?
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/75">
              Choisis ton style de route et le détour maximum que tu acceptes pour danser.
            </p>
          </div>

          {/* 1. Choix Autoroute vs Sans Péage */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-200">
              1️⃣ Ton itinéraire :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(routeResult?.routes || []).map((r) => {
                const isSelected = r.id === activeRouteId;
                const hours = Math.floor(r.totalDurationMinutes / 60);
                const mins = r.totalDurationMinutes % 60;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setAvoidTolls(r.isTollFree);
                      onSelectRoute(r.id);
                    }}
                    className={`text-left p-4 rounded-2xl border-2 transition cursor-pointer ${
                      isSelected
                        ? r.isTollFree
                          ? 'bg-[#122a1f] border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg'
                          : 'bg-[#3d1017] border-[#d4af37] ring-2 ring-[#d4af37]/30 shadow-lg'
                        : 'bg-[#120b0a] border-[#d4af37]/25 hover:border-[#d4af37]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#fce59e]">
                        {r.isTollFree ? (
                          <Trees className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Zap className="w-4 h-4 text-amber-300" />
                        )}
                        {r.isTollFree ? 'Flâneur Sans Péage' : 'Rapide Autoroute'}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/50 text-amber-300 border border-[#d4af37]/30">
                        {r.isTollFree ? '0 € péage' : `~${r.estimatedTollEur} €`}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#f7f2e7] font-mono">
                      {r.totalDistanceKm} km • ~{hours}h{mins ? mins.toString().padStart(2, '0') : ''}
                    </div>
                    <div className="mt-2 inline-block px-2.5 py-0.5 rounded-lg bg-[#8e1c2e] text-[#fce59e] text-xs font-bold border border-[#d4af37]/50">
                      💃 {r.eventsCount ?? events.length} milonga{(r.eventsCount ?? events.length) > 1 ? 's' : ''} sur cette route
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Choix du Détour par gros boutons tactiles */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-200">
              2️⃣ Détour accepté depuis ta route :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {detourPresets.map((d) => {
                const active = maxDetourKm === d.km;
                return (
                  <button
                    key={d.km}
                    type="button"
                    onClick={() => setMaxDetourKm(d.km)}
                    className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                      active
                        ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37] shadow-lg scale-[1.02]'
                        : 'bg-[#120b0a] text-amber-100 border-[#d4af37]/30 hover:border-[#d4af37]'
                    }`}
                  >
                    <div className="text-xl mb-1">{d.icon}</div>
                    <div className="font-bold text-xs">{d.label}</div>
                    <div className="text-[11px] text-amber-200/75 font-mono mt-0.5">{d.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Boutons Retour / Voir les Milongas */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3.5 px-4 rounded-2xl bg-[#120b0a] text-amber-200 border border-[#d4af37]/40 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveCarouselIdx(0);
                setStep(3);
              }}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8e1c2e] via-[#aa2137] to-[#731221] text-[#fce59e] font-display font-bold text-sm sm:text-base uppercase tracking-wider border-2 border-[#d4af37] shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Découvrir les {events.length} milongas</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 3 : TES MILONGAS SUR LA ROUTE (Carte + Escale pas-à-pas) */}
      {step === 3 && (
        <div className="space-y-3">
          {/* Pilule récapitulative compacte en haut */}
          <div className="bg-[#1b1210] border border-[#d4af37]/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#f5d77f]">
              <MapPin className="w-4 h-4 text-[#d4af37]" />
              <span>
                {startCity} ➔ {endCity}
              </span>
              <span className="text-amber-200/50">•</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#120b0a] text-amber-200 border border-[#d4af37]/30">
                ±{maxDetourKm} km
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#8e1c2e] text-[#fce59e]">
                {events.length} escale{events.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#120b0a] p-0.5 rounded-xl border border-[#d4af37]/40 text-xs">
                <button
                  type="button"
                  onClick={() => setResultTab('escales')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    resultTab === 'escales' ? 'bg-[#8e1c2e] text-[#fce59e]' : 'text-amber-200/60'
                  }`}
                >
                  Escale par escale
                </button>
                <button
                  type="button"
                  onClick={() => setResultTab('liste')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    resultTab === 'liste' ? 'bg-[#8e1c2e] text-[#fce59e]' : 'text-amber-200/60'
                  }`}
                >
                  Tout voir ({events.length})
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 rounded-xl bg-[#120b0a] hover:bg-[#251815] text-[#f5d77f] border border-[#d4af37]/50 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>
            </div>
          </div>

          {resultTab === 'escales' ? (
            <div className="space-y-3">
              {/* Carte centrée sur l'escale active */}
              <div className="h-[290px] sm:h-[340px]">
                <TangoMap
                  startLocation={startLocation}
                  endLocation={endLocation}
                  routeCoords={routeResult?.coordinates || []}
                  routes={routeResult?.routes || []}
                  activeRouteId={activeRouteId}
                  onSelectRouteId={onSelectRoute}
                  events={events}
                  selectedEvent={currentEscale}
                  onSelectEvent={(evt) => {
                    const idx = events.findIndex((e) => e.id === evt.id);
                    if (idx !== -1) setActiveCarouselIdx(idx);
                    onSelectEvent(evt);
                  }}
                />
              </div>

              {/* Carrousel d'escale ultra-lisible en bas */}
              {currentEscale ? (
                <div className="bg-[#1b1210] border-2 border-[#d4af37] rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#d4af37]/25 pb-2.5">
                    <button
                      type="button"
                      disabled={activeCarouselIdx === 0}
                      onClick={() => setActiveCarouselIdx((i) => Math.max(0, i - 1))}
                      className="px-3 py-1.5 rounded-xl bg-[#120b0a] border border-[#d4af37]/40 text-xs font-bold text-[#fce59e] disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Précédente</span>
                    </button>

                    <span className="text-xs font-display font-bold uppercase tracking-widest text-[#f5d77f] bg-[#8e1c2e] px-3 py-1 rounded-full border border-[#d4af37]/60">
                      Escale {activeCarouselIdx + 1} sur {events.length}
                    </span>

                    <button
                      type="button"
                      disabled={activeCarouselIdx >= events.length - 1}
                      onClick={() => setActiveCarouselIdx((i) => Math.min(events.length - 1, i + 1))}
                      className="px-3 py-1.5 rounded-xl bg-[#120b0a] border border-[#d4af37]/40 text-xs font-bold text-[#fce59e] disabled:opacity-30 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Suivante</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#8e1c2e] text-[#fce59e]">
                          {currentEscale.city}
                        </span>
                        {currentEscale.detourKm !== undefined && (
                          <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                            <Navigation className="w-3 h-3 rotate-45" />+{currentEscale.detourKm} km (~{currentEscale.detourMinutes} min)
                          </span>
                        )}
                      </div>
                      <h3 className="font-tango-serif text-lg sm:text-xl font-bold text-[#f5d77f] mt-1">
                        {currentEscale.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[#f7f2e7] bg-[#120b0a] px-3 py-2 rounded-xl border border-[#d4af37]/30">
                      <Clock className="w-4 h-4 text-[#d4af37]" />
                      <span>
                        {currentEscale.startTime} - {currentEscale.endTime}
                      </span>
                      <span className="text-[#d4af37]">•</span>
                      <span className="font-bold text-[#f5d77f]">{currentEscale.price}</span>
                    </div>
                  </div>

                  {/* Infos rapides Danseur */}
                  <div className="grid grid-cols-3 gap-2 text-xs bg-[#120b0a] p-2.5 rounded-xl border border-[#d4af37]/20">
                    <div className="flex items-center gap-1.5 truncate">
                      <Layers className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      <span className="truncate">{currentEscale.floor}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{currentEscale.airConditioning ? 'Climatisé ❄️' : 'Sans clim'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Disc3 className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      <span className="truncate">{currentEscale.dj}</span>
                    </div>
                  </div>

                  {/* Gros boutons d'action GPS & Fiche */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <a
                      href={getGpsNavigationLinks(currentEscale).waze}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3 rounded-xl bg-[#120b0a] hover:bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37] font-bold text-xs sm:text-sm text-center transition shadow-md"
                    >
                      🚗 Waze
                    </a>
                    <a
                      href={getGpsNavigationLinks(currentEscale).googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3 rounded-xl bg-[#120b0a] hover:bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37] font-bold text-xs sm:text-sm text-center transition shadow-md"
                    >
                      🗺️ Google Maps
                    </a>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(currentEscale)}
                      className="py-3 px-3 rounded-xl bg-[#8e1c2e] hover:bg-[#a62237] text-[#fce59e] border border-[#d4af37] font-bold text-xs sm:text-sm text-center transition shadow-md cursor-pointer"
                    >
                      🎟️ Fiche complète
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1b1210] rounded-2xl p-6 text-center border border-[#d4af37]/40">
                  <p className="font-bold text-[#f5d77f]">Aucune milonga dans ce rayon</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMaxDetourKm(50);
                      setStep(2);
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#8e1c2e] text-[#fce59e] text-xs font-bold border border-[#d4af37]"
                  >
                    Élargir le détour à 50 km
                  </button>
                </div>
              )}
            </div>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
};
