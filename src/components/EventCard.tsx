import React from 'react';
import { 
  MapPin, 
  Clock, 
  Wind, 
  Disc3, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Layers,
  Heart
} from 'lucide-react';
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
            Stage / Clases
          </span>
        );
      default:
        return (
          <span className="bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/60 px-2.5 py-0.5 rounded text-[10px] tracking-widest uppercase font-bold shadow-sm">
            Milonga
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(event)}
      className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-[#241714] border-2 border-[#d4af37] ring-4 ring-[#d4af37]/20 shadow-2xl shadow-black'
          : 'bg-[#1b1210] border border-[#d4af37]/35 hover:border-[#d4af37]/80 hover:bg-[#201512] shadow-lg shadow-black/60'
      } ${isCancelled ? 'opacity-80 border-rose-900/60' : ''}`}
    >
      {/* Filet intérieur doré discret style ticket */}
      <div className="absolute inset-1.5 rounded-xl border border-[#d4af37]/15 pointer-events-none" />

      {/* En-tête : Badge Type + Favori + Badge Détour */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          {getTypeBadge(event.type)}
          {event.organizer.verified && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#f5d77f] font-medium bg-[#120b0a] px-2 py-0.5 rounded-full border border-[#d4af37]/30">
              <CheckCircle2 className="w-3 h-3 text-[#d4af37]" />
              Sceau Vérifié
            </span>
          )}
        </div>

        {/* Détour + Bouton Favori */}
        <div className="flex items-center gap-2">
          {event.detourKm !== undefined && (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-[#120b0a] text-[#fce59e] border border-[#d4af37]/40 shadow-sm font-mono">
                <Navigation className="w-3 h-3 text-[#d4af37] rotate-45" />
                +{event.detourKm} km
                <span className="text-amber-200/50 font-normal">
                  (~{event.detourMinutes} min)
                </span>
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(event.id);
            }}
            className="p-1.5 rounded-md bg-[#120b0a] border border-[#d4af37]/30 hover:border-[#d4af37] transition cursor-pointer"
            title={isFav ? 'Retirer des favoris' : 'Sauvegarder pour ma route (hors-ligne)'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFav ? 'fill-rose-500 text-rose-500' : 'text-amber-200/60 hover:text-rose-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Titre & Ville */}
      <div className="mb-2 relative z-10">
        <h3 className={`text-base font-tango-serif font-bold text-[#f5d77f] leading-snug group-hover:text-amber-200 transition flex items-center justify-between ${
          isCancelled ? 'line-through text-amber-200/40' : ''
        }`}>
          <span className="tracking-wide">{event.title}</span>
          <ChevronRight className="w-4 h-4 text-[#d4af37] group-hover:translate-x-1 transition flex-shrink-0" />
        </h3>
        <p className="text-xs text-amber-200/80 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-[#d4af37] flex-shrink-0" />
          <span className="font-semibold text-[#f7f2e7]">{event.city}</span> ({event.postalCode}) • {event.organizer.name}
        </p>
      </div>

      {/* Bannière Alerte si Annulé */}
      {isCancelled && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-[#3a0d14] border border-rose-500/50 flex items-center gap-2 text-xs text-rose-200 font-semibold relative z-10">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>🔴 DÉPÊCHE : {event.cancellationReason || 'Milonga annulée par l’organisateur'}</span>
        </div>
      )}

      {/* Détails Danseur : Sol, Clim, Horaires, Tarif */}
      <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#d4af37]/20 my-2 relative z-10 text-amber-200/80">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="font-mono text-[#f7f2e7]">{event.startTime} - {event.endTime}</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-[#f5d77f]">
          <span>{event.price}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate text-amber-100 font-medium">{event.floor}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {event.airConditioning ? (
            <span className="flex items-center gap-1 text-[#8ec8db] font-medium">
              <Wind className="w-3.5 h-3.5 text-[#5b8ea6]" />
              Climatisation ❄️
            </span>
          ) : (
            <span className="text-amber-200/40">Sans clim</span>
          )}
        </div>
      </div>

      {/* Musicalisateur (DJ) & Guidage GPS */}
      <div className="flex items-center justify-between pt-1 text-xs relative z-10">
        <div className="flex items-center gap-1.5 text-amber-200/80 truncate max-w-[62%]">
          <Disc3 className="w-3.5 h-3.5 text-[#d4af37] flex-shrink-0 animate-[spin_10s_linear_infinite]" />
          <span className="truncate font-semibold text-[#f5d77f]">
            {event.dj}
          </span>
        </div>

        {/* Boutons Waze / Maps façon boutons laiton */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <a
            href={gpsLinks.waze}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-md bg-[#120b0a] hover:bg-[#8e1c2e] text-[#fce59e] text-[11px] font-bold border border-[#d4af37]/50 hover:border-[#d4af37] transition shadow-sm"
            title="Lancer Waze"
          >
            Waze
          </a>
          <a
            href={gpsLinks.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-md bg-[#120b0a] hover:bg-[#8e1c2e] text-[#fce59e] text-[11px] font-bold border border-[#d4af37]/50 hover:border-[#d4af37] transition shadow-sm"
            title="Lancer Google Maps"
          >
            Maps
          </a>
        </div>
      </div>
    </div>
  );
};
