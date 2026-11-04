import React, { useState } from 'react';
import { X, ExternalLink, HeartHandshake } from 'lucide-react';
import {
  ASSOCIATION_NAME,
  MEMBERSHIP_TIERS,
  SEASON_LABEL,
  buildPaymentUrl,
  formatMemberNumber,
  membershipStore,
  useMembership,
} from '../modules/membership';
import { ROLE_META, type TangueroProfile } from '../services/profileManager';

/** Modal d'adhésion : démarche associative + montant libre + redirection guichet externe */
const AdhesionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [amount, setAmount] = useState(MEMBERSHIP_TIERS[0].amount);
  const [redirected, setRedirected] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Adhésion à l'association"
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-[#1b1210] border-t-2 sm:border-2 border-[#d4af37]/70 rounded-t-3xl sm:rounded-3xl shadow-2xl pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#d4af37]/25">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#f5d77f] flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#d4af37]" /> Adhérer à l'association
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-[#120b0a]/70 border border-[#d4af37]/40 text-[#f5d77f] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-amber-100/90">
          <p>
            <strong className="text-[#f5d77f]">{ASSOCIATION_NAME}</strong> est une association loi 1901 à but non
            lucratif. Ta cotisation finance l'hébergement, la cartographie libre et la vérification humaine des
            milongas. Aucune pub, aucune revente de données. L'app reste utilisable sans adhérer.
          </p>

          <fieldset>
            <legend className="text-[11px] uppercase font-semibold tracking-wide text-amber-200/80 mb-1.5">
              Montant
            </legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Montant de la cotisation">
              {MEMBERSHIP_TIERS.map((t) => (
                <button
                  key={t.amount}
                  type="button"
                  role="radio"
                  aria-checked={amount === t.amount}
                  onClick={() => setAmount(t.amount)}
                  className={`min-h-[72px] px-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
                    amount === t.amount
                      ? 'bg-gradient-to-b from-[#8e1c2e] to-[#6d1320] text-[#fce59e] border-[#d4af37] shadow-md'
                      : 'bg-[#150d0b] text-amber-200/70 border-[#d4af37]/25 hover:border-[#d4af37]/60'
                  }`}
                >
                  <span className="text-lg font-bold font-mono">{t.amount} €</span>
                  <span className="text-[10px] leading-tight text-center">{t.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <a
            href={buildPaymentUrl(amount)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setRedirected(true)}
            className="w-full min-h-[50px] rounded-xl bg-[#8e1c2e] hover:bg-[#aa2137] text-[#fce59e] border border-[#d4af37]/70 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2"
          >
            Payer {amount} € sur le guichet de l'asso <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-[11px] text-amber-200/60 text-center">
            Paiement sécurisé sur le site de l'association (HelloAsso / Stripe). Rien n'est encaissé dans l'app.
          </p>

          {redirected && (
            <button
              type="button"
              onClick={() => {
                membershipStore.declarePaid(amount);
                onClose();
              }}
              className="w-full min-h-[46px] rounded-xl bg-[#122a1f] text-emerald-200 border border-emerald-500/60 font-bold text-xs cursor-pointer"
            >
              ✅ J'ai réglé ma cotisation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/** Carte « membre tanguero nomade » (en tête du Profil) */
export const MembershipCard: React.FC<{ profile: TangueroProfile }> = ({ profile }) => {
  const membership = useMembership();
  const [modalOpen, setModalOpen] = useState(false);
  const active = membership.status === 'active';

  return (
    <div className="space-y-2.5">
      <div
        className={`relative overflow-hidden rounded-2xl p-4 border-2 shadow-lg ${
          active
            ? 'bg-gradient-to-br from-[#3a2a0a] via-[#2a1713] to-[#120b0a] border-[#f5d77f]'
            : 'bg-gradient-to-br from-[#2a1713] to-[#120b0a] border-[#d4af37]/40'
        }`}
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full border border-[#d4af37]/15" aria-hidden />
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#d4af37]">
          {ASSOCIATION_NAME} — {SEASON_LABEL}
        </p>
        <p className="mt-0.5 text-[10px] italic text-amber-200/60">Carte de membre tanguero nomade</p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-lg font-bold text-[#fce59e] truncate">{profile.name}</p>
            <p className="text-xs text-amber-100/80">
              {ROLE_META[profile.role].emoji} {ROLE_META[profile.role].label}
            </p>
          </div>
          <span
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
              active
                ? 'bg-gradient-to-r from-[#d4af37] to-[#f5d77f] text-[#120b0a] border-[#fce59e] shadow-md'
                : 'bg-[#1b1210] text-amber-200/80 border-[#d4af37]/30'
            }`}
          >
            {active ? '★ Membre Actif' : 'Membre Découverte (Essai gratuit)'}
          </span>
        </div>

        <p className="mt-3 pt-2 border-t border-[#d4af37]/20 text-[11px] text-amber-200/70 flex justify-between">
          <span>N° adhérent</span>
          <span className="font-mono font-bold text-[#f5d77f] select-all">{formatMemberNumber(profile)}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full min-h-[46px] rounded-xl bg-[#211412] hover:bg-[#2e1c19] text-[#fce59e] border border-[#d4af37]/60 text-xs font-bold cursor-pointer"
      >
        Régler ou renouveler ma cotisation (2 €)
      </button>

      {modalOpen && <AdhesionModal onClose={() => setModalOpen(false)} />}
    </div>
  );
};
