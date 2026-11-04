import React from 'react';
import type { NomadLogistics } from '../types/tango';

interface Props {
  logistics: NomadLogistics;
}

const Badge: React.FC<{ ok: boolean; icon: string; label: string }> = ({ ok, icon, label }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
      ok
        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
        : 'bg-[#1d1513] text-amber-200/40 border-[#d4af37]/15 line-through'
    }`}
    aria-label={`${label} : ${ok ? 'disponible' : 'non disponible'}`}
  >
    <span aria-hidden>{icon}</span>
    {label}
  </span>
);

/** Sous-bloc « Halte Nomade & Bivouac » de la fiche événement */
export const NomadLogisticsBlock: React.FC<Props> = ({ logistics }) => (
  <section className="bg-[#150d0b] rounded-2xl p-4 border border-[#d4af37]/35 shadow-inner">
    <div className="flex items-center justify-between mb-3 border-b border-[#d4af37]/20 pb-2">
      <h3 className="text-xs font-bold font-display uppercase tracking-wide text-[#f5d77f]">
        🚐 Halte Nomade &amp; Bivouac
      </h3>
      <span className="text-[10px] text-amber-200/60 uppercase tracking-wider font-semibold">
        Van · Tente de toit
      </span>
    </div>
    <div className="flex flex-wrap gap-2">
      <Badge ok={logistics.overnight_parking} icon="🚐" label="Nuitée tolérée" />
      <Badge ok={logistics.toilets_accessible} icon="🚻" label="Toilettes" />
      <Badge ok={logistics.showers_available} icon="🚿" label="Douches" />
      <Badge ok={logistics.potable_water} icon="💧" label="Eau potable" />
    </div>
    {logistics.parking_notes && (
      <p className="mt-3 text-xs text-amber-100/90 italic border-l-2 border-[#d4af37]/50 pl-2">
        {logistics.parking_notes}
      </p>
    )}
  </section>
);
