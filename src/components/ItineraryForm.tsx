import React from 'react';
import { Calendar, Sliders, ArrowRight, Sparkles, Navigation, Coins, Trees, Zap } from 'lucide-react';
import { FRENCH_CITIES } from '../data/frenchCities';
import { FileteadoCorner } from './FileteadoOrnaments';

interface ItineraryFormProps {
  startCity: string;
  setStartCity: (city: string) => void;
  endCity: string;
  setEndCity: (city: string) => void;
  date: string;
  setDate: (date: string) => void;
  maxDetourKm: number;
  setMaxDetourKm: (km: number) => void;
  avoidTolls?: boolean;
  setAvoidTolls?: (avoid: boolean) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const ItineraryForm: React.FC<ItineraryFormProps> = ({
  startCity,
  setStartCity,
  endCity,
  setEndCity,
  date,
  setDate,
  maxDetourKm,
  setMaxDetourKm,
  avoidTolls = false,
  setAvoidTolls,
  onSearch,
  isLoading,
}) => {
  const presets = [
    { start: 'Tours', end: 'Cannes', label: 'Tours ➔ Cannes' },
    { start: 'Paris', end: 'Nice', label: 'Paris ➔ Nice' },
    { start: 'Bordeaux', end: 'Lyon', label: 'Bordeaux ➔ Lyon' },
  ];

  const handleApplyPreset = (start: string, end: string) => {
    setStartCity(start);
    setEndCity(end);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="relative bg-[#1b1210] rounded-2xl shadow-2xl shadow-black/80 border border-[#d4af37]/45 p-4 sm:p-5 overflow-hidden">
      {/* Ornements d'angle Fileteado doré */}
      <div className="absolute top-2 left-2 pointer-events-none">
        <FileteadoCorner position="top-left" className="w-8 h-8 text-[#d4af37]/60" />
      </div>
      <div className="absolute top-2 right-2 pointer-events-none">
        <FileteadoCorner position="top-right" className="w-8 h-8 text-[#d4af37]/60" />
      </div>
      <div className="absolute bottom-2 left-2 pointer-events-none">
        <FileteadoCorner position="bottom-left" className="w-8 h-8 text-[#d4af37]/40" />
      </div>
      <div className="absolute bottom-2 right-2 pointer-events-none">
        <FileteadoCorner position="bottom-right" className="w-8 h-8 text-[#d4af37]/40" />
      </div>

      {/* En-tête guichet rétro */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#d4af37]/20 gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[#f5d77f] text-sm">◆</span>
          <h2 className="font-display text-sm sm:text-base font-bold tracking-wide text-[#f5d77f] uppercase">
            Guichet des Itinéraires Milongueros
          </h2>
          <span className="text-[#f5d77f] text-sm">◆</span>
        </div>

        {/* Suggestions rapides stylisées ticket */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          <span className="text-amber-200/60 font-medium whitespace-nowrap flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            Lignes directes :
          </span>
          {presets.map((p) => {
            const isActive =
              startCity.toLowerCase() === p.start.toLowerCase() &&
              endCity.toLowerCase() === p.end.toLowerCase();
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p.start, p.end)}
                className={`px-2.5 py-0.5 rounded-md border text-[11px] font-medium tracking-wide whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37] font-semibold shadow-sm'
                    : 'bg-[#251815] text-amber-200/80 border-[#d4af37]/30 hover:border-[#d4af37] hover:text-[#f5d77f]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Ville de départ */}
          <div className="relative">
            <label className="block text-xs font-semibold tracking-wide text-amber-200/90 mb-1">
              Départ • Ville d'origine
            </label>
            <div className="relative">
              <input
                type="text"
                value={startCity}
                onChange={(e) => setStartCity(e.target.value)}
                placeholder="Ex : Tours, Paris, Lyon..."
                list="french-cities-list"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#120b0a] border border-[#d4af37]/40 rounded-xl text-sm font-medium text-[#f7f2e7] placeholder-amber-200/30 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition shadow-inner"
              />
              <div className="absolute left-3 top-3 w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400/50 ring-2 ring-emerald-950 flex items-center justify-center">
                <span className="w-1 h-1 bg-white rounded-full"></span>
              </div>
            </div>
          </div>

          {/* Ville d'arrivée */}
          <div className="relative">
            <label className="block text-xs font-semibold tracking-wide text-amber-200/90 mb-1">
              Arrivée • Destination
            </label>
            <div className="relative">
              <input
                type="text"
                value={endCity}
                onChange={(e) => setEndCity(e.target.value)}
                placeholder="Ex : Cannes, Nice, Marseille..."
                list="french-cities-list"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#120b0a] border border-[#d4af37]/40 rounded-xl text-sm font-medium text-[#f7f2e7] placeholder-amber-200/30 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition shadow-inner"
              />
              <div className="absolute left-3 top-3 w-3 h-3 rounded-full bg-[#8e1c2e] shadow-sm shadow-rose-500/50 ring-2 ring-rose-950 flex items-center justify-center">
                <span className="w-1 h-1 bg-white rounded-full"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Datalist pour autocomplétion rapide */}
        <datalist id="french-cities-list">
          {Object.values(FRENCH_CITIES).map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>

        {/* Curseur Rayon de Détour façon jauge laiton */}
        <div className="bg-[#140c0b] p-3 rounded-xl border border-[#d4af37]/25 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-100 flex items-center gap-1.5 tracking-wide">
              <Sliders className="w-3.5 h-3.5 text-[#d4af37]" />
              Périmètre de détour :
              <span className="text-[#fce59e] font-bold text-xs bg-[#8e1c2e] px-2.5 py-0.5 rounded border border-[#d4af37]/50 shadow-sm">
                {maxDetourKm} km
              </span>
            </span>
            <span className="text-amber-200/70 text-xs">
              ~{Math.round((maxDetourKm * 2 / 45) * 60)} min de route max
            </span>
          </div>

          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={maxDetourKm}
            onChange={(e) => setMaxDetourKm(Number(e.target.value))}
            className="w-full accent-[#d4af37] cursor-pointer h-2 bg-[#251815] rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-amber-200/50 font-medium font-mono">
            <span>Direct (5 km)</span>
            <span className="text-[#f5d77f] font-semibold">25 km (Recommandé)</span>
            <span>Large (60 km)</span>
          </div>
        </div>

        {/* Préférence Péages & Itinéraire Bis */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#140c0b] rounded-xl border border-[#d4af37]/25 gap-2 text-xs">
          <span className="text-amber-100 flex items-center gap-1.5 font-medium">
            <Coins className="w-3.5 h-3.5 text-[#d4af37]" />
            Option Route & Péages :
          </span>
          <div className="flex bg-[#120b0a] p-0.5 rounded-lg border border-[#d4af37]/35 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setAvoidTolls?.(false)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                !avoidTolls
                  ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/60 shadow-sm'
                  : 'text-amber-200/60 hover:text-amber-100'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Autoroutes (Rapide)</span>
            </button>
            <button
              type="button"
              onClick={() => setAvoidTolls?.(true)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                avoidTolls
                  ? 'bg-emerald-900 text-emerald-100 border border-emerald-500/60 shadow-sm'
                  : 'text-amber-200/60 hover:text-amber-100'
              }`}
            >
              <Trees className="w-3 h-3 text-emerald-400" />
              <span>Sans péage (Bis • Éco)</span>
            </button>
          </div>
        </div>

        {/* Date & Bouton de Recherche */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative w-full sm:w-48">
            <Calendar className="w-4 h-4 text-[#d4af37] absolute left-3 top-3 pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-[#120b0a] border border-[#d4af37]/40 rounded-xl text-xs font-semibold text-[#f7f2e7] focus:outline-none focus:border-[#d4af37] transition shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:flex-1 py-2.5 px-5 bg-gradient-to-r from-[#8e1c2e] via-[#aa2137] to-[#731221] hover:from-[#aa2137] hover:to-[#8e1c2e] text-[#fce59e] font-display font-bold text-xs sm:text-sm tracking-wide uppercase rounded-xl border border-[#d4af37] shadow-lg shadow-black/80 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-75 cursor-pointer group"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#f5d77f]/30 border-t-[#f5d77f] rounded-full animate-spin" />
                Consultation des registres...
              </span>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-[#f5d77f] group-hover:rotate-45 transition-transform" />
                <span>Tracer la Route des Milongas</span>
                <ArrowRight className="w-4 h-4 text-[#f5d77f]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
