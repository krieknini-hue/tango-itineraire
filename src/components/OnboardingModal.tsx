import React, { useState } from 'react';
import {
  X,
  Route,
  Sparkles,
  Navigation,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { FileteadoCorner } from './FileteadoOrnaments';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [slide, setSlide] = useState<0 | 1 | 2>(0);

  if (!isOpen) return null;

  const slides = [
    {
      badge: 'Étape 1 / 3 • Le Concept',
      icon: <Route className="w-8 h-8 text-[#f5d77f]" />,
      title: 'Trouve les milongas sur ta route',
      description:
        "Plus besoin de chercher ville par ville : indique ton départ et ta destination, l'application scanne tout ton trajet routier.",
      points: [
        'Choix entre trajet Rapide (Autoroute) ou Flâneur (0 € péage).',
        'Rayon de détour réglable (de 15 km à 60 km autour de ta route).',
        'Fonctionne aussi autour d’une seule ville pour le soir même.',
      ],
    },
    {
      badge: 'Étape 2 / 3 • Pensé pour les Danseurs',
      icon: <Sparkles className="w-8 h-8 text-[#f5d77f]" />,
      title: 'Toutes les infos avant de t’arrêter',
      description:
        'Chaque salon est présenté comme un billet de milonga avec uniquement ce qui compte vraiment pour danser :',
      points: [
        'Qualité du sol (parquet amorti, bois, carrelage) & climatisation ❄️.',
        'Horaires précis, tarif, DJ / musicalisateur et parking bagages.',
        'Bouton ❤️ Favoris : garde tes salons en mémoire même sans réseau 4G.',
      ],
    },
    {
      badge: 'Étape 3 / 3 • En Voiture & Zéro Faux Plan',
      icon: <Navigation className="w-8 h-8 text-[#f5d77f] rotate-45" />,
      title: 'Guidage 1-clic & Alertes en direct',
      description:
        'Utilisable d’une seule main sur téléphone ou sur l’écran de ton autoradio :',
      points: [
        'Boutons directs vers Waze et Google Maps sans ressaisir l’adresse.',
        'Ligne Zéro Faux Plan : si une milonga est annulée à la dernière minute, elle passe en 🔴 ANNULÉ.',
        'En haut de l’écran, utilise les menus déroulants pour tester les 3 tunnels et les 4 ambiances !',
      ],
    },
  ];

  const current = slides[slide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#1b1210] border-2 border-[#d4af37] rounded-3xl p-5 sm:p-6 shadow-2xl text-[#f7f2e7] overflow-hidden">
        <div className="absolute top-2.5 left-2.5 pointer-events-none">
          <FileteadoCorner position="top-left" className="w-8 h-8 text-[#d4af37]/60" />
        </div>
        <div className="absolute top-2.5 right-2.5 pointer-events-none">
          <FileteadoCorner position="top-right" className="w-8 h-8 text-[#d4af37]/60" />
        </div>

        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#120b0a] border border-[#d4af37]/50 flex items-center justify-center text-amber-200 hover:text-white cursor-pointer z-10"
          aria-label="Fermer le didacticiel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* En-tête */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8e1c2e] to-[#420b14] border-2 border-[#d4af37] flex items-center justify-center shadow-lg">
            {current.icon}
          </div>
          <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#120b0a] text-[#f5d77f] border border-[#d4af37]/40">
            {current.badge}
          </span>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#f5d77f] leading-snug">
            {current.title}
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/85 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Liste des points clés */}
        <div className="my-4 space-y-2 bg-[#120b0a] p-3.5 rounded-2xl border border-[#d4af37]/30">
          {current.points.map((pt, i) => (
            <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#f7f2e7]">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
              <span>{pt}</span>
            </div>
          ))}
        </div>

        {/* Indicateurs de pages (dots) */}
        <div className="flex items-center justify-center gap-2 my-3">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSlide(idx as 0 | 1 | 2)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                slide === idx ? 'w-7 bg-[#d4af37]' : 'w-2 bg-[#d4af37]/30'
              }`}
              aria-label={`Aller à l'étape ${idx + 1}`}
            />
          ))}
        </div>

        {/* Boutons Précédent / Suivant / Commencer */}
        <div className="flex items-center gap-2.5 pt-1">
          {slide > 0 ? (
            <button
              type="button"
              onClick={() => setSlide((s) => (s - 1) as 0 | 1 | 2)}
              className="py-3 px-4 rounded-xl bg-[#120b0a] border border-[#d4af37]/40 text-xs font-bold text-amber-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-[#120b0a] border border-[#d4af37]/30 text-xs font-bold text-amber-200/70 cursor-pointer"
            >
              Passer
            </button>
          )}

          {slide < 2 ? (
            <button
              type="button"
              onClick={() => setSlide((s) => (s + 1) as 0 | 1 | 2)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8e1c2e] to-[#6d1320] text-[#fce59e] border border-[#d4af37] font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
            >
              <span>Suivant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8e1c2e] via-[#aa2137] to-[#731221] text-[#fce59e] border-2 border-[#d4af37] font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xl cursor-pointer"
            >
              <span>C'est parti !</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
