# 📌 Mémoire Globale & Guide de Reprise de Projet — Tango Itinéraire

Ce document centralise l'état d'avancement, l'historique complet des évolutions, l'architecture technique, l'ergonomie, la stratégie de données et les consignes pour une reprise immédiate sur un autre compte Antigravity.

---

## 1. Vision du Produit & Modèle

- **Type de produit :** **PWA (Progressive Web App)** Mobile-First & Responsive multi-supports (Smartphone, Tablette Split-View, Écran embarqué / Cockpit voiture).
- **Objectif clé :** Trouver et filtrer les événements tango (milongas, pratiques, festivals, marathons) le long d'un itinéraire routier (ex. : Tours ➔ Cannes) selon un rayon de détour configurable (15 à 60 km) et le choix de route (**Autoroute rapide** vs **Sans péage 0 €**).
- **Statut juridique cible :** **Association Loi 1901** (confiance communautaire, 0 € de frais de constitution, gestion allégée).
- **Modèle économique :** 6 mois d'accès gratuit (phase d'adoption), puis cotisation annuelle de **2 € / an** par danseur (SMS OTP + paiement en 1 clic Stripe / Apple Pay / Google Pay).
- **Déploiement en ligne :**
  - **Dépôt GitHub :** [https://github.com/krieknini-hue/tango-itineraire](https://github.com/krieknini-hue/tango-itineraire)
  - **Application Web active (GitHub Pages) :** [https://krieknini-hue.github.io/tango-itineraire/](https://krieknini-hue.github.io/tango-itineraire/)

---

## 2. Stack Technique & Arborescence

- **Frontend :** Vite + React 19 + TypeScript + Tailwind CSS v4.
- **Cartographie :** Leaflet (tuiles officielles OpenStreetMap France 100 % libres, zéro clé API requise, tuiles mises en cache hors-ligne via `public/sw.js`).
- **Calcul d'Itinéraire :** OSRM avec paramètre `alternatives=true` (calcul simultané autoroute vs sans péage) + calcul géométrique de corridor via `@turf/turf` exécuté côté client.
- **Base de Données / Backend :** Supabase (PostgreSQL + PostGIS, authentification SMS OTP, Storage) avec schéma dans `supabase/schema.sql` et fonction RPC `find_events_along_route`.
- **Persistance Hors-Ligne (Local-First) :** `localStorage` pour les favoris, le cache des trajets et les mémos d'accès en zone blanche (sans 4G).

### Organisation des Fichiers Clés
```
Tango/
├── .context/                      # Mémoire persistante autonome Antigravity
│   ├── system_memory.md           # Conventions, stack, tokens, UX
│   ├── progress.md                # Tâches terminées, déploiement, backlog
│   └── decisions.md               # Décisions d'architecture et résolutions
├── MEMOIRE_PROJET.md              # Fichier de synthèse racine (reprise tous comptes)
├── public/
│   ├── sw.js                      # Service Worker PWA (cache hors-ligne réseau en premier)
│   └── manifest.json              # Configuration PWA installable
├── src/
│   ├── components/
│   │   ├── BottomNav.tsx          # Barre de navigation mobile zone du pouce (< 768px)
│   │   ├── EventCard.tsx          # Billet d'événement compact avec drawer confort
│   │   ├── EventDetailModal.tsx   # Fiche détaillée (Essentiel, Sol/Clim/Parking, Ambiance, Exposants)
│   │   ├── FileteadoBorderOverlay.tsx # Ornements SVG Fileteado Porteño dorés
│   │   ├── LabSelectorBar.tsx     # Tiroir secret (roue dentée) pour tester les tunnels & thèmes
│   │   ├── LastMileMemoModal.tsx  # Mémo local parking, digicode, qualité du sol
│   │   ├── Map.tsx                # Carte Leaflet réactive double tracé
│   │   ├── Navbar.tsx             # Barre d'en-tête, accès cockpit, tiroir menu
│   │   ├── OchoLoader.tsx         # Loader animé SVG boucle en 8 continue (Ocho)
│   │   ├── OnboardingModal.tsx    # Didacticiel interactif en 3 étapes
│   │   ├── OutreachModal.tsx      # Outil de contact pour les 189 associations partenaires
│   │   ├── PitchFlyer.tsx         # Flyer A4/PDF imprimable pour assos & milongas
│   │   ├── RouteSelector.tsx      # Sélecteur d'itinéraire rapide vs sans péage
│   │   ├── TunnelCockpitCarplay.tsx # Vue spéciale conduite grand format
│   │   ├── TunnelGps3Steps.tsx    # Parcours guidé en 3 étapes
│   │   └── TunnelGuichetExpress.tsx # Parcours express avec tiroirs de filtres
│   ├── hooks/
│   │   └── useWakeLock.ts         # Hook Screen Wake Lock anti-veille pour la conduite
│   ├── modules/
│   │   ├── eventsService.ts       # Ingestion et normalisation des 18 308 événements réels
│   │   ├── profileManager.ts      # Gestion du profil danseur (guide/suiveur, parité)
│   │   ├── routingService.ts      # Moteur OSRM, Turf, péages, lanceurs Waze/Maps
│   │   ├── storageService.ts      # Gestion locale favoris, cache et mémo dernier km
│   │   ├── tangoMetrics.ts        # Métriques Tandas (12 min) & Alerte Cumparsita
│   │   └── wakeLockService.ts     # API Screen Wake Lock native avec fallback
│   ├── index.css                  # Design Tokens, thèmes, animations CSS, verrouillage mobile
│   └── App.tsx                    # Orchestrateur réactif (détection viewport, mode cockpit, bottom nav)
└── scripts/
    └── normalizer/
        └── eventCloaker.js        # Script de nettoyage et anonymisation des événements
```

---

## 3. Synthèse Détaillée des Fonctionnalités Implémentées

### A. Moteur d'Itinéraire, Multi-Routes & Mode Hors-Ligne
- **Calcul multi-traces OSRM + corridor Turf.js :** Tracé direct par autoroute (avec estimation des péages) et itinéraire alternatif sans péage (0 €) avec filtrage instantané des événements situés dans la bande de détour paramétrée.
- **Cartographie réactive :** Double affichage de tracé Leaflet (route active mise en valeur + tracé alternatif sélectionnable d'un clic).
- **Service Worker PWA v2 :** Mise en cache des tuiles OSM et des ressources critiques pour consultation fluide en zone blanche.
- **Fiches Événements en 4 Blocs :**
  1. *L'Essentiel :* Date, horaire, association, tarif, ville, détour en km et minutes.
  2. *Confort & Sol :* Nature du parquet (amorti, carrelage, etc.), climatisation, vestiaire, bar, parking sécurisé pour bagages.
  3. *Ambiance & Danse :* Codes (Mirada / Cabeceo, néo, pratique), DJs, musique live, équilibre guide/suiveur.
  4. *Exposants :* Chaussures et vêtements de tango.
- **Ligne d'urgence Zéro Faux Plan :** Redirection WhatsApp Business en cas de doute ou annulation météo/salle.

### B. Ergonomie Responsive Adaptée à 3 Formats
1. **Smartphone au pouce (< 768px) :**
   - Barre `BottomNav.tsx` fixée en bas dans la zone ergonomique du pouce (Trajet, Salons, Carte, Favoris, Mode Conduite, Menu).
   - Verrouillage total de l'écran mobile natif : pas de dézoom ou défilement horizontal parasite (`max-width: 100vw`, `overflow-x: hidden`).
2. **Tablette & Desktop (>= 768px) :**
   - Mise en page automatique en **Split-View** : liste interactive des étapes et des milongas à gauche, carte Leaflet sticky à droite.
3. **Mode Cockpit / Conduite (Autoradio & Smartphone sur support) :**
   - Bascule en un clic via l'icône voiture dans le bandeau supérieur.
   - Polices agrandies de +35 %, boutons tactiles massifs (hauteur minimale de 64 px), contrastes accrus.
   - Épuration des métadonnées secondaires pour permettre une prise d'information en moins de 2 secondes.
   - Maintien automatique de l'écran allumé sans mise en veille via `navigator.wakeLock` (avec gestion de reprise de focus et fallback).

### C. Assistance au Trajet & Métriques Spécifiques au Tango
- **Lanceurs de Navigation Universels (Android Auto / CarPlay) :**
  - Boutons directs sur chaque étape et fiche événement pour ouvrir l'adresse ou les coordonnées GPS exactes :
    - **Waze :** `https://waze.com/ul?q={coords_ou_adresse}&navigate=yes`
    - **Google Maps :** `https://www.google.com/maps/dir/?api=1&destination={coords_ou_adresse}&travelmode=driving`
- **Convertisseur Temps ➔ Tandas :**
  - Règle tango : 1 tanda (4 morceaux) + 1 cortina = environ 12 minutes.
  - Conversion automatique du temps de trajet affichée sous forme de badge ludique (ex. : `48 min • 🎶 env. 4 tandas de route`).
- **Indicateur "Temps de danse restant" & Alerte Cumparsita :**
  - Calcule l'écart entre l'heure estimée d'arrivée (ETA) et l'heure de clôture de la milonga (par défaut 01h00).
  - Code couleur dynamique :
    - 🟢 Vert : plus de 2 heures de danse possibles.
    - 🟠 Orange : entre 1h et 2h de danse.
    - 🔴 Rouge : moins d'une heure restante ("Juste à temps pour La Cumparsita !").
- **Mémo "Dernier Kilomètre" Local-First :**
  - Sauvegarde locale instantanée (`localStorage`) accessible hors-réseau pour chaque lieu :
    - Infos Parking (gratuit, souterrain, accès bagages).
    - Code d'accès / digicode (avec bouton copié rapide).
    - Qualité du sol : Parquet glissant ⛸️ / Normal 👟 / Accrocheur 🧲.

### D. Identité Visuelle & Finitions Tango Argentin ("Juice")
- **Palette Milonga Nocturne :**
  - Fond sombre : `#0F0F14`
  - Conteneurs / Cartes : `#1A1A24`
  - Rouge Tango : `#E63946`
  - Or Porteño : `#F4A261`
  - Texte : `#F8F9FA`
- **Ornements Fileteado Porteño :** SVG décoratifs fins dorés sur les angles de cartes et en-têtes sans surcoût de performance.
- **Animation Bandonéon :** Déploiement fluide accordéon des cartes avec rebond élastique (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Loader Ocho :** Boucle en 8 animée en continu (`stroke-dasharray` / `stroke-dashoffset`).
- **Micro-interaction dorée :** Déclenchement d'un effet pulsé lumineux au lancement de la navigation GPS.

### E. Outils Partenaires & Associations
- **Base de 189 contacts d'associations dédupliqués** (`contacts_associations_tango.csv`).
- **Module d'outreach intégré** (`OutreachModal.tsx`) pour pré-remplir les messages e-mail et WhatsApp.
- **Flyer A4 imprimable** (`PitchFlyer.tsx`) pour distribution en milongas.

---

## 4. Consignes pour la Reprise sur un Autre Compte Antigravity

Lors de l'ouverture de ce dépôt sur un nouveau compte ou une nouvelle machine :
1. **Dossier de mémoire autonome `.context/` :**
   - Vérifier `.context/system_memory.md`, `.context/progress.md` et `.context/decisions.md` qui décrivent les conventions et l'état exact du projet.
2. **Démarrage local :**
   ```bash
   npm install
   npm run dev
   ```
3. **Build de validation :**
   ```bash
   npm run build
   ```
4. **Déploiement GitHub Pages :**
   - Le projet est configuré pour déployer `dist` sur GitHub Pages via `npm run build` puis commit/push sur la branche `main` (ou configuration GitHub Actions active).
