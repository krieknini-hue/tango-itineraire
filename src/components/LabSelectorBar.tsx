import React from 'react';
import { FlaskConical, Palette, Compass, RotateCcw, HelpCircle } from 'lucide-react';

export type UxMode = 'tunnel_gps' | 'tunnel_guichet' | 'tunnel_cockpit' | 'classic';
export type DesignTheme = '1950' | 'midnight' | 'tortoni' | 'cockpit_oled';

interface LabSelectorBarProps {
  uxMode: UxMode;
  setUxMode: (mode: UxMode) => void;
  designTheme: DesignTheme;
  setDesignTheme: (theme: DesignTheme) => void;
  onResetTunnel: () => void;
  onOpenGuide: () => void;
}

export const LabSelectorBar: React.FC<LabSelectorBarProps> = ({
  uxMode,
  setUxMode,
  designTheme,
  setDesignTheme,
  onResetTunnel,
  onOpenGuide,
}) => {
  return (
    <div className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-[#d4af37]/50 px-2.5 py-2 text-xs shadow-xl">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Ligne supérieure mobile : Badge Test + Bouton Guide + Bouton Étape 1 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[#f5d77f] font-bold min-w-0">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#8e1c2e] border border-[#d4af37] text-[#fce59e] shrink-0">
              <FlaskConical className="w-3.5 h-3.5" />
            </span>
            <span className="uppercase tracking-wider text-[11px] truncate">
              Labo Test
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenGuide}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1b1210] hover:bg-[#2a1a17] text-[#f5d77f] border border-[#d4af37]/60 font-bold text-[11px] transition cursor-pointer"
              title="Voir le didacticiel rapide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Guide</span>
            </button>

            {uxMode !== 'classic' && (
              <button
                type="button"
                onClick={onResetTunnel}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8e1c2e] hover:bg-[#a62237] text-[#fce59e] border border-[#d4af37]/60 font-bold text-[11px] transition cursor-pointer shadow-sm"
                title="Revenir à l'étape 1 du tunnel"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Étape 1</span>
              </button>
            )}
          </div>
        </div>

        {/* Grille 2 colonnes sur mobile : Zéro débordement hors écran */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {/* Menu déroulant Parcours / Tunnel */}
          <div className="flex items-center gap-1.5 bg-[#1b1210] border border-[#d4af37]/50 rounded-lg px-2 py-1.5 min-w-0">
            <Compass className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <select
              id="ux-mode-select"
              value={uxMode}
              onChange={(e) => setUxMode(e.target.value as UxMode)}
              className="w-full min-w-0 truncate bg-transparent text-[#fce59e] font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="tunnel_gps" className="bg-[#1b1210] text-[#fce59e]">
                1. 🛣️ Tunnel GPS (3 étapes)
              </option>
              <option value="tunnel_guichet" className="bg-[#1b1210] text-[#fce59e]">
                2. 🎟️ Guichet Express
              </option>
              <option value="tunnel_cockpit" className="bg-[#1b1210] text-[#fce59e]">
                3. 🚘 Cockpit Autoradio
              </option>
              <option value="classic" className="bg-[#1b1210] text-[#fce59e]">
                4. 📜 Vue Classique
              </option>
            </select>
          </div>

          {/* Menu déroulant Design / Thème */}
          <div className="flex items-center gap-1.5 bg-[#1b1210] border border-[#d4af37]/50 rounded-lg px-2 py-1.5 min-w-0">
            <Palette className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <select
              id="design-theme-select"
              value={designTheme}
              onChange={(e) => setDesignTheme(e.target.value as DesignTheme)}
              className="w-full min-w-0 truncate bg-transparent text-[#fce59e] font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="1950" className="bg-[#1b1210] text-[#fce59e]">
                🕯️ 1950 Acajou & Or
              </option>
              <option value="midnight" className="bg-[#0b1324] text-sky-200">
                🌙 Milonga de Minuit
              </option>
              <option value="tortoni" className="bg-[#f5ecd9] text-[#2b1810]">
                ☕ Café Tortoni Jour
              </option>
              <option value="cockpit_oled" className="bg-black text-amber-400">
                🚘 Cockpit OLED Noir
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
