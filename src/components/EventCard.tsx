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
  Heart
} from 'lucide-react';
import { formatEventDate } from '../modules/nearby';
import type { TangoEvent } from '../types/tango';
import { getGpsNavigationLinks } from '../services/routingService';
import { useAuth } from '../context';

interface EventCardProps {
  event: TangoEvent;
  onSelect: (event: TangoEvent) => void;
  isSelected: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect, isSelected }) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const [showComfortDrawer, setShowComfortDrawer] = useState(false);
  const isFav = isFavorite(event.id);
  const gpsLinks = getGpsNavigationLinks(event);
  const isCancelled = event.status === 'cancelled';

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
      {/* Filet intérieur doré discret style ticket */}
      <div className="absolute inset-1.5 rounded-xl border border-[#d4af37]/15 pointer-events-none" />

      {/* Ligne 1 : Badge Type + Ville + Détour + Favori */}
      <div className="flex items-center justify-between gap-2 mb-1.5 relative z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          {getTypeBadge(event.type)}
          <span className="text-xs font-bold text-[#f7f2e7] flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-[#d4af37] shrink-0" />
            <span className="truncate">{event.city}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {event.detourKm !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-[#120b0a] text-[#fce59e] border border-[#d4af37]/40 font-mono">
              <Navigation className="w-3 h-3 text-[#d4af37] rotate-45" />
              +{event.detourKm} km
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
      <div className="mb-2.5 relative z-10">
        <h3 className={`text-base font-tango-serif font-bold text-[#f5d77f] leading-snug group-hover:text-amber-200 transition flex items-center justify-between gap-2 ${
          isCancelled ? 'line-through text-amber-200/40' : ''
        }`}>
          <span className="truncate">{event.title}</span>
          <ChevronRight className="w-4 h-4 text-[#d4af37] group-hover:translate-x-1 transition shrink-0" />
        </h3>
        <div className="flex items-center gap-2 text-xs text-amber-200/80 mt-0.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
          <span className="text-[#f7f2e7]">
            <span className="capitalize">{formatEventDate(event.date)}</span> · {event.startTime} - {event.endTime}
          </span>
          <span className="text-[#d4af37]">•</span>
          <span className="font-bold text-[#f5d77f]">{event.price}</span>
        </div>
      </div>

      {/* Bannière Alerte si Annulé */}
      {isCancelled && (
        <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-[#3a0d14] border border-rose-500/50 flex items-center gap-2 text-xs text-rose-200 font-semibold relative z-10">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>🔴 DÉPÊCHE : {event.cancellationReason || 'Milonga annulée'}</span>
        </div>
      )}

      {/* Tiroir repliable d'infos Confort (Parquet, Clim, DJ, Asso) */}
      {showComfortDrawer && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mb-2.5 p-2.5 rounded-xl bg-[#120b0a] border border-[#d4af37]/25 grid grid-cols-2 gap-2 text-xs text-amber-100 relative z-10"
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

      {/* Ligne 3 : Bouton Tiroir « + Confort » & Boutons directs Waze / Maps */}
      <div
        className="flex items-center justify-between pt-2 border-t border-[#d4af37]/20 text-xs relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShowComfortDrawer((v) => !v)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#120b0a] hover:bg-[#251815] text-amber-200/90 border border-[#d4af37]/30 text-[11px] font-semibold transition cursor-pointer"
        >
          <span>{showComfortDrawer ? 'Masquer confort' : 'Sol, Clim & DJ'}</span>
          {showComfortDrawer ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#d4af37]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]" />
          )}
        </button>

        {/* Boutons Waze / Maps */}
        <div className="flex items-center gap-1.5">
          <a
            href={gpsLinks.waze}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-[#8e1c2e] hover:bg-[#a62237] text-[#fce59e] text-[11px] font-bold border border-[#d4af37]/60 transition shadow-sm"
            title="Lancer Waze"
          >
            Waze
          </a>
          <a
            href={gpsLinks.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-[#120b0a] hover:bg-[#251815] text-[#fce59e] text-[11px] font-bold border border-[#d4af37]/50 transition shadow-sm"
            title="Lancer Google Maps"
          >
            Maps
          </a>
        </div>
      </div>
    </div>
  );
};
