import React from 'react';
import type { ExpectedAttendance } from '../types/tango';

interface Props {
  attendance: ExpectedAttendance;
  /** Variante compacte (sans légende détaillée) */
  compact?: boolean;
}

/** Mini-barre de parité Guides / Suiveurs / Double rôle (indicative) */
export const ParityGauge: React.FC<Props> = ({ attendance, compact = false }) => {
  const total = attendance.leaders + attendance.followers + attendance.both;
  if (total <= 0) return null;

  const pct = (n: number) => Math.round((n / total) * 100);
  const l = pct(attendance.leaders);
  const f = pct(attendance.followers);
  const b = Math.max(0, 100 - l - f);

  return (
    <div
      className="space-y-1.5"
      role="img"
      aria-label={`Parité prévisionnelle : ${l}% guides, ${f}% suiveurs, ${b}% double rôle`}
    >
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#120b0a] border border-[#d4af37]/25">
        <div className="bg-emerald-500 transition-all" style={{ width: `${l}%` }} />
        <div className="bg-purple-500 transition-all" style={{ width: `${f}%` }} />
        <div className="bg-amber-400 transition-all" style={{ width: `${b}%` }} />
      </div>
      {!compact && (
        <div className="flex flex-wrap justify-between gap-x-3 text-[11px] font-semibold text-amber-100/90">
          <span>🟢 Guides {l}%</span>
          <span>🟣 Suiveurs {f}%</span>
          <span>🔄 Double {b}%</span>
        </div>
      )}
    </div>
  );
};
