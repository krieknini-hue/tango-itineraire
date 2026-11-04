import React, { useState } from 'react';
import { X, Trash2, MessageCircle, Smartphone } from 'lucide-react';
import {
  DEFAULT_DRAFT,
  ROLE_META,
  VISIBILITY_META,
  buildActivationLinks,
  buildActivationMessage,
  normalizePhone,
  profileManager,
  useProfileState,
  type ProfileDraft,
  type TangueroProfile,
} from '../services/profileManager';
import type { DanceRole, ProfileVisibility } from '../types/tango';
import { MembershipCard } from './MembershipCard';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES: DanceRole[] = ['leader', 'follower', 'both'];
const VISIBILITIES: ProfileVisibility[] = ['friends', 'public', 'ghost'];

const labelCls = 'text-[11px] uppercase font-semibold tracking-wide text-amber-200/80';
const inputCls =
  'mt-1 w-full min-h-[44px] px-3 rounded-xl bg-[#150d0b] border border-[#d4af37]/40 text-[#f7f2e7] text-base focus:outline-none focus:border-[#d4af37]';

const optionBtn = (active: boolean) =>
  `flex-1 min-h-[52px] px-2 py-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
    active
      ? 'bg-gradient-to-b from-[#8e1c2e] to-[#6d1320] text-[#fce59e] border-[#d4af37] shadow-md'
      : 'bg-[#150d0b] text-amber-200/70 border-[#d4af37]/25 hover:border-[#d4af37]/60'
  }`;

/** Boutons Reverse Ping (WhatsApp / SMS) pré-remplis */
const ActivationLinks: React.FC<{ profile: TangueroProfile }> = ({ profile }) => {
  const links = buildActivationLinks(profile);
  return (
    <div className="space-y-2">
      <p className="text-xs text-amber-100/90">
        Envoie ce message tel quel pour activer ton compte (gratuit, aucun SMS payant) :
      </p>
      <code className="block px-3 py-2 rounded-lg bg-[#120b0a] border border-[#d4af37]/30 text-[#fce59e] text-xs break-all select-all">
        {buildActivationMessage(profile)}
      </code>
      <div className="grid grid-cols-2 gap-2">
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[48px] rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-500 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
        <a
          href={links.sms}
          className="min-h-[48px] rounded-xl bg-[#211412] hover:bg-[#2e1c19] text-[#fce59e] border border-[#d4af37]/60 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Smartphone className="w-4 h-4" /> SMS
        </a>
      </div>
    </div>
  );
};

