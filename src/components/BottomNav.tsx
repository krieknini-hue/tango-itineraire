import React from 'react';
import {
  Compass,
  List,
  MapPin,
  Heart,
  Car,
  Menu,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: 'trajet' | 'billets' | 'carte';
  onChangeTab: (tab: 'trajet' | 'billets' | 'carte') => void;
  resultsCount: number;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
  isDrivingMode: boolean;
  onToggleDrivingMode: () => void;
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  resultsCount,
  showOnlyFavorites,
  onToggleFavorites,
  favoritesCount,
  isDrivingMode,
  onToggleDrivingMode,
  onOpenMenu,
}) => {
  return (
    <nav
      aria-label="Navigation mobile principale (zone du pouce)"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A24]/95 backdrop-blur-md border-t border-[#F4A261]/35 px-1 py-1.5 flex items-center justify-around pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl transition-all duration-200 ${
        isDrivingMode ? 'border-emerald-500/60 bg-[#12121A]/98' : ''
      }`}
    >
      {/* 1. Trajet / Recherche */}
      <button
        type="button"
        onClick={() => onChangeTab('trajet')}
        className={`flex flex-col items-center justify-center min-w-[52px] py-1 px-1.5 rounded-xl transition cursor-pointer ${
          currentTab === 'trajet' && !showOnlyFavorites
            ? 'text-[#F4A261] bg-[#242436] font-bold'
            : 'text-[#F8F9FA]/70 hover:text-[#F8F9FA]'
        }`}
      >
        <Compass className={`w-5 h-5 ${currentTab === 'trajet' && !showOnlyFavorites ? 'text-[#F4A261]' : ''}`} />
        <span className="text-[10px] mt-0.5 font-medium leading-none">Trajet</span>
      </button>

      {/* 2. Milongas / Billets */}
      <button
        type="button"
        onClick={() => onChangeTab('billets')}
        className={`relative flex flex-col items-center justify-center min-w-[52px] py-1 px-1.5 rounded-xl transition cursor-pointer ${
          currentTab === 'billets' && !showOnlyFavorites
            ? 'text-[#F4A261] bg-[#242436] font-bold'
            : 'text-[#F8F9FA]/70 hover:text-[#F8F9FA]'
        }`}
      >
        <List className={`w-5 h-5 ${currentTab === 'billets' && !showOnlyFavorites ? 'text-[#F4A261]' : ''}`} />
        <span className="text-[10px] mt-0.5 font-medium leading-none">Salons</span>
        {resultsCount > 0 && (
          <span className="absolute -top-1 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#E63946] text-white shadow-sm">
            {resultsCount}
          </span>
        )}
      </button>

      {/* 3. Carte */}
      <button
        type="button"
        onClick={() => onChangeTab('carte')}
        className={`flex flex-col items-center justify-center min-w-[52px] py-1 px-1.5 rounded-xl transition cursor-pointer ${
          currentTab === 'carte' && !showOnlyFavorites
            ? 'text-[#F4A261] bg-[#242436] font-bold'
            : 'text-[#F8F9FA]/70 hover:text-[#F8F9FA]'
        }`}
      >
        <MapPin className={`w-5 h-5 ${currentTab === 'carte' && !showOnlyFavorites ? 'text-[#F4A261]' : ''}`} />
        <span className="text-[10px] mt-0.5 font-medium leading-none">Carte</span>
      </button>

      {/* 4. Favoris */}
      <button
        type="button"
        onClick={onToggleFavorites}
        className={`relative flex flex-col items-center justify-center min-w-[52px] py-1 px-1.5 rounded-xl transition cursor-pointer ${
          showOnlyFavorites
            ? 'text-rose-400 bg-rose-950/60 font-bold border border-rose-500/40'
            : 'text-[#F8F9FA]/70 hover:text-rose-400'
        }`}
      >
        <Heart className={`w-5 h-5 ${showOnlyFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
        <span className="text-[10px] mt-0.5 font-medium leading-none">Favoris</span>
        {favoritesCount > 0 && (
          <span className="absolute -top-1 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#F4A261] text-[#0F0F14] shadow-sm">
            {favoritesCount}
          </span>
        )}
      </button>

      {/* 5. TOGGLE MODE CONDUITE / VOITURE (Zone de confort du pouce) */}
      <button
        type="button"
        onClick={onToggleDrivingMode}
        className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl border transition cursor-pointer ${
          isDrivingMode
            ? 'bg-emerald-600/90 text-white border-emerald-400 font-bold shadow-lg shadow-emerald-900/50 scale-105 ring-2 ring-emerald-400/50'
            : 'bg-[#242436] text-[#F4A261] border-[#F4A261]/40 hover:border-[#F4A261]'
        }`}
        title={isDrivingMode ? 'Désactiver le Mode Conduite' : 'Activer le Mode Conduite (plein écran + wake lock)'}
      >
        <Car className={`w-5 h-5 ${isDrivingMode ? 'animate-pulse' : ''}`} />
        <span className="text-[9px] mt-0.5 font-bold uppercase tracking-tight">
          {isDrivingMode ? 'Conduite' : 'Voiture'}
        </span>
      </button>

      {/* 6. Menu / Espace Tanguero */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center min-w-[50px] py-1 px-1.5 rounded-xl text-[#F8F9FA]/70 hover:text-[#F8F9FA] transition cursor-pointer"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium leading-none">Menu</span>
      </button>
    </nav>
  );
};
