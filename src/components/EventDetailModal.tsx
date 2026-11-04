import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Navigation, 
  Wind, 
  ShieldCheck, 
  Disc3, 
  Music, 
  Car, 
  ShoppingBag, 
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Layers,
  Heart
} from 'lucide-react';
import type { TangoEvent } from '../types/tango';
import { getGpsNavigationLinks } from '../services/routingService';
import { useAuth } from '../context';
import { ParityGauge } from './ParityGauge';
import { NomadLogisticsBlock } from './NomadLogisticsBlock';
import { AttendeesBlock } from './AttendeesBlock';
import { CarpoolBlock } from './CarpoolBlock';
import { formatEventDate } from '../modules/nearby';

interface EventDetailModalProps {
  event: TangoEvent | null;
  onClose: () => void;
  onToggleCancellation: (eventId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onToggleCancellation,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();

  if (!event) return null;

  const isFav = isFavorite(event.id);
  const gpsLinks = getGpsNavigationLinks(event);
  const isCancelled = event.status === 'cancelled';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#1b1210] rounded-3xl shadow-2xl border-2 border-[#d4af37]/70 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Filet décoratif supérieur */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#d4af37]" />

        {/* Bandeau d'en-tête façon salon prestigieux */}
        <div className={`p-5 sm:p-6 text-[#f7f2e7] relative border-b border-[#d4af37]/30 ${
          isCancelled 
            ? 'bg-[#2a1215]' 
            : 'bg-gradient-to-r from-[#8e1c2e] via-[#6e1423] to-[#251310]'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[#120b0a] text-[#fce59e] border border-[#d4af37]/50 shadow-sm">
                  {event.type}
                </span>
                {event.organizer.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#120b0a]/70 text-[#f5d77f] border border-[#d4af37]/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                    Sceau Asso Vérifiée
                  </span>
                )}
                {isCancelled && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white animate-pulse">
                    🔴 ANNULÉ PAR L'ASSO
                  </span>
                )}
              </div>

              <h2 className={`text-xl sm:text-2xl font-bold tracking-wide text-[#fce59e] ${
                isCancelled ? 'line-through text-red-300/60' : ''
              }`}>
                {event.title}
              </h2>
              <p className="text-xs text-amber-200/90 mt-1 flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                {event.address}, <span className="font-semibold text-[#f7f2e7]">{event.city}</span> ({event.postalCode})
              </p>
              <p className="text-xs text-[#fce59e] mt-1 font-semibold capitalize">
                📅 {formatEventDate(event.date, true)} · {event.startTime}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => toggleFavorite(event.id)}
                className="w-9 h-9 rounded-full bg-[#120b0a]/70 hover:bg-[#120b0a] border border-[#d4af37]/40 text-[#f5d77f] flex items-center justify-center transition cursor-pointer"
                title={isFav ? "Retirer des favoris" : "Sauvegarder pour ma route (hors-ligne)"}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-amber-200/70 hover:text-rose-400'}`} />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#120b0a]/70 hover:bg-[#120b0a] border border-[#d4af37]/40 text-[#f5d77f] flex items-center justify-center transition flex-shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bandeau Détour calculé */}
          {event.detourKm !== undefined && (
            <div className="mt-4 pt-3 border-t border-[#d4af37]/20 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-amber-100 font-medium flex items-center gap-1.5">
                <Navigation className="w-4 h-4 rotate-45 text-[#f5d77f]" />
                Détour depuis votre itinéraire :
              </span>
              <span className="font-bold bg-[#120b0a] text-[#fce59e] px-3 py-1 rounded-md border border-[#d4af37]/60 shadow-sm font-mono">
                +{event.detourKm} km (~{event.detourMinutes} min)
              </span>
            </div>
          )}
        </div>

        {/* Message d'alerte en cas d'annulation */}
        {isCancelled && (
          <div className="bg-[#3a0d14] border-b border-rose-500/40 p-4 text-xs sm:text-sm text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Dépêche d'urgence émise par l'association :</p>
              <p className="mt-0.5 text-rose-100">
                {event.cancellationReason || "Événement exceptionnellement annulé ce soir. Une alternative à proximité vous sera proposée."}
              </p>
            </div>
          </div>
        )}

        {/* Corps des 4 Blocs d'informations */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[62vh] overflow-y-auto">
          
          {/* L'ESSENTIEL & ENTRADA */}
          <section className="bg-[#150d0b] rounded-2xl p-4 border border-[#d4af37]/35 shadow-inner">
            <div className="flex items-center justify-between mb-3 border-b border-[#d4af37]/20 pb-2">
              <h3 className="text-xs font-bold font-display uppercase tracking-wide text-[#f5d77f] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                L'Essentiel & Entrée
              </h3>
              <span className="text-[10px] text-amber-200/60 uppercase tracking-wider font-semibold">Registre Milonguero</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="sm:col-span-2">
                <span className="text-[11px] text-amber-200/80 uppercase font-semibold tracking-wide block">Date</span>
                <span className="font-bold text-[#fce59e] capitalize">📅 {formatEventDate(event.date, true)}</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-200/80 uppercase font-semibold tracking-wide block">Horaires du bal</span>
                <span className="font-semibold text-[#f7f2e7] font-mono">{event.startTime} à {event.endTime}</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-200/80 uppercase font-semibold tracking-wide block">Entrée & Tarif</span>
                <span className="font-bold text-[#f5d77f]">{event.price}</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-200/80 uppercase font-semibold tracking-wide block">Association organisatrice</span>
                <span className="font-semibold text-[#f7f2e7]">{event.organizer.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-200/80 uppercase font-semibold tracking-wide block">Contact & Permanence</span>
                <span className="font-medium text-amber-200/90">{event.organizer.email || event.organizer.phone || 'Vérifié par la communauté'}</span>
              </div>
            </div>
          </section>

          {/* CONFORT & SOL DU DANSEUR (PISTA DE BAILE) */}
          <section className="bg-[#150d0b] rounded-2xl p-4 border border-[#d4af37]/35 shadow-inner">
            <div className="flex items-center justify-between mb-3 border-b border-[#d4af37]/20 pb-2">
              <h3 className="text-xs font-bold font-display uppercase tracking-wide text-[#f5d77f] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#d4af37]" />
                Confort de la Piste & Sol
              </h3>
              <span className="text-[10px] text-amber-200/60 uppercase tracking-wider font-semibold">Critère Danseur</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-200/80">Qualité du sol :</span>
                <span className="font-bold text-[#fce59e] bg-[#221411] px-2.5 py-0.5 rounded border border-[#d4af37]/50">
                  {event.floor}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-200/80">Climatisation :</span>
                {event.airConditioning ? (
                  <span className="font-bold text-[#9dd3e4] bg-[#12242d] px-2.5 py-0.5 rounded border border-[#5b8ea6]/60 flex items-center gap-1 text-xs">
                    <Wind className="w-3.5 h-3.5 text-[#5b8ea6]" />
                    Salle climatisée ❄️
                  </span>
                ) : (
                  <span className="text-amber-200/50 font-medium text-xs">Non climatisé</span>
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="text-[11px] text-amber-200/80 uppercase font-semibold tracking-wide block">Parking & Voyageurs avec bagages :</span>
                <span className="font-medium text-[#f7f2e7] flex items-center gap-1.5 mt-0.5 text-xs sm:text-sm">
                  <Car className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                  {event.parking}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[11px] text-amber-200/80 uppercase font-semibold tracking-wide block">Confitería, Bar & Restauration :</span>
                <span className="font-medium text-[#f7f2e7] flex items-center gap-1.5 mt-0.5 text-xs sm:text-sm">
                  <Coffee className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
                  {event.catering}
                </span>
              </div>
            </div>
          </section>

          {/* AMBIANCE & MUSICALITÉ (ORQUESTA & DJ) */}
          <section className="bg-[#150d0b] rounded-2xl p-4 border border-[#d4af37]/35 shadow-inner">
            <div className="flex items-center justify-between mb-3 border-b border-[#d4af37]/20 pb-2">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-[#f5d77f] flex items-center gap-1.5">
                <Disc3 className="w-4 h-4 text-[#d4af37]" />
                Ambiance & Musicalité
              </h3>
              <span className="text-[10px] text-amber-200/50 uppercase tracking-widest">Época de Oro</span>
            </div>
            <div className="space-y-2.5 text-sm">
              <div>
                <span className="text-[11px] text-amber-200/80 uppercase font-semibold tracking-wide block">Code de bal & Étiquette</span>
                <span className="font-semibold text-[#f7f2e7]">{event.vibe}</span>
              </div>
              <div>
                <span className="text-[11px] text-amber-200/80 uppercase font-semibold tracking-wide block">Musicalisateur (DJ)</span>
                <span className="font-bold text-[#f5d77f] text-base">{event.dj}</span>
                <p className="text-xs text-amber-200/80 mt-0.5">{event.djStyle}</p>
              </div>
              {event.liveMusic && (
                <div className="bg-[#241311] p-3 rounded-xl border border-[#d4af37]/40">
                  <span className="text-xs font-bold text-[#f5d77f] flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-[#d4af37]" />
                    Orquesta Típica / Musique Live
                  </span>
                  <p className="text-xs text-amber-100 font-medium mt-0.5">{event.liveMusic}</p>
                </div>
              )}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="font-medium text-amber-200/80">
                  Inscription : {event.registrationRequired ? 'Obligatoire' : 'Entrée libre sur place'}
                </span>
                {event.roleBalanceEnforced && (
                  <span className="text-[#fce59e] font-semibold bg-[#8e1c2e]/60 px-2.5 py-0.5 rounded border border-[#d4af37]/40">
                    Parité guides / suiveurs veillée
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* PARITÉ PRÉVISIONNELLE (Guides / Suiveurs / Double rôle) */}
          {event.expected_attendance && (
            <section className="bg-[#150d0b] rounded-2xl p-4 border border-[#d4af37]/35 shadow-inner">
              <div className="flex items-center justify-between mb-3 border-b border-[#d4af37]/20 pb-2">
                <h3 className="text-xs font-bold font-display uppercase tracking-wide text-[#f5d77f]">
                  ⚖️ Parité prévisionnelle
                </h3>
                <span className="text-[10px] text-amber-200/60 uppercase tracking-wider font-semibold">Indicatif</span>
              </div>
              <ParityGauge attendance={event.expected_attendance} />
            </section>
          )}

          {/* HALTE NOMADE & BIVOUAC */}
          {event.nomad_logistics && <NomadLogisticsBlock logistics={event.nomad_logistics} />}

          {/* DANSEURS ANNONCÉS (masqué en Mode Découverte) */}
          <AttendeesBlock attendees={event.attendees} />

          {/* COVOIT' MILONGA : annonces directes WhatsApp / SMS */}
          <CarpoolBlock event={event} />

          {/* EXPOSANTS & SHOPPING (CHAUSSURES DE TANGO) */}
          {event.exhibitors && event.exhibitors.length > 0 && (
            <section className="bg-[#150d0b] rounded-2xl p-4 border border-[#d4af37]/35 shadow-inner">
              <div className="flex items-center justify-between mb-2.5 border-b border-[#d4af37]/20 pb-2">
                <h3 className="text-xs font-bold font-display uppercase tracking-wide text-[#f5d77f] flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                  Souliers & Vêtements de Tango
                </h3>
                <span className="text-[10px] text-amber-200/50 uppercase tracking-widest">Boutiques</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.exhibitors.map((ex) => (
                  <span 
                    key={ex}
                    className="px-3 py-1 rounded-md text-xs font-semibold bg-[#241714] text-[#fce59e] border border-[#d4af37]/40"
                  >
                    👠 {ex}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* GUIDAGE GPS DIRECT */}
          <div className="pt-2">
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-[#f5d77f] mb-2 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#d4af37]" />
              Lancer la navigation immédiate
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              <a
                href={gpsLinks.waze}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-xl bg-[#211412] hover:bg-[#8e1c2e] border border-[#d4af37]/50 hover:border-[#d4af37] text-[#fce59e] font-bold text-xs sm:text-sm text-center flex flex-col items-center justify-center gap-1 transition shadow-sm"
              >
                <span>Waze</span>
                <span className="text-[10px] font-normal text-amber-200/60">Guidage temps réel</span>
              </a>
              <a
                href={gpsLinks.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-xl bg-[#211412] hover:bg-[#8e1c2e] border border-[#d4af37]/50 hover:border-[#d4af37] text-[#fce59e] font-bold text-xs sm:text-sm text-center flex flex-col items-center justify-center gap-1 transition shadow-sm"
              >
                <span>Google Maps</span>
                <span className="text-[10px] font-normal text-amber-200/60">Calcul GPS</span>
              </a>
              <a
                href={gpsLinks.appleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 rounded-xl bg-[#211412] hover:bg-[#8e1c2e] border border-[#d4af37]/50 hover:border-[#d4af37] text-[#fce59e] font-bold text-xs sm:text-sm text-center flex flex-col items-center justify-center gap-1 transition shadow-sm"
              >
                <span>Apple Maps</span>
                <span className="text-[10px] font-normal text-amber-200/60">Plans iOS</span>
              </a>
            </div>
          </div>

        </div>

        {/* Pied de modal avec simulateur d'urgence façon cachet */}
        <div className="p-4 bg-[#120b0a] border-t border-[#d4af37]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-amber-200/70 flex items-center gap-1.5 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
            <span className="font-serif-tango italic">Fiche tenue à jour avec la milonga organisatrice.</span>
          </div>

          <button
            type="button"
            onClick={() => onToggleCancellation(event.id)}
            className={`w-full sm:w-auto px-3.5 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider ${
              isCancelled
                ? 'bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-500'
                : 'bg-[#3a0d14] hover:bg-[#52131d] text-rose-200 border border-rose-500/50'
            }`}
            title="Tester le canal d'urgence : simuler un signalement par l'association"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            {isCancelled ? 'Rétablir la milonga (Simu)' : 'Simuler alerte urgence asso'}
          </button>
        </div>

      </div>
    </div>
  );
};
