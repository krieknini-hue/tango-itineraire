import React, { useState } from 'react';
import { MessageCircle, Smartphone, Trash2, Plus } from 'lucide-react';
import {
  MAX_SEATS,
  buildContactLinks,
  carpoolRoleLabel,
  carpoolStore,
  useCarpoolRides,
  validateRide,
} from '../modules/carpool';
import { ROLE_META, normalizePhone, useProfileState } from '../services/profileManager';
import type { DanceRole, TangoEvent } from '../types/tango';

const labelCls = 'text-[11px] uppercase font-semibold tracking-wide text-amber-200/80';
const inputCls =
  'mt-1 w-full min-h-[44px] px-3 rounded-xl bg-[#120b0a] border border-[#d4af37]/40 text-[#f7f2e7] text-base focus:outline-none focus:border-[#d4af37]';

const ROLES: DanceRole[] = ['leader', 'follower', 'both'];

/** Formulaire ultra-court ; nom / mobile / rôle repris du profil local si présent. */
const RideForm: React.FC<{ event: TangoEvent; onDone: () => void }> = ({ event, onDone }) => {
  const { profile } = useProfileState();
  const [city, setCity] = useState(profile?.homeCity ?? '');
  const [time, setTime] = useState('19:00');
  const [seats, setSeats] = useState(3);
  // Champs complémentaires uniquement si aucun profil local
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<DanceRole>('both');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const driverName = (profile?.name ?? name).trim();
    const driverPhone = profile?.phone ?? normalizePhone(phone);
    if (!driverName) return setError('Indique ton prénom.');
    if (!driverPhone) return setError('Mobile invalide, ex : +33612345678');
    const err = validateRide({ departureCity: city, departureTime: time, seats });
    if (err) return setError(err);
    carpoolStore.add({
      eventId: event.id,
      driverName,
      driverPhone,
      driverRole: profile?.role ?? role,
      departureCity: city.trim(),
      departureTime: time,
      seats,
    });
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-3 bg-[#120b0a] border border-[#d4af37]/30 rounded-xl p-3">
      {profile ? (
        <p className="text-[11px] text-amber-200/70">
          Tu publies en tant que <strong className="text-[#f5d77f]">{profile.name}</strong> (
          {ROLE_META[profile.role].short}) · <span className="font-mono">{profile.phone}</span>
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Prénom *</span>
            <input className={inputCls} value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className={labelCls}>Mobile *</span>
            <input
              className={inputCls}
              type="tel"
              inputMode="tel"
              placeholder="+33612345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <div className="sm:col-span-2 flex gap-2" role="radiogroup" aria-label="Rôle de danse">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={role === r}
                onClick={() => setRole(r)}
                className={`flex-1 min-h-[44px] rounded-xl border text-xs font-bold cursor-pointer ${
                  role === r
                    ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37]'
                    : 'bg-[#150d0b] text-amber-200/70 border-[#d4af37]/25'
                }`}
              >
                {ROLE_META[r].emoji} {ROLE_META[r].short}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="block">
        <span className={labelCls}>Départ (ville / lieu) *</span>
        <input
          className={inputCls}
          value={city}
          maxLength={60}
          placeholder="Ex : Sortie A10 Amboise"
          onChange={(e) => setCity(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelCls}>Heure de départ *</span>
          <input className={inputCls} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <fieldset>
          <legend className={labelCls}>Places *</legend>
          <div className="mt-1 flex gap-1.5" role="radiogroup" aria-label="Nombre de places">
            {Array.from({ length: MAX_SEATS }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={seats === n}
                onClick={() => setSeats(n)}
                className={`flex-1 min-h-[44px] rounded-xl border text-sm font-bold font-mono cursor-pointer ${
                  seats === n
                    ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37]'
                    : 'bg-[#150d0b] text-amber-200/70 border-[#d4af37]/25'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {error && <p className="text-xs text-rose-300">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDone}
          className="min-h-[46px] px-4 rounded-xl bg-[#211412] text-amber-200/80 border border-[#d4af37]/30 text-xs font-bold cursor-pointer"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 min-h-[46px] rounded-xl bg-[#8e1c2e] hover:bg-[#aa2137] text-[#fce59e] border border-[#d4af37]/70 font-bold text-xs uppercase tracking-wide cursor-pointer"
        >
          Publier mon trajet
        </button>
      </div>
    </form>
  );
};

/** Section « 🚗 Covoiturages pour ce soir » de la fiche milonga */
export const CarpoolBlock: React.FC<{ event: TangoEvent }> = ({ event }) => {
  const rides = useCarpoolRides(event.id);
  const { profile } = useProfileState();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <section className="bg-[#150d0b] rounded-2xl p-4 border border-[#d4af37]/35 shadow-inner">
      <div className="flex items-center justify-between gap-2 mb-3 border-b border-[#d4af37]/20 pb-2">
        <h3 className="text-xs font-bold font-display uppercase tracking-wide text-[#f5d77f]">
          🚗 Covoiturages pour ce soir
        </h3>
        {!formOpen && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="min-h-[36px] px-3 rounded-lg bg-[#8e1c2e] hover:bg-[#aa2137] text-[#fce59e] border border-[#d4af37]/60 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Proposer un trajet
          </button>
        )}
      </div>

      {formOpen && <RideForm event={event} onDone={() => setFormOpen(false)} />}

      {rides.length === 0 && !formOpen && (
        <p className="text-xs text-amber-200/70">
          Aucune annonce pour l'instant. Propose un trajet : contact direct par WhatsApp/SMS, sans intermédiaire ni
          paiement dans l'app.
        </p>
      )}

      <ul className="space-y-2.5 mt-1">
        {rides.map((ride) => {
          const links = buildContactLinks(ride, event.title);
          const mine = profile?.phone === ride.driverPhone;
          return (
            <li key={ride.id} className="bg-[#120b0a] border border-[#d4af37]/25 rounded-xl p-3 space-y-2">
              <p className="text-sm text-[#f7f2e7] leading-snug">
                <strong className="text-[#f5d77f]">{ride.driverName}</strong> ({carpoolRoleLabel(ride.driverRole)}) •
                Départ {ride.departureCity} à <span className="font-mono">{ride.departureTime}</span> •{' '}
                <span className="font-semibold text-[#fce59e]">
                  {ride.seats} place{ride.seats > 1 ? 's' : ''} dispo
                </span>
                {ride.demo && (
                  <span className="ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#241714] text-amber-200/60 border border-[#d4af37]/20">
                    exemple
                  </span>
                )}
              </p>
              {mine ? (
                <button
                  type="button"
                  onClick={() => carpoolStore.remove(ride.id)}
                  className="min-h-[40px] px-3 rounded-lg bg-[#3a0d14] text-rose-200 border border-rose-500/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Retirer mon annonce
                </button>
              ) : ride.demo ? null : (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={links.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-500 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <a
                    href={links.sms}
                    className="min-h-[44px] rounded-xl bg-[#211412] hover:bg-[#2e1c19] text-[#fce59e] border border-[#d4af37]/60 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4" /> SMS
                  </a>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
