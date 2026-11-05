import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Wind, 
  Disc3, 
  Navigation, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Heart,
  Music,
  Key,
  Copy,
  Check,
} from 'lucide-react';
import { formatEventDate } from '../modules/nearby';
import type { TangoEvent } from '../types/tango';
import { getGpsNavigationLinks } from '../services/routingService';
import { useAuth } from '../context';
import { formatDurationToTandas, calculateRemainingDanceTime } from '../modules/tangoMetrics';
import { getLastMileMemo, saveLastMileMemo, type LastMileMemo } from '../services/storageService';
import { FileteadoBorderOverlay } from './FileteadoOrnaments';

interface EventCardProps {
  event: TangoEvent;
  onSelect: (event: TangoEvent) => void;
  isSelected: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect, isSelected }) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const [showComfortDrawer, setShowComfortDrawer] = useState(false);
  const [showLastMileDrawer, setShowLastMileDrawer] = useState(false);
  const [lastMileMemo, setLastMileMemo] = useState<LastMileMemo>(() => getLastMileMemo(event.id));
  const [copiedCode, setCopiedCode] = useState(false);
  const [launchingApp, setLaunchingApp] = useState<'waze' | 'maps' | null>(null);

  const isFav = isFavorite(event.id);
  const gpsLinks = getGpsNavigationLinks(event);
  const isCancelled = event.status === 'cancelled';

  // 2. Convertisseur Temps -> Tandas pour le détour
  const detourTandas = formatDurationToTandas(event.detourMinutes || Math.round((event.detourKm || 15) * 1.6));

  // 3. Indicateur "Temps de danse restant"
  const danceTime = calculateRemainingDanceTime(event, event.detourMinutes || 0);

  // Mise à jour du mémo dernier kilomètre
  const handleUpdateMemo = (patch: Partial<LastMileMemo>) => {
    const updated = saveLastMileMemo(event.id, patch);
    setLastMileMemo(updated);
  };

  const handleCopyAccessCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lastMileMemo.accessCode) {
      navigator.clipboard.writeText(lastMileMemo.accessCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // 4. Micro-interaction de validation lors du lancement GPS
  const handleLaunchNavigation = (e: React.MouseEvent, type: 'waze' | 'maps', url: string) => {
    e.stopPropagation();
    setLaunchingApp(type);
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
      setLaunchingApp(null);
    }, 280);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'pratique':
        return (
          <span className="bg-[#2a1d12] text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-bold">
            Práctica
          </span>
        );
      case 'festival':
        return (
          <span className="bg-[#30162c] text-purple-200 border border-purple-500/50 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-bold">
            Festival
          </span>
        );
      case 'marathon':
        return (
          <span className="bg-[#19223c] text-blue-200 border border-blue-500/50 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-bold">
            Maratón
          </span>
        );
      case 'stage':
        return (
          <span className="bg-[#122a1f] text-emerald-200 border border-emerald-500/50 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-bold">
            Stage
          </span>
        );
      default:
        return (
          <span className="bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/60 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase font-bold shadow-sm">
            Milonga
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(event)}
      className={`group relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-[#241714] border-2 border-[#d4af37] ring-4 ring-[#d4af37]/20 shadow-2xl shadow-black'
          : 'bg-[#1b1210] border border-[#d4af37]/35 hover:border-[#d4af37]/80 hover:bg-[#201512] shadow-lg shadow-black/60'
      } ${isCancelled ? 'opacity-80 border-rose-900/60' : ''}`}
    >
      {/* Ornements d'angle Fileteado Porteño si carte sélectionnée */}
      {isSelected && <FileteadoBorderOverlay />}

      {/* Filet intérieur doré discret style ticket */}
      <div className="absolute inset-1.5 rounded-xl border border-[#d4af37]/15 pointer-events-none" />

      {/* Ligne 1 : Badge Type + Ville + Détour en Tandas + Favori */}
      <div className="flex items-center justify-between gap-2 mb-1.5 relative z-10">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {getTypeBadge(event.type)}
          <span className="text-xs font-bold text-[#f7f2e7] flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-[#d4af37] shrink-0" />
            <span className="truncate">{event.city}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 2. Badge Ludique Convertisseur Détour -> Tandas */}
          {event.detourKm !== undefined && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#120b0a] text-[#fce59e] border border-[#d4af37]/40 font-mono"
              title={`${event.detourKm} km de détour (${event.detourMinutes || 15} min)`}
            >
              <Navigation className="w-3 h-3 text-[#d4af37] rotate-45" />
              <span>+{event.detourKm} km</span>
              <span className="text-[#F4A261] font-semibold hidden sm:inline">
                ({detourTandas.shortBadgeText})
              </span>
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(event.id);
            }}
            className="p-1.5 rounded-md bg-[#120b0a] border border-[#d4af37]/30 hover:border-[#d4af37] transition cursor-pointer"
            title={isFav ? 'Retirer des favoris' : 'Sauvegarder hors-ligne'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFav ? 'fill-rose-500 text-rose-500' : 'text-amber-200/60 hover:text-rose-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Ligne 2 : Titre & Horaire essentiel */}
      <div className="mb-2 relative z-10">
        <h3 className={`text-base font-tango-serif font-bold text-[#f5d77f] leading-snug group-hover:text-amber-200 transition flex items-center justify-between gap-2 ${
          isCancelled ? 'line-through text-amber-200/40' : ''
        }`}>
          <span className="truncate">{event.title}</span>
          <ChevronRight className="w-4 h-4 text-[#d4af37] group-hover:translate-x-1 transition shrink-0" />
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-amber-200/80 mt-1 font-mono flex-wrap">
          <span className="flex items-center gap-1 text-[#f7f2e7]">
            <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <span className="capitalize">{formatEventDate(event.date)}</span> · {event.startTime} - {event.endTime}
          </span>
          <span className="text-[#d4af37]">•</span>
          <span className="font-bold text-[#f5d77f]">{event.price}</span>

          {/* 3. Indicateur Temps de danse restant (Vert / Orange / Rouge Cumparsita) */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-tight ${
              danceTime.colorScheme === 'green'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : danceTime.colorScheme === 'orange'
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                : 'bg-rose-950 text-rose-200 border-rose-500/60 font-semibold'
            }`}
            title={`Arrivée estimée vers ${danceTime.etaFormatted} (fin de bal à ${danceTime.endTimeFormatted})`}
          >
            <Music className="w-3 h-3 shrink-0" />
            <span>{danceTime.badgeLabel}</span>
          </span>
        </div>
      </div>

      {/* Bannière Alerte si Annulé */}
      {isCancelled && (
        <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-[#3a0d14] border border-rose-500/50 flex items-center gap-2 text-xs text-rose-200 font-semibold relative z-10">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>🔴 DÉPÊCHE : {event.cancellationReason || 'Milonga annulée'}</span>
        </div>
      )}

      {/* 4. TIROIR MÉMO "DERNIER KILOMÈTRE" (Parking, Code d'accès, Sol) avec animation Bandonéon */}
      {showLastMileDrawer && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mb-2.5 p-3 rounded-xl bg-[#120b0a] border border-[#d4af37]/40 space-y-2.5 text-xs text-amber-100 relative z-10 animate-bandoneon"
        >
          <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-1.5">
            <span className="font-bold text-[#f5d77f] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Key className="w-3.5 h-3.5 text-[#F4A261]" />
              Mémo Dernier Kilomètre (Sauvegarde locale)
            </span>
            <span className="text-[10px] text-amber-200/50">Auto-sauvegardé</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Qualité du Sol */}
            <div>
              <label className="block text-[10px] text-amber-200/70 mb-1 font-semibold">
                Qualité du sol :
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'glissant', label: 'Glissant ⛸️' },
                  { id: 'normal', label: 'Normal 👟' },
                  { id: 'accrocheur', label: 'Accrocheur 🧲' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleUpdateMemo({ floorQuality: f.id as any })}
                    className={`px-1.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer text-center ${
                      lastMileMemo.floorQuality === f.id
                        ? 'bg-[#E63946] text-white border-[#F4A261]'
                        : 'bg-[#1b1210] text-amber-200/70 border-[#d4af37]/30'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code d'accès / Digicode */}
            <div>
              <label className="block text-[10px] text-amber-200/70 mb-1 font-semibold">
                Code d'accès / Porte :
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="Ex: 45A1 ou sonner..."
                  value={lastMileMemo.accessCode}
                  onChange={(e) => handleUpdateMemo({ accessCode: e.target.value })}
                  className="w-full px-2 py-1 bg-[#1b1210] border border-[#d4af37]/30 rounded text-xs text-[#F8F9FA] focus:border-[#F4A261] outline-none"
                />
                {lastMileMemo.accessCode && (
                  <button
                    type="button"
                    onClick={handleCopyAccessCode}
                    className="p-1 rounded bg-[#242436] border border-[#d4af37]/40 text-amber-300 hover:text-white shrink-0 cursor-pointer"
                    title="Copier le code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Info Parking */}
            <div>
              <label className="block text-[10px] text-amber-200/70 mb-1 font-semibold">
                Infos Parking :
              </label>
              <input
                type="text"
                placeholder="Ex: Parking gratuit derrière..."
                value={lastMileMemo.parkingInfo}
                onChange={(e) => handleUpdateMemo({ parkingInfo: e.target.value })}
                className="w-full px-2 py-1 bg-[#1b1210] border border-[#d4af37]/30 rounded text-xs text-[#F8F9FA] focus:border-[#F4A261] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tiroir repliable d'infos Confort (Parquet, Clim, DJ, Asso) avec animation Bandonéon */}
      {showComfortDrawer && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mb-2.5 p-2.5 rounded-xl bg-[#120b0a] border border-[#d4af37]/25 grid grid-cols-2 gap-2 text-xs text-amber-100 relative z-10 driving-hide-secondary animate-bandoneon"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{event.floor}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {event.airConditioning ? (
              <span className="flex items-center gap-1 text-[#8ec8db] font-medium">
                <Wind className="w-3.5 h-3.5 text-[#5b8ea6]" />
                Climatisé ❄️
              </span>
            ) : (
              <span className="text-amber-200/50">Sans clim</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 col-span-2 truncate text-amber-200/80 pt-1 border-t border-[#d4af37]/15">
            <Disc3 className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <span className="truncate font-semibold text-[#f5d77f]">{event.dj}</span>
            <span className="text-amber-200/40">•</span>
            <span className="truncate text-amber-200/70">{event.organizer.name}</span>
          </div>
        </div>
      )}

      {/* Ligne 3 : Boutons Tiroirs & Lanceurs de Navigation Universels (Android Auto) */}
      <div
        className="flex items-center justify-between pt-2 border-t border-[#d4af37]/20 text-xs relative z-10 flex-wrap gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 flex-wrap driving-hide-secondary">
          {/* Bouton Confort */}
          <button
            type="button"
            onClick={() => {
              setShowComfortDrawer((v) => !v);
              if (!showComfortDrawer) setShowLastMileDrawer(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#120b0a] hover:bg-[#251815] text-amber-200/90 border border-[#d4af37]/30 text-[11px] font-semibold transition cursor-pointer"
          >
            <span>{showComfortDrawer ? 'Masquer confort' : 'Sol, Clim & DJ'}</span>
            {showComfortDrawer ? <ChevronUp className="w-3.5 h-3.5 text-[#d4af37]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]" />}
          </button>

          {/* Bouton Mémo Dernier Kilomètre */}
          <button
            type="button"
            onClick={() => {
              setShowLastMileDrawer((v) => !v);
              if (!showLastMileDrawer) setShowComfortDrawer(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
              showLastMileDrawer || lastMileMemo.accessCode || lastMileMemo.parkingInfo || lastMileMemo.floorQuality
                ? 'bg-[#242436] text-[#F4A261] border-[#F4A261]/60'
                : 'bg-[#120b0a] hover:bg-[#251815] text-amber-200/80 border-[#d4af37]/30'
            }`}
          >
            <Key className="w-3 h-3 text-[#F4A261]" />
            <span>Mémo Arrivée</span>
            {(lastMileMemo.accessCode || lastMileMemo.parkingInfo) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        </div>

        {/* 1. LANCEURS DE NAVIGATION UNIVERSELS (Compatibles Android Auto & Waze/Maps avec micro-interaction) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={(e) => handleLaunchNavigation(e, 'waze', gpsLinks.waze)}
            className={`btn-interactive flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-[#E63946] hover:bg-[#cf2936] text-[#F8F9FA] text-xs font-bold border border-[#F4A261]/60 transition shadow-md inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              launchingApp === 'waze' ? 'animate-tango-launch ring-4 ring-[#F4A261]/50' : ''
            }`}
            title="Lancer Waze (Android Auto & Mobile)"
          >
            <Navigation className="w-3.5 h-3.5 shrink-0" />
            <span>{launchingApp === 'waze' ? '🎶 Départ...' : 'Lancer Waze'}</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleLaunchNavigation(e, 'maps', gpsLinks.googleMaps)}
            className={`btn-interactive flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-[#1A1A24] hover:bg-[#252536] text-[#F4A261] text-xs font-bold border border-[#F4A261]/50 transition shadow-md inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              launchingApp === 'maps' ? 'animate-tango-launch ring-4 ring-[#F4A261]/50' : ''
            }`}
            title="Lancer Google Maps (Android Auto & Mobile)"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#F4A261]" />
            <span>{launchingApp === 'maps' ? '🎶 Départ...' : 'Lancer Maps'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
