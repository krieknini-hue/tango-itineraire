import React, { useState } from 'react';
import {
  MapPin,
  List,
  ShieldAlert,
  Heart,
  User,
  Sparkles,
  Users,
  HelpCircle,
  Settings,
  Menu,
  X,
  UserRound,
} from 'lucide-react';
import { BandoneonIcon } from './FileteadoOrnaments';
import { useAuth } from '../context';
import { ROLE_META, useProfileState } from '../services/profileManager';

interface NavbarProps {
  viewMode: 'map' | 'list';
  setViewMode: (mode: 'map' | 'list') => void;
  resultsCount: number;
  onOpenEmergencyInfo: () => void;
  onOpenAuth?: () => void;
  onOpenMembership?: () => void;
  onOpenOutreach?: () => void;
  onOpenGuide?: () => void;
  onOpenProfile?: () => void;
  onOpenLab?: () => void;
  onResetHome?: () => void;
  showOnlyFavorites?: boolean;
  setShowOnlyFavorites?: (val: boolean) => void;
  favoritesCount?: number;
  showViewToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  resultsCount,
  onOpenEmergencyInfo,
  onOpenAuth,
  onOpenMembership,
  onOpenOutreach,
  onOpenGuide,
  onOpenProfile,
  onOpenLab,
  onResetHome,
  showOnlyFavorites = false,
  setShowOnlyFavorites,
  favoritesCount = 0,
  showViewToggle = false,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { profile } = useProfileState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#150e0c]/95 backdrop-blur-md text-[#f7f2e7] border-b border-[#d4af37]/40 shadow-xl">
        {/* Filet décoratif supérieur bordeaux/or */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#8e1c2e] via-[#d4af37] to-[#8e1c2e]" />

        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Brand cliquable pour revenir à l'accueil */}
          <button
            type="button"
            onClick={onResetHome}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
            title="Retour à l'accueil"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#8e1c2e] via-[#4a0d18] to-[#1a0e0c] border border-[#d4af37] flex items-center justify-center shadow-lg relative shrink-0 group-hover:scale-105 transition-transform">
              <BandoneonIcon className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-base font-bold tracking-wider text-[#f5d77f] uppercase truncate">
                Tango Itinéraire
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-200/75 font-medium truncate">
                Milongas & Salons sur votre route
              </p>
            </div>
          </button>

          {/* Barre droite ultra-épurée : Favoris + Roue dentée Labo + Tiroir Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Sélecteur Vue Carte / Liste (uniquement en mode Classique) */}
            {showViewToggle && (
              <div className="flex bg-[#120b0a] p-0.5 rounded-xl border border-[#d4af37]/40">
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/60'
                      : 'text-amber-200/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Carte</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/60'
                      : 'text-amber-200/60'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Liste ({resultsCount})</span>
                </button>
              </div>
            )}

            {/* 1. Bouton Favoris rapide */}
            <button
              type="button"
              onClick={() => setShowOnlyFavorites && setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-1 min-h-[38px] px-2.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                showOnlyFavorites
                  ? 'bg-rose-950 text-rose-200 border-rose-500/70 shadow-sm'
                  : 'bg-[#211412] text-amber-200/80 border-[#d4af37]/35 hover:border-[#d4af37]'
              }`}
              title="Mes milongas favorites (hors-ligne)"
            >
              <Heart
                className={`w-4 h-4 ${
                  showOnlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-amber-400'
                }`}
              />
              {favoritesCount > 0 && (
                <span className="px-1.5 rounded-full text-[10px] bg-black/50 text-[#fce59e]">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* 2. Bouton Roue Dentée (Labo Test : choix du Tunnel & du Design) */}
            {onOpenLab && (
              <button
                type="button"
                onClick={onOpenLab}
                className="flex items-center justify-center min-h-[38px] min-w-[38px] px-2.5 rounded-xl bg-[#211412] hover:bg-[#2e1c19] text-[#f5d77f] border border-[#d4af37]/50 hover:border-[#d4af37] transition cursor-pointer shadow-sm"
                title="Ouvrir le Labo Test (choisir version & design)"
                aria-label="Ouvrir le Labo Test"
              >
                <Settings className="w-4 h-4 text-[#d4af37]" />
              </button>
            )}

            {/* 3. Bouton Tiroir Menu (regroupe Profil, Guide, Connexion, Assos, Urgences) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 min-h-[38px] px-3 rounded-xl bg-[#8e1c2e] hover:bg-[#a62237] text-[#fce59e] border border-[#d4af37]/70 text-xs font-bold transition cursor-pointer shadow-md"
              title="Ouvrir le tiroir de menu"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* TIROIR LATÉRAL DE NAVIGATION (Regroupe toutes les icônes secondaires au calme) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        >
          <aside
            className="w-full max-w-xs bg-[#1b1210] border-l-2 border-[#d4af37] h-full p-5 text-[#f7f2e7] shadow-2xl flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            aria-label="Menu & Outils"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
                <span className="font-display text-sm font-bold uppercase tracking-wider text-[#f5d77f]">
                  Espace Tanguero
                </span>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#120b0a] border border-[#d4af37]/40 flex items-center justify-center text-amber-200 hover:text-white cursor-pointer"
                  aria-label="Fermer le tiroir"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Profil Danseur (Rôle Guide / Suiveur / Les deux) */}
                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#120b0a] hover:bg-[#251815] border border-[#d4af37]/40 text-left transition cursor-pointer"
                  >
                    <span className="w-9 h-9 rounded-xl bg-[#8e1c2e] border border-[#d4af37] flex items-center justify-center text-[#fce59e] shrink-0">
                      <UserRound className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#f5d77f]">
                        {profile ? `${profile.name} (${ROLE_META[profile.role].label})` : 'Mon Profil Danseur'}
                      </div>
                      <div className="text-[11px] text-amber-200/70 truncate">
                        Rôle de danse & parité des milongas
                      </div>
                    </div>
                  </button>
                )}

                {/* Didacticiel / Guide */}
                {onOpenGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenGuide();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#120b0a] hover:bg-[#251815] border border-[#d4af37]/30 text-left transition cursor-pointer"
                  >
                    <span className="w-9 h-9 rounded-xl bg-[#211412] border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#f5d77f]">Didacticiel Rapide</div>
                      <div className="text-[11px] text-amber-200/70">
                        Comprendre l'application en 4 étapes
                      </div>
                    </div>
                  </button>
                )}

                {/* Connexion SMS & Cotisation 2€ */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (isAuthenticated) onOpenMembership?.();
                    else onOpenAuth?.();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#120b0a] hover:bg-[#251815] border border-[#d4af37]/30 text-left transition cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-xl bg-[#211412] border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shrink-0">
                    <User className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-xs text-[#f5d77f] flex items-center gap-1">
                      <span>
                        {isAuthenticated
                          ? user?.isCotisationPaid
                            ? 'Adhérent Association ✓'
                            : 'Adhésion 2 € / an'
                          : 'Connexion Mobile (SMS)'}
                      </span>
                      {user?.isCotisationPaid && <Sparkles className="w-3 h-3 text-amber-300" />}
                    </div>
                    <div className="text-[11px] text-amber-200/70">
                      Sans mot de passe • Association Loi 1901
                    </div>
                  </div>
                </button>

                {/* Ligne d'Urgence Zéro Faux Plan */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenEmergencyInfo();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#120b0a] hover:bg-[#251815] border border-[#d4af37]/30 text-left transition cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-xl bg-[#211412] border border-[#d4af37]/50 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-xs text-[#f5d77f]">Ligne Zéro Faux Plan</div>
                    <div className="text-[11px] text-amber-200/70">
                      Alertes d'annulation en direct (WhatsApp)
                    </div>
                  </div>
                </button>

                {/* Espace Associations */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenOutreach?.();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#120b0a] hover:bg-[#251815] border border-[#d4af37]/30 text-left transition cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-xl bg-[#211412] border border-[#d4af37]/50 flex items-center justify-center text-amber-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-bold text-xs text-[#f5d77f]">Espace Associations</div>
                    <div className="text-[11px] text-amber-200/70">
                      Référencer une milonga & support visuel
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Raccourci Labo Test en bas du menu aussi */}
            {onOpenLab && (
              <div className="pt-4 border-t border-[#d4af37]/25">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenLab();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#120b0a] hover:bg-[#251815] border border-[#d4af37]/40 text-xs font-bold text-[#f5d77f] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Ouvrir le Labo Test (Versions & Thèmes)</span>
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
};
