import React from 'react';
import { FlaskConical, Palette, Compass, RotateCcw } from 'lucide-react';

export type UxMode = 'tunnel_gps' | 'tunnel_guichet' | 'tunnel_cockpit' | 'classic';
export type DesignTheme = '1950' | 'midnight' | 'tortoni' | 'cockpit_oled';

interface LabSelectorBarProps {
  uxMode: UxMode;
  setUxMode: (mode: UxMode) => void;
  designTheme: DesignTheme;
  setDesignTheme: (theme: DesignTheme) => void;
  onResetTunnel: () => void;
}

export const LabSelectorBar: React.FC<LabSelectorBarProps> = ({
  uxMode,
  setUxMode,
  designTheme,
  setDesignTheme,
  onResetTunnel,
}) => {
  return (
    <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-md border-b border-[#d4af37]/50 px-2.5 py-2 text-xs shadow-xl">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Badge Labo Test */}
        <div className="flex items-center gap-1.5 text-[#f5d77f] font-bold">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#8e1c2e] border border-[#d4af37] text-[#fce59e]">
            <FlaskConical className="w-3.5 h-3.5" />
          </span>
          <span className="uppercase tracking-wider text-[11px] hidden sm:inline">
            Mode Test :
          </span>
        </div>

        {/* Sélecteurs déroulants Version UX + Design */}
        <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial justify-end">
          {/* Menu déroulant Parcours / Tunnel */}
          <div className="flex items-center gap-1.5 bg-[#1b1210] border border-[#d4af37]/50 rounded-lg px-2 py-1">
            <Compass className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <label htmlFor="ux-mode-select" className="text-[10px] uppercase tracking-wider text-amber-200/70 hidden md:inline font-semibold">
              Parcours :
            </label>
            <select
              id="ux-mode-select"
              value={uxMode}
              onChange={(e) => setUxMode(e.target.value as UxMode)}
              className="bg-transparent text-[#fce59e] font-bold text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="tunnel_gps" className="bg-[#1b1210] text-[#fce59e]">
                1. 🛣️ Tunnel GPS 3 Étapes (Mobile & Route)
              </option>
              <option value="tunnel_guichet" className="bg-[#1b1210] text-[#fce59e]">
                2. 🎟️ Tunnel Guichet Express (2 clics)
              </option>
              <option value="tunnel_cockpit" className="bg-[#1b1210] text-[#fce59e]">
                3. 🚘 Mode Cockpit Autoradio (Conduite)
              </option>
              <option value="classic" className="bg-[#1b1210] text-[#fce59e]">
                4. 📜 Vue Complète Classique (Originale)
              </option>
            </select>
          </div>

          {/* Menu déroulant Design / Thème */}
          <div className="flex items-center gap-1.5 bg-[#1b1210] border border-[#d4af37]/50 rounded-lg px-2 py-1">
            <Palette className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <label htmlFor="design-theme-select" className="text-[10px] uppercase tracking-wider text-amber-200/70 hidden md:inline font-semibold">
              Design :
            </label>
            <select
              id="design-theme-select"
              value={designTheme}
              onChange={(e) => setDesignTheme(e.target.value as DesignTheme)}
              className="bg-transparent text-[#fce59e] font-bold text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="1950" className="bg-[#1b1210] text-[#fce59e]">
                🕯️ Buenos Aires 1950 (Acajou & Or)
              </option>
              <option value="midnight" className="bg-[#0b1324] text-sky-200">
                🌙 Milonga de Minuit (Bleu Nuit & Cuivre)
              </option>
              <option value="tortoni" className="bg-[#f5ecd9] text-[#2b1810]">
                ☕ Café Tortoni Jour (Crème & Sépia)
              </option>
              <option value="cockpit_oled" className="bg-black text-amber-400">
                🚘 Cockpit OLED (Noir Pur & Ambre)
              </option>
            </select>
          </div>

          {/* Bouton Rejouer le tunnel */}
          {uxMode !== 'classic' && (
            <button
              type="button"
              onClick={onResetTunnel}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8e1c2e] hover:bg-[#a62237] text-[#fce59e] border border-[#d4af37]/60 font-bold text-[11px] transition cursor-pointer shadow-sm"
              title="Revenir à l'étape 1 du tunnel"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Étape 1</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
