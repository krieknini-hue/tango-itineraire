import React from 'react';
import { MapPin, List, ShieldAlert, Heart, User, Sparkles, Users } from 'lucide-react';
import { BandoneonIcon } from './FileteadoOrnaments';
import { useAuth } from '../context';

interface NavbarProps {
  viewMode: 'map' | 'list';
  setViewMode: (mode: 'map' | 'list') => void;
  resultsCount: number;
  onOpenEmergencyInfo: () => void;
  onOpenAuth?: () => void;
  onOpenMembership?: () => void;
  onOpenOutreach?: () => void;
  showOnlyFavorites?: boolean;
  setShowOnlyFavorites?: (val: boolean) => void;
  favoritesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  resultsCount,
  onOpenEmergencyInfo,
  onOpenAuth,
  onOpenMembership,
  onOpenOutreach,
  showOnlyFavorites = false,
  setShowOnlyFavorites,
  favoritesCount = 0,
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#150e0c]/95 backdrop-blur-md text-[#f7f2e7] border-b border-[#d4af37]/40 shadow-2xl shadow-black/80">
      {/* Filet décoratif supérieur bordeaux/or */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#8e1c2e] via-[#d4af37] to-[#8e1c2e]" />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-18 flex items-center justify-between gap-2">
        
        {/* Brand & Sceau 1950 */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#8e1c2e] via-[#4a0d18] to-[#1a0e0c] border border-[#d4af37] flex items-center justify-center shadow-lg shadow-black/60 relative group shrink-0">
            <BandoneonIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#f5d77f] group-hover:scale-110 transition-transform" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#d4af37] text-[#120b0a] font-bold text-[8px] flex items-center justify-center rounded-full ring-1 ring-[#120b0a]">
              50
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-display text-sm sm:text-lg font-bold tracking-wider text-[#f5d77f] uppercase flex items-center gap-1.5">
                Tango Itinéraire
              </h1>
              <span className="hidden md:inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#8e1c2e]/70 text-[#fce59e] border border-[#d4af37]/50">
                Buenos Aires 1950
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-200/80 font-medium tracking-normal line-clamp-1">
              Les milongas & salons de l'Âge d'Or sur votre trajet
            </p>
          </div>
        </div>

        {/* Actions / View Mode Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Filtre Favoris Hors-ligne */}
          <button
            onClick={() => setShowOnlyFavorites && setShowOnlyFavorites(!showOnlyFavorites)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
              showOnlyFavorites
                ? 'bg-rose-950 text-rose-200 border-rose-500/70 shadow-sm'
                : 'bg-[#211412] text-amber-200/70 border-[#d4af37]/30 hover:border-[#d4af37]/70'
            }`}
            title="Afficher mes milongas enregistrées hors-ligne"
          >
            <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Favoris</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/50 text-[#fce59e]">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Espace Danseur / Authentification SMS & Cotisation */}
          <button
            onClick={() => (isAuthenticated ? onOpenMembership?.() : onOpenAuth?.())}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#211412] text-[#f5d77f] border border-[#d4af37]/50 hover:bg-[#2e1c19] hover:border-[#d4af37] transition shadow-sm cursor-pointer"
            title={isAuthenticated ? "Gérer ma cotisation 2 € / an" : "Connexion par numéro de mobile"}
          >
            <User className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden md:inline">
              {isAuthenticated ? (
                user?.isCotisationPaid ? 'Adhérent ✓' : 'Bêta Découverte (2 €)'
              ) : (
                'Connexion'
              )}
            </span>
            {user?.isCotisationPaid && (
              <Sparkles className="w-3 h-3 text-amber-300 hidden sm:inline" />
            )}
          </button>

          {/* Bouton Espace Assos, Outreach & Support Visuel */}
          <button
            onClick={onOpenOutreach}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#211412] text-[#f5d77f] border border-[#d4af37]/50 hover:bg-[#2e1c19] hover:border-[#d4af37] transition shadow-sm cursor-pointer"
            title="Espace Assos, Outil de contact & Support visuel"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Espace Assos</span>
          </button>

          {/* Bouton Dépêche d'Urgence / Ligne Zéro Faux Plan */}
          <button
            onClick={onOpenEmergencyInfo}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#211412] text-[#f5d77f] border border-[#d4af37]/50 hover:bg-[#2e1c19] hover:border-[#d4af37] transition shadow-sm cursor-pointer"
            title="Dépêche d'urgence & Ligne Zéro Faux Plan"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Ligne d'Urgence</span>
          </button>

          {/* Sélecteur Vue Carte / Liste façon Guichet */}
          <div className="flex bg-[#120b0a] p-1 rounded-xl border border-[#d4af37]/40 shadow-inner">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-[#8e1c2e] to-[#6d1320] text-[#fce59e] border border-[#d4af37]/60 shadow-md'
                  : 'text-amber-200/60 hover:text-[#f5d77f]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Carte</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#8e1c2e] to-[#6d1320] text-[#fce59e] border border-[#d4af37]/60 shadow-md'
                  : 'text-amber-200/60 hover:text-[#f5d77f]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Liste</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-amber-300">
                {resultsCount}
              </span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
