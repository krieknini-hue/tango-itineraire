import React, { useState } from 'react';
import { X, HeartHandshake, CheckCircle2, ShieldCheck, Sparkles, Download, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { MembershipReceipt } from '../types/auth';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, payCotisation } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<MembershipReceipt | null>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    if (!isAuthenticated) {
      onClose();
      onOpenAuth();
      return;
    }

    setIsProcessing(true);
    const res = await payCotisation();
    setIsProcessing(false);

    if (res.success && res.receipt) {
      setReceipt(res.receipt);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#1b1210] w-full max-w-lg rounded-2xl shadow-2xl border-2 border-[#d4af37]/60 overflow-hidden text-[#f7f2e7]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* En-tête */}
        <div className="bg-[#120b0a] text-[#fce59e] px-5 py-4 flex items-center justify-between border-b border-[#d4af37]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#251310] border border-[#d4af37] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-[#f5d77f]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm tracking-wider uppercase text-[#f5d77f]">
                Cotisation Associative — 2 € / an
              </h3>
              <p className="text-[11px] font-serif-tango italic text-amber-200/70">
                Association Loi 1901 « Tango Itinéraire » • Buenos Aires 1950
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-200/60 hover:text-[#f5d77f] hover:bg-[#241714] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-5">
          
          {/* Reçu si cotisation validée */}
          {receipt || user?.isCotisationPaid ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#122a1f] border border-emerald-500/50 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-300 text-base">
                  Cotisation Active pour 2026 / 2027
                </h4>
                <p className="text-xs text-emerald-100/80">
                  Merci infiniment pour votre soutien à l'association et à la communauté tango !
                </p>
              </div>

              {/* Carte Membre & Reçu façon livret */}
              <div className="p-4 bg-[#150d0b] border border-[#d4af37]/35 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#d4af37]/20 pb-2">
                  <span className="text-amber-200/70 font-medium">Adhérent :</span>
                  <span className="font-bold text-[#f7f2e7] font-mono">{user?.phone}</span>
                </div>
                <div className="flex justify-between border-b border-[#d4af37]/20 pb-2">
                  <span className="text-amber-200/70 font-medium">Montant acquitté :</span>
                  <span className="font-bold text-[#f5d77f]">2,00 € TTC (Cotisation annuelle)</span>
                </div>
                <div className="flex justify-between border-b border-[#d4af37]/20 pb-2">
                  <span className="text-amber-200/70 font-medium">N° Attestation :</span>
                  <span className="font-mono text-[#fce59e]">
                    {receipt?.receiptNumber || `TI-2026-${user?.id?.slice(-6).toUpperCase()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200/70 font-medium">Organisme :</span>
                  <span className="font-semibold text-amber-100">Association Tango Itinéraire (RNA W372019842)</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 px-4 bg-[#241714] hover:bg-[#8e1c2e] border border-[#d4af37] text-[#fce59e] font-display font-bold text-xs uppercase tracking-wide rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4 text-[#f5d77f]" />
                Imprimer mon attestation d'adhésion
              </button>
            </div>
          ) : (
            <>
              {/* Statut période d'essai actuelle */}
              <div className="bg-[#241714] border border-[#d4af37]/40 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#f5d77f] flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-[#f5d77f] text-sm">Période Découverte 6 Mois Active</p>
                  <p className="text-amber-200/75">
                    L'application est 100% offerte pendant la phase de lancement. Vous pouvez régulariser votre
                    cotisation dès maintenant pour soutenir l'hébergement et la cartographie.
                  </p>
                </div>
              </div>

              {/* Pourquoi 2 € ? */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#fce59e] uppercase tracking-wide text-xs">
                  Pourquoi une cotisation de 2 € / an ?
                </h4>
                <ul className="space-y-1.5 list-disc pl-4 text-amber-200/80">
                  <li>Financer les serveurs et les tuiles cartographiques libres sans dépendre de géants tech.</li>
                  <li>Maintenir la veille et la validation humaine des milongas et marathons.</li>
                  <li>Assurer la ligne d'urgence WhatsApp 7j/7 pour éviter tout faux plan en route.</li>
                  <li>Zéro publicité commerciale, zéro revente de données personnelles.</li>
                </ul>
              </div>

              {/* Bouton de paiement Stripe 1 clic */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePay}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#8e1c2e] to-[#731221] hover:from-[#aa2137] hover:to-[#8e1c2e] border border-[#d4af37] text-[#fce59e] font-display font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl transition shadow-xl shadow-black cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 text-[#f5d77f]" />
                  {isProcessing
                    ? 'Traitement sécurisé Stripe...'
                    : 'Régulariser ma cotisation 2 € (1 clic)'}
                </button>

                <p className="text-[11px] text-center text-amber-200/60 flex items-center justify-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                  Paiement sécurisé par Stripe (Apple Pay, Google Pay, Cartes Bancaires)
                </p>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
