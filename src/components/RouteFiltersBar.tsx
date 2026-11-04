import React from 'react';

interface Props {
  overnightOnly: boolean;
  setOvernightOnly: (v: boolean) => void;
  discoveryMode: boolean;
  setDiscoveryMode: (v: boolean) => void;
}

const Chip: React.FC<{ checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }> = ({
  checked,
  onChange,
  children,
}) => (
  <label
    className={`flex items-center gap-2 min-h-[44px] px-3 rounded-xl border text-xs font-semibold cursor-pointer select-none transition ${
      checked
        ? 'bg-[#8e1c2e]/80 text-[#fce59e] border-[#d4af37]'
        : 'bg-[#1b1210] text-amber-200/80 border-[#d4af37]/30 hover:border-[#d4af37]/60'
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 accent-[#d4af37]"
    />
    {children}
  </label>
);

/** Filtres rapides communs à tous les modes (tunnels + classique) */
export const RouteFiltersBar: React.FC<Props> = ({
  overnightOnly,
  setOvernightOnly,
  discoveryMode,
  setDiscoveryMode,
}) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label="Filtres rapides">
    <Chip checked={overnightOnly} onChange={setOvernightOnly}>
      🚐 Nuitée véhicule tolérée sur place
    </Chip>
    <Chip checked={discoveryMode} onChange={setDiscoveryMode}>
      🎲 Mode Découverte / Surprise
    </Chip>
  </div>
);
