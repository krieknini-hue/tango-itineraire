import React from 'react';
import { Palette, Compass, RotateCcw, HelpCircle, X, Settings } from 'lucide-react';

export type UxMode = 'tunnel_gps' | 'tunnel_guichet' | 'tunnel_cockpit' | 'classic';
export type DesignTheme = '1950' | 'midnight' | 'tortoni' | 'cockpit_oled';

interface LabSelectorBarProps {
  isOpen: boolean;
  onClose: () => void;
  uxMode: UxMode;
  setUxMode: (mode: UxMode) => void;
  designTheme: DesignTheme;
  setDesignTheme: (theme: DesignTheme) => void;
  onResetTunnel: () => void;
  onOpenGuide: () => void;
}

export const LabSelectorBar: React.FC<LabSelectorBarProps> = ({
  isOpen,
  onClose,
  uxMode,
  setUxMode,
  designTheme,
  setDesignTheme,
  onResetTunnel,
  onOpenGuide,
}) => {
  if (!isOpen) return null;

  const uxOptions: { id: UxMode; label: string; desc: string }[] = [
    {
      id: 'tunnel_guichet',
      label: '🎟️ Tunnel Guichet Express (Par défaut)',
      desc: 'Accueil « Sur la route » ou « Autour d’une ville » en 2 clics',
    },
    {
      id: 'tunnel_gps',
      label: '🛣️ Tunnel GPS 3 Étapes',
      desc: '1. Trajet ➔ 2. Route & Détour ➔ 3. Carrousel d’escales',
    },
    {
      id: 'tunnel_cockpit',
      label: '🚘 Mode Cockpit Autoradio',
      desc: 'Boutons XXL spécial conduite & focus prochaine escale',
    },
    {
      id: 'classic',
      label: '📜 Vue Complète Classique',
      desc: 'Formulaire complet, carte et liste sur une seule page',
    },
  ];

  const themeOptions: { id: DesignTheme; label: string }[] = [
    { id: '1950', label: '🕯️ Buenos Aires 1950 (Acajou & Or)' },
    { id: 'midnight', label: '🌙 Milonga de Minuit (Bleu Nuit & Cuivre)' },
    { id: 'tortoni', label: '☕ Café Tortoni Jour (Crème & Sépia)' },
    { id: 'cockpit_oled', label: '🚘 Cockpit OLED (Noir Pur & Ambre)' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-sm bg-[#1b1210] border-l-2 border-[#d4af37] h-full p-5 text-[#f7f2e7] shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        aria-label="Tiroir Labo Test"
      >
        <div className="space-y-5">
          {/* En-tête du tiroir Labo */}
          <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#8e1c2e] border border-[#d4af37] flex items-center justify-center text-[#fce59e]">
                <Settings className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#f5d77f]">
                  Labo Test & Apparence
                </h2>
                <p className="text-[11px] text-amber-200/70">
                  Change de parcours ou de thème en 1 clic
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#120b0a] border border-[#d4af37]/40 flex items-center justify-center text-amber-200 hover:text-white cursor-pointer"
              aria-label="Fermer le Labo Test"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Choix du Parcours (UX) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#d4af37]" />
              Version du Parcours (Tunnel)
            </label>
            <div className="space-y-2">
              {uxOptions.map((opt) => {
                const active = uxMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setUxMode(opt.id);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer ${
                      active
                        ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37] shadow-md'
                        : 'bg-[#120b0a] text-amber-100 border-[#d4af37]/25 hover:border-[#d4af37]/60'
                    }`}
                  >
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div className="text-[11px] text-amber-200/75 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Choix du Design */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#d4af37]" />
              Ambiance Visuelle (Design)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {themeOptions.map((th) => {
                const active = designTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setDesignTheme(th.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-[#8e1c2e] text-[#fce59e] border-[#d4af37] shadow-md'
                        : 'bg-[#120b0a] text-amber-100 border-[#d4af37]/25 hover:border-[#d4af37]/60'
                    }`}
                  >
                    {th.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions rapides en bas du tiroir */}
        <div className="pt-4 border-t border-[#d4af37]/25 space-y-2">
          <button
            type="button"
            onClick={() => {
              onResetTunnel();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#120b0a] hover:bg-[#251815] text-[#f5d77f] border border-[#d4af37]/50 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revenir à l'écran d'accueil (Étape 1)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenGuide();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#120b0a] hover:bg-[#251815] text-amber-200 border border-[#d4af37]/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Revoir le didacticiel (4 étapes)</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
