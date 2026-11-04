import React from 'react';
import { X, PhoneCall, Mail, AlertTriangle, Award } from 'lucide-react';
import { BandoneonIcon } from './FileteadoOrnaments';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-[#1b1210] rounded-3xl shadow-2xl border-2 border-[#d4af37]/70 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bandeau d'en-tête façon télégramme officiel */}
        <div className="p-5 sm:p-6 bg-[#120b0a] border-b border-[#d4af37]/40 text-[#f7f2e7] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#261512] border border-[#d4af37] flex items-center justify-center text-[#f5d77f] shadow-md">
              <BandoneonIcon className="w-6 h-6 text-[#f5d77f]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/40">
                  Dépêche 1950
                </span>
                <h2 className="text-base sm:text-lg font-display font-bold tracking-wide text-[#f5d77f] uppercase">
                  Charte Zéro Faux Plan
                </h2>
              </div>
              <p className="text-xs text-amber-200/80 font-medium">
                Ligne d'urgence directe & engagement de fiabilité
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#241714] hover:bg-[#8e1c2e] border border-[#d4af37]/40 text-[#f5d77f] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps des 4 piliers de la charte */}
        <div className="p-5 sm:p-6 space-y-3.5 text-sm">
          <div className="flex items-start gap-3 bg-[#150d0b] p-3.5 rounded-2xl border border-[#d4af37]/30">
            <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#f5d77f] text-sm">1. Moisson douce & zéro démarche pour les assos</h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Les organisateurs de milongas bénévoles n'ont aucun formulaire technique à remplir. Ils transfèrent simplement leur calendrier par e-mail ou via leur gazette associative.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#150d0b] p-3.5 rounded-2xl border border-[#d4af37]/30">
            <PhoneCall className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-300 text-sm">2. Dépêche d'urgence WhatsApp en 5 secondes</h4>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Un imprévu météo, un DJ malade ou une salle fermée ? L'organisateur envoie une note vocale ou un message WhatsApp et le statut bascule immédiatement.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#240e11] p-3.5 rounded-2xl border border-rose-500/40">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-300 text-sm">3. Redirection du danseur en route</h4>
              <p className="text-xs text-rose-100/90 mt-0.5">
                L'étape passe en 🔴 <b>ANNULÉ</b> sur votre itinéraire avec proposition instantanée d'une milonga ou pratique alternative sur l'axe routier.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#150d0b] p-3.5 rounded-2xl border border-[#d4af37]/30">
            <Award className="w-5 h-5 text-[#f5d77f] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-[#fce59e] text-sm">4. Éthique Asso Loi 1901 (2 € / an)</h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                6 mois d'accès 100% libre et gratuit pour bâtir la communauté, puis une cotisation symbolique de 2 € par an pour préserver un service indépendant sans publicité.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#120b0a] border-t border-[#d4af37]/30 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#8e1c2e] hover:bg-[#aa2137] border border-[#d4af37] text-[#fce59e] font-display font-bold text-xs uppercase tracking-wide rounded-xl transition cursor-pointer shadow-md"
          >
            Fermer le Registre
          </button>
        </div>
      </div>
    </div>
  );
};
