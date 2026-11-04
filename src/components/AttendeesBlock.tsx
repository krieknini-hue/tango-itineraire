import React from 'react';
import type { EventAttendee } from '../types/tango';
import { ROLE_META, VISIBILITY_META, useProfileState } from '../services/profileManager';

interface Props {
  attendees?: EventAttendee[];
}

/**
 * Danseurs annoncés sur la fiche. Masqué en Mode Découverte / Surprise.
 * Mon propre profil n'apparaît jamais si je suis en mode Fantôme.
 */
export const AttendeesBlock: React.FC<Props> = ({ attendees = [] }) => {
  const { profile, discoveryMode } = useProfileState();

  if (discoveryMode) {
    return (
      <section className="bg-[#150d0b] rounded-2xl p-3 border border-dashed border-[#d4af37]/30 text-xs text-amber-200/70">
        🎲 Mode Découverte actif : les profils des autres danseurs sont masqués.
      </section>
    );
  }

  const showMe = profile && profile.name && profile.visibility !== 'ghost';
  if (!showMe && attendees.length === 0) return null;

  return (
    <section className="bg-[#150d0b] rounded-2xl p-4 border border-[#d4af37]/35 shadow-inner">
      <h3 className="text-xs font-bold font-display uppercase tracking-wide text-[#f5d77f] mb-3 border-b border-[#d4af37]/20 pb-2">
        💃 Danseurs annoncés
      </h3>
      <ul className="flex flex-wrap gap-2">
        {showMe && (
          <li className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#8e1c2e]/60 text-[#fce59e] border border-[#d4af37]/60">
            {ROLE_META[profile.role].emoji} {profile.name} (moi) {VISIBILITY_META[profile.visibility].emoji}
          </li>
        )}
        {attendees.map((a) => (
          <li
            key={`${a.name}-${a.city ?? ''}`}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#241714] text-amber-100 border border-[#d4af37]/30"
          >
            {ROLE_META[a.role].emoji} {a.name}
            {a.city ? <span className="text-amber-200/60"> · {a.city}</span> : null}{' '}
            {VISIBILITY_META[a.visibility].emoji}
          </li>
        ))}
      </ul>
    </section>
  );
};
