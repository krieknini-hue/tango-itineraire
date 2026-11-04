import React, { useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import {
  loadOrganizerUpdate,
  nextOccurrences,
  saveOrganizerUpdate,
  type OccurrenceStatus,
  type OrganizerSpace,
  type OrganizerUpdate,
} from '../modules/organizer';

const LOGISTICS: { key: keyof OrganizerUpdate['logistics']; label: string; emoji: string }[] = [
  { key: 'overnight_parking', label: 'Nuitée véhicule tolérée', emoji: '🚐' },
  { key: 'toilets_accessible', label: 'Accès toilettes nocturnes', emoji: '🚻' },
  { key: 'showers_available', label: 'Douches vestiaires', emoji: '🚿' },
];

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const YesNo: React.FC<{ label: string; emoji: string; value: boolean; onChange: (v: boolean) => void }> = ({
  label,
  emoji,
  value,
  onChange,
}) => (
  <div className="flex items-center justify-between gap-3 bg-[#150d0b] border border-[#d4af37]/25 rounded-xl p-3">
    <span className="text-sm font-semibold text-[#f7f2e7]">
      {emoji} {label}
    </span>
    <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`min-w-[56px] min-h-[44px] rounded-xl border text-xs font-bold cursor-pointer transition ${
            value === v
              ? v
                ? 'bg-emerald-800 text-white border-emerald-400'
                : 'bg-[#3a0d14] text-rose-200 border-rose-500'
              : 'bg-[#120b0a] text-amber-200/60 border-[#d4af37]/25'
          }`}
        >
          {v ? 'Oui' : 'Non'}
        </button>
      ))}
    </div>
  </div>
);

/** Espace Organisateur simplifié (lien magique, sans compte) */
export const OrganizerView: React.FC<{ space: OrganizerSpace }> = ({ space }) => {
  const [occurrences] = useState(() => nextOccurrences(space.rule, 4));
  const [draft, setDraft] = useState<OrganizerUpdate>(() => loadOrganizerUpdate(space.token));
  const [savedAt, setSavedAt] = useState<string | null>(() => loadOrganizerUpdate(space.token).savedAt ?? null);

  const setStatus = (date: string, status: OccurrenceStatus) =>
    setDraft((d) => ({ ...d, statuses: { ...d.statuses, [date]: status } }));

  const save = () => {
    const saved = saveOrganizerUpdate(space.token, draft);
    setSavedAt(saved.savedAt ?? null);
  };

  return (
    <div className="min-h-screen bg-[#120b0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a1713]/70 via-[#150d0c] to-[#0d0706] text-[#f7f2e7] font-sans pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <header className="px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-4 border-b border-[#d4af37]/30 bg-[#120b0a]/80">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#d4af37]">Espace Organisateur</p>
        <h1 className="font-display text-xl font-bold text-[#fce59e]">{space.name}</h1>
        <p className="text-xs text-amber-200/70">
          {space.venue} · {space.city} — confirme tes dates en 15 secondes
        </p>
      </header>

      <main className="max-w-xl mx-auto px-3 pt-4 space-y-5">
        <section className="space-y-3" aria-label="Prochaines dates">
          <h2 className="text-xs font-display font-bold text-[#f5d77f] uppercase tracking-wider">
            4 prochaines dates
          </h2>
          {occurrences.map((o) => {
            const status = draft.statuses[o.date] ?? 'pending';
            return (
              <div
                key={o.date}
                className={`rounded-2xl p-3.5 border-2 space-y-3 ${
                  status === 'confirmed'
                    ? 'border-emerald-500/60 bg-[#10241b]'
                    : status === 'cancelled'
                      ? 'border-rose-500/60 bg-[#2a1215]'
                      : 'border-[#d4af37]/35 bg-[#1b1210]'
                }`}
              >
                <p className="font-bold capitalize text-[#f7f2e7]">
                  {formatDate(o.date)}{' '}
                  <span className="font-mono text-xs text-amber-200/70">
                    {o.startTime}–{o.endTime}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(o.date, 'confirmed')}
                    aria-pressed={status === 'confirmed'}
                    className={`min-h-[56px] rounded-xl border-2 font-bold text-sm cursor-pointer transition ${
                      status === 'confirmed'
                        ? 'bg-emerald-700 text-white border-emerald-300'
                        : 'bg-[#150d0b] text-emerald-200 border-emerald-700/60'
                    }`}
                  >
                    ✅ Confirmé
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(o.date, 'cancelled')}
                    aria-pressed={status === 'cancelled'}
                    className={`min-h-[56px] rounded-xl border-2 font-bold text-sm leading-tight cursor-pointer transition ${
                      status === 'cancelled'
                        ? 'bg-rose-800 text-white border-rose-300'
                        : 'bg-[#150d0b] text-rose-200 border-rose-700/60'
                    }`}
                  >
                    🔴 Annulé ce mois-ci
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        <section className="space-y-2" aria-label="Logistique nomade">
          <h2 className="text-xs font-display font-bold text-[#f5d77f] uppercase tracking-wider">
            Logistique nomade
          </h2>
          {LOGISTICS.map((l) => (
            <YesNo
              key={l.key}
              label={l.label}
              emoji={l.emoji}
              value={draft.logistics[l.key]}
              onChange={(v) => setDraft((d) => ({ ...d, logistics: { ...d.logistics, [l.key]: v } }))}
            />
          ))}
        </section>

        <button
          type="button"
          onClick={save}
          className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-[#8e1c2e] to-[#6d1320] hover:from-[#aa2137] hover:to-[#8e1c2e] border-2 border-[#d4af37] text-[#fce59e] font-display font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-black/50"
        >
          <Save className="w-5 h-5" /> Enregistrer mes mises à jour
        </button>

        {savedAt && (
          <p role="status" className="text-xs text-emerald-300 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Enregistré à{' '}
            {new Date(savedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </main>
    </div>
  );
};
