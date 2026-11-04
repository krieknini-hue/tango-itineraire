# Suivi du Projet — Tango Itinéraire

## État d'avancement général
Le projet intègre les nouvelles fonctionnalités (Jauge de parité, Logistique nomade, Profil danseur, Barre de filtres rapides) ainsi que le didacticiel interactif mis à jour en 4 étapes clés.

## Tâches terminées
- [x] Mise à jour du didacticiel (OnboardingModal.tsx) en 4 étapes intégrant la parité des rôles, la logistique nomade (vans/douches/parking), les filtres rapides et le guidage 1-clic.
- [x] Compilation et validation TypeScript/Vite sans erreur.
- [x] Déploiement instantané : https://racing-sienna-zndhsem.tmp.now
- [x] Synchronisation GitHub Pages : https://krieknini-hue.github.io/tango-itineraire/

## Tâches en cours
- [ ] Revue des retours utilisateurs sur le nouveau didacticiel.

- [x] Bascule intégrale sur les données réelles scrapées (18 308 événements réels à venir) et suppression totale des fiches de démo mockEvents.ts
- [x] Pipeline automatique build:events intégré aux scripts dev et build
- [x] **Épuration par Tiroirs & Guichet Express par défaut :**
  - Suppression du bandeau permanent Labo Test ➔ remplacé par un bouton discret **Roue Dentée (`⚙️`)** dans la barre du haut qui ouvre un tiroir latéral Labo Test.
  - Allègement de la barre de navigation (`Navbar.tsx`) : seules 3 pastilles visibles (*❤️ Favoris*, *⚙️ Labo Test*, *☰ Menu*) et rangement de toutes les icônes secondaires (*Profil danseur, Didacticiel, Connexion/Cotisation, Urgences, Espace Assos*) dans un tiroir latéral.
  - Ouverture par défaut sur le **Tunnel Guichet Express** (`tunnel_guichet`) avec choix direct *« 🚗 Je suis sur la route »* ou *« 📍 Autour d'une ville »* (connecté au radar local).
  - Rangement des filtres (*Autoroute/Sans péage, Détour, Nuitée véhicule, Mode Découverte*) dans un tiroir repliable **`Options`** et allègement des cartes événements (`EventCard.tsx`) avec un tiroir **`Sol, Clim & DJ`**.
- [x] Suppression des mentions « Bloc 1 / 2 / 3 / 4 » dans `EventDetailModal.tsx` (conservation des titres purs) et déploiement systématique sur GitHub (`main` + `gh-pages`).
