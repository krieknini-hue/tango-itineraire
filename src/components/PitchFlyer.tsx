import React, { useState } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  Compass, 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  Music, 
  Footprints, 
  BellRing
} from 'lucide-react';
import { BandoneonIcon, FileteadoCorner, FileteadoDivider } from './FileteadoOrnaments';

interface PitchFlyerProps {
  onClose?: () => void;
  organizerName?: string;
  milongaTitle?: string;
  city?: string;
}

export const PitchFlyer: React.FC<PitchFlyerProps> = ({
  organizerName = 'Association Tango & Milongas',
  milongaTitle = 'Votre Milonga',
  city = 'France'
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `TANGO ITINÉRAIRE — Les milongas sur la route des danseurs
Initiative associative Loi 1901 — 100% Gratuite & Bénévole

🎯 LE CONCEPT :
Connecter les danseurs en déplacement (vacances, week-ends, tournées) aux milongas et pratiques sur leur route sans détour inutile.

💡 POURQUOI POUR LES ORGANISATEURS ?
1. 100% Gratuit & Sans frais : Aucun abonnement ni commission.
2. Nouveaux danseurs à vos portes : Les milongueros de passage roulant sur votre secteur sont guidés jusqu'à votre salle.
3. Valorisation de vos atouts : Parquet amorti, DJ, style musical, code de danse, vestiaire, clim, et créateurs exposants.
4. Ligne Zéro Faux Plan : Canal direct d'urgence en direct en cas d'imprévu.

Découvrez l'outil et votre fiche : https://tango-itineraire.fr`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Barre d'actions supérieure (masquée à l'impression) */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-4 border-b border-[#d4af37]/30 mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/50">
            Support Visuel Officiel A4
          </span>
          <span className="text-xs text-amber-200/70 hidden sm:inline">
            Prêt à imprimer ou à partager aux organisateurs
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#211412] text-[#f5d77f] border border-[#d4af37]/40 hover:bg-[#2d1b18] hover:border-[#d4af37] transition cursor-pointer"
            title="Copier le résumé texte pour un message"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
            <span>{copied ? 'Copié !' : 'Copier le pitch'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#120b0a] hover:from-[#e5c158] hover:to-[#c49f38] transition shadow-md cursor-pointer"
            title="Imprimer ou enregistrer en PDF au format A4"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / PDF A4</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT VISUEL A4 (Feuille imprimable avec dorures & style 1950) */}
      <div 
        id="pitch-flyer-printable"
        className="w-full max-w-4xl bg-[#1b1210] text-[#fcf8f0] p-6 sm:p-10 rounded-2xl border-2 border-[#d4af37] shadow-2xl relative overflow-hidden print:p-8 print:border-none print:shadow-none print:bg-white print:text-neutral-900"
      >
        {/* Ornements d'angle Fileteado */}
        <FileteadoCorner position="top-left" className="absolute top-2 left-2 w-12 h-12 text-[#d4af37]/80 print:text-amber-800" />
        <FileteadoCorner position="top-right" className="absolute top-2 right-2 w-12 h-12 text-[#d4af37]/80 print:text-amber-800" />
        <FileteadoCorner position="bottom-left" className="absolute bottom-2 left-2 w-12 h-12 text-[#d4af37]/80 print:text-amber-800" />
        <FileteadoCorner position="bottom-right" className="absolute bottom-2 right-2 w-12 h-12 text-[#d4af37]/80 print:text-amber-800" />

        {/* En-tête de la Plaquette */}
        <div className="text-center relative z-10 pt-2 mb-6">
          <div className="inline-flex items-center justify-center gap-3 px-4 py-1 rounded-full bg-[#8e1c2e]/80 border border-[#d4af37]/60 text-[#fce59e] text-xs font-bold uppercase tracking-widest mb-3 print:bg-rose-900 print:text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Association Loi 1901 • Projet Bénévole & Solidaire
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#8e1c2e] via-[#4a0d18] to-[#120b0a] border border-[#d4af37] flex items-center justify-center shadow-lg print:border-amber-800">
              <BandoneonIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#f5d77f] print:text-amber-700" />
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-wider text-[#f5d77f] uppercase print:text-neutral-950">
              Tango Itinéraire
            </h1>
          </div>

          <p className="font-display text-base sm:text-lg text-amber-200/90 italic font-medium print:text-neutral-800">
            « Ne laissez plus aucun milonguero passer à côté de votre piste »
          </p>

          <FileteadoDivider className="my-4 max-w-md mx-auto" />
        </div>

        {/* Pitch en 3 lignes percutantes */}
        <div className="bg-[#120b0a]/80 p-4 sm:p-5 rounded-xl border border-[#d4af37]/40 mb-6 print:bg-amber-50/60 print:border-amber-700/30">
          <p className="text-sm sm:text-base text-amber-100/95 leading-relaxed text-center font-serif print:text-neutral-900">
            Chaque semaine, des centaines de danseurs de tango sillonnent les autoroutes de France 
            (vacances, festivals, déplacements) <strong>sans savoir qu’ils passent à 15 minutes de votre salle</strong>.
            <br className="hidden sm:inline" />
            <strong>Tango Itinéraire</strong> calcule automatiquement leur trajet et les guide jusqu’à votre porte, 
            avec le temps et les kilomètres de détour exacts.
          </p>
        </div>

        {/* Les 4 Engagements pour les Organisateurs */}
        <div className="mb-8">
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#f5d77f] uppercase tracking-wide text-center mb-5 flex items-center justify-center gap-2 print:text-neutral-950">
            <span>❦</span>
            Ce que cela apporte à votre association
            <span>❦</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Avantage 1 */}
            <div className="p-4 rounded-xl bg-[#211412] border border-[#d4af37]/30 hover:border-[#d4af37] transition print:bg-white print:border-neutral-300 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#8e1c2e]/60 border border-[#d4af37]/50 flex items-center justify-center text-amber-300 print:bg-amber-100 print:text-amber-900">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-sm text-[#f5d77f] uppercase print:text-neutral-900">
                  100% Gratuit & Bénévole
                </h3>
              </div>
              <p className="text-xs text-amber-100/80 leading-normal print:text-neutral-700">
                Aucun abonnement, zéro commission, aucune publicité intrusive. Le projet est porté par une association Loi 1901 pour dynamiser les pistes locales.
              </p>
            </div>

            {/* Avantage 2 */}
            <div className="p-4 rounded-xl bg-[#211412] border border-[#d4af37]/30 hover:border-[#d4af37] transition print:bg-white print:border-neutral-300 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#8e1c2e]/60 border border-[#d4af37]/50 flex items-center justify-center text-amber-300 print:bg-amber-100 print:text-amber-900">
                  <Footprints className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-sm text-[#f5d77f] uppercase print:text-neutral-900">
                  Nouveaux Danseurs de Passage
                </h3>
              </div>
              <p className="text-xs text-amber-100/80 leading-normal print:text-neutral-700">
                Vos milongas apparaissent automatiquement aux danseurs roulant dans un rayon de 5 à 60 km. Un flux continu de visiteurs pour enrichir vos rondes !
              </p>
            </div>

            {/* Avantage 3 */}
            <div className="p-4 rounded-xl bg-[#211412] border border-[#d4af37]/30 hover:border-[#d4af37] transition print:bg-white print:border-neutral-300 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#8e1c2e]/60 border border-[#d4af37]/50 flex items-center justify-center text-amber-300 print:bg-amber-100 print:text-amber-900">
                  <Music className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-sm text-[#f5d77f] uppercase print:text-neutral-900">
                  Vos Atouts Mis en Valeur
                </h3>
              </div>
              <p className="text-xs text-amber-100/80 leading-normal print:text-neutral-700">
                Chaque fiche met en avant votre sol (parquet amorti), DJ invité, style musical, code mirada/cabeceo, clim, vestiaire et exposants créateurs partenaires.
              </p>
            </div>

            {/* Avantage 4 */}
            <div className="p-4 rounded-xl bg-[#211412] border border-[#d4af37]/30 hover:border-[#d4af37] transition print:bg-white print:border-neutral-300 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#8e1c2e]/60 border border-[#d4af37]/50 flex items-center justify-center text-amber-300 print:bg-amber-100 print:text-amber-900">
                  <BellRing className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-sm text-[#f5d77f] uppercase print:text-neutral-900">
                  Ligne Zéro Faux Plan
                </h3>
              </div>
              <p className="text-xs text-amber-100/80 leading-normal print:text-neutral-700">
                Un orage ou un imprévu de salle ? Prévenez les danseurs en direct en 1 clic grâce à notre canal d’alerte d’urgence instantané.
              </p>
            </div>
          </div>
        </div>

        {/* Démonstration Visuelle du Corridor Routier */}
        <div className="bg-gradient-to-r from-[#211412] via-[#2d1b18] to-[#211412] p-5 rounded-xl border border-[#d4af37]/40 mb-8 print:bg-neutral-100 print:border-neutral-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-4 h-4 text-[#d4af37] print:text-amber-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#f5d77f] print:text-neutral-900">
                  Exemple concret en temps réel :
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-100/90 print:text-neutral-800">
                Un couple fait le trajet <strong>Tours ➔ Cannes</strong>. En approchant de Lyon ou Avignon, 
                l’application calcule le détour : <span className="text-[#fce59e] font-semibold print:text-amber-900">« +8 km / 11 minutes de détour »</span> et propose un guidage 1 clic via <strong>Waze, Google Maps ou Apple Maps</strong> jusqu'à votre parking !
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#120b0a] border border-[#d4af37]/50 text-xs font-mono text-amber-300 print:bg-white print:text-neutral-900">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{organizerName.slice(0, 24)} • {city}</span>
            </div>
          </div>
        </div>

        {/* Bas de page / Appel à l'action & Contact */}
        <div className="pt-4 border-t border-[#d4af37]/30 flex flex-col sm:flex-row items-center justify-between gap-6 print:border-neutral-300">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-bold text-[#f5d77f] uppercase tracking-wider print:text-neutral-900">
              Comment vérifier ou modifier votre fiche ?
            </div>
            <p className="text-xs text-amber-100/80 max-w-md print:text-neutral-700">
              Votre milonga <strong>"{milongaTitle}"</strong> est déjà pré-référencée. 
              Pour ajuster vos horaires, ajouter un DJ ou des photos : écrivez-nous ou flashez le QR code !
            </p>
            <div className="text-[11px] text-[#d4af37] font-medium pt-1 print:text-neutral-800">
              ✉ contact@tango-itineraire.fr • 🌐 https://tango-itineraire.fr
            </div>
          </div>

          {/* QR Code stylisé */}
          <div className="shrink-0 flex flex-col items-center p-3 rounded-xl bg-[#120b0a] border border-[#d4af37]/60 shadow-lg print:bg-white print:border-neutral-300">
            <div className="w-20 h-20 bg-white p-1.5 rounded-lg flex items-center justify-center">
              {/* SVG QR Code stylisé et propre */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-black" fill="currentColor">
                {/* Repères coins */}
                <rect x="0" y="0" width="30" height="30" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" />

                <rect x="70" y="0" width="30" height="30" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" />

                <rect x="0" y="70" width="30" height="30" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" />

                {/* Motifs intérieurs */}
                <rect x="36" y="8" width="6" height="6" />
                <rect x="48" y="14" width="6" height="6" />
                <rect x="58" y="8" width="6" height="6" />
                
                <rect x="36" y="36" width="10" height="10" />
                <rect x="54" y="36" width="10" height="10" />
                <rect x="44" y="52" width="12" height="12" />
                <rect x="68" y="44" width="8" height="8" />

                <rect x="8" y="44" width="8" height="8" />
                <rect x="22" y="52" width="8" height="8" />

                <rect x="36" y="72" width="8" height="8" />
                <rect x="50" y="80" width="8" height="8" />
                <rect x="64" y="72" width="8" height="8" />
                <rect x="80" y="80" width="12" height="12" />
              </svg>
            </div>
            <span className="text-[9px] font-bold tracking-wider uppercase text-amber-300 mt-1.5 print:text-neutral-900">
              Flashez pour tester
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