const RoleVisibilityFields: React.FC<{
  draft: Pick<ProfileDraft, 'role' | 'visibility'>;
  onChange: (patch: Partial<Pick<ProfileDraft, 'role' | 'visibility'>>) => void;
}> = ({ draft, onChange }) => (
  <>
    <fieldset>
      <legend className={`${labelCls} mb-1`}>Rôle de danse *</legend>
      <div className="flex gap-2" role="radiogroup" aria-label="Rôle de danse">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={draft.role === r}
            onClick={() => onChange({ role: r })}
            className={optionBtn(draft.role === r)}
          >
            <span className="text-lg leading-none">{ROLE_META[r].emoji}</span>
            <span>{ROLE_META[r].short}</span>
          </button>
        ))}
      </div>
    </fieldset>

    <fieldset>
      <legend className={`${labelCls} mb-1`}>Visibilité par défaut</legend>
      <div className="flex gap-2" role="radiogroup" aria-label="Visibilité par défaut">
        {VISIBILITIES.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={draft.visibility === v}
            onClick={() => onChange({ visibility: v })}
            className={optionBtn(draft.visibility === v)}
          >
            <span className="text-lg leading-none">{VISIBILITY_META[v].emoji}</span>
            <span className="text-center leading-tight">{VISIBILITY_META[v].label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  </>
);

/** Inscription express (aucun compte existant) */
const RegisterForm: React.FC<{ onDone: (p: TangueroProfile) => void }> = ({ onDone }) => {
  const [draft, setDraft] = useState<ProfileDraft>(DEFAULT_DRAFT);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const canSubmit = draft.name.trim().length > 0 && draft.phone.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = normalizePhone(draft.phone);
    if (!phone) {
      setPhoneError('Format international attendu, ex : +33612345678');
      return;
    }
    const profile = profileManager.register({ ...draft, phone });
    // Reverse Ping : ouverture directe dans le geste utilisateur (pas bloqué par le navigateur)
    window.open(buildActivationLinks(profile).whatsapp, '_blank', 'noopener,noreferrer');
    onDone(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className={labelCls}>Prénom / Pseudo *</span>
          <input
            type="text"
            value={draft.name}
            maxLength={30}
            autoComplete="nickname"
            placeholder="Ex : Léa"
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Ville d'attache</span>
          <input
            type="text"
            value={draft.homeCity}
            maxLength={40}
            autoComplete="address-level2"
            placeholder="Ex : Tours (facultatif)"
            onChange={(e) => setDraft({ ...draft, homeCity: e.target.value })}
            className={inputCls}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>Mobile (format international) *</span>
        <input
          type="tel"
          inputMode="tel"
          value={draft.phone}
          autoComplete="tel"
          placeholder="+33612345678"
          onChange={(e) => {
            setDraft({ ...draft, phone: e.target.value });
            setPhoneError(null);
          }}
          className={inputCls}
          aria-invalid={phoneError !== null}
        />
        {phoneError && <span className="block mt-1 text-xs text-rose-300">{phoneError}</span>}
      </label>

      <RoleVisibilityFields draft={draft} onChange={(patch) => setDraft({ ...draft, ...patch })} />

      <p className="text-[11px] text-amber-200/60">
        🔒 Données stockées uniquement sur cet appareil. Pas de mot de passe : tu valides en nous
        envoyant un message WhatsApp pré-rempli.
      </p>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full min-h-[48px] rounded-xl bg-[#8e1c2e] hover:bg-[#aa2137] disabled:opacity-40 text-[#fce59e] border border-[#d4af37]/70 font-bold text-sm uppercase tracking-wide transition cursor-pointer disabled:cursor-not-allowed"
      >
        Valider mon inscription
      </button>
    </form>
  );
};

/** Écran de confirmation après inscription */
const ActivationStep: React.FC<{ profile: TangueroProfile; onClose: () => void }> = ({ profile, onClose }) => (
  <div className="p-5 space-y-4 overflow-y-auto">
    <p className="text-sm text-[#f7f2e7]">
      ✅ Bienvenue <strong className="text-[#f5d77f]">{profile.name}</strong> ! Ton profil est enregistré
      sur cet appareil.
    </p>
    <ActivationLinks profile={profile} />
    <button
      type="button"
      onClick={onClose}
      className="w-full min-h-[48px] rounded-xl bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/70 font-bold text-sm uppercase tracking-wide cursor-pointer"
    >
      Terminer
    </button>
  </div>
);

/** Édition de la fiche existante (téléphone non modifiable) */
const EditForm: React.FC<{ profile: TangueroProfile; onClose: () => void }> = ({ profile, onClose }) => {
  const [draft, setDraft] = useState({
    name: profile.name,
    homeCity: profile.homeCity,
    role: profile.role,
    visibility: profile.visibility,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    profileManager.update(draft);
    onClose();
  };

  return (
    <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
      {/* Carte d'adhérent virtuelle & cotisation */}
      <MembershipCard profile={profile} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className={labelCls}>Prénom / Pseudo *</span>
          <input
            type="text"
            value={draft.name}
            maxLength={30}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className={labelCls}>Ville d'attache</span>
          <input
            type="text"
            value={draft.homeCity}
            maxLength={40}
            onChange={(e) => setDraft({ ...draft, homeCity: e.target.value })}
            className={inputCls}
          />
        </label>
      </div>

      <p className="text-xs text-amber-200/70">
        📱 Mobile : <span className="font-mono text-[#f5d77f]">{profile.phone}</span>
      </p>

      <RoleVisibilityFields draft={draft} onChange={(patch) => setDraft({ ...draft, ...patch })} />

      <details className="rounded-xl border border-[#d4af37]/25 p-3">
        <summary className="text-xs font-semibold text-amber-200/80 cursor-pointer">
          Renvoyer le message d'activation
        </summary>
        <div className="mt-3">
          <ActivationLinks profile={profile} />
        </div>
      </details>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            profileManager.clearProfile();
            onClose();
          }}
          className="min-h-[48px] px-3 rounded-xl bg-[#3a0d14] text-rose-200 border border-rose-500/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          title="Supprimer mon profil de cet appareil"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
        <button
          type="submit"
          disabled={!draft.name.trim()}
          className="flex-1 min-h-[48px] rounded-xl bg-[#8e1c2e] hover:bg-[#aa2137] disabled:opacity-40 text-[#fce59e] border border-[#d4af37]/70 font-bold text-sm uppercase tracking-wide transition cursor-pointer disabled:cursor-not-allowed"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
};

const ModalBody: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { profile } = useProfileState();
  const [justRegistered, setJustRegistered] = useState<TangueroProfile | null>(null);

  if (justRegistered) return <ActivationStep profile={justRegistered} onClose={onClose} />;
  if (profile) return <EditForm profile={profile} onClose={onClose} />;
  return <RegisterForm onDone={setJustRegistered} />;
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useProfileState();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={profile ? 'Ma fiche danseur' : 'Créer mon profil'}
        className="w-full sm:max-w-md max-h-[92vh] flex flex-col bg-[#1b1210] border-t-2 sm:border-2 border-[#d4af37]/70 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-200 pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[#d4af37]/40 sm:hidden" />
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-[#d4af37]/25">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#f5d77f]">
            {profile ? 'Ma fiche danseur' : 'Inscription express'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-[#120b0a]/70 border border-[#d4af37]/40 text-[#f5d77f] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* key : repart d'un état propre à chaque ouverture */}
        <ModalBody key={String(isOpen)} onClose={onClose} />
      </div>
    </div>
  );
};
