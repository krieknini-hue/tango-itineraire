# System Memory — Préférences & Conventions

## Stack Technique & Architecture
- **Type d'application :** PWA (Progressive Web App) Mobile-First (aucun passage obligatoire par les stores).
- **Frontend :** Vite + React 19 + TypeScript + Tailwind CSS v4.
- **Cartographie & Multi-Itinéraires :**
  - Leaflet (tuiles OpenStreetMap France sans clé API) avec rendu double-tracé (route active + route bis cliquable).
  - OSRM avec paramètre `alternatives=true` pour calcul simultané du trajet rapide autoroutier et de l'itinéraire bis (sans péage).
  - Calcul de corridor géométrique indépendant `@turf/turf` pour chaque tracé.
- **Mise en cache hors-ligne :** Service Worker PWA (`public/sw.js`) pour assets et tuiles OSM + `storageService.ts` pour stockage local des trajets, alternatives, favoris et mémos dernier kilomètre en zone blanche (sans 4G).
- **Backend / BDD :** Supabase (PostgreSQL + PostGIS, SMS Auth OTP, Storage) avec script `supabase/schema.sql` et fonction RPC `find_events_along_route`.
- **Organisation des Services (`src/services/` & `src/modules/`) :**
  - `routingService.ts` : Résolution villes, calcul OSRM multi-routes, estimation des péages, cache d'itinéraires, corridor Turf.js et lanceurs universels Waze/Google Maps Android Auto.
  - `tangoMetrics.ts` : Convertisseur temps de route -> tandas (12 min/tanda) et indicateur de temps de danse restant (vert, orange, rouge Cumparsita).
  - `storageService.ts` : Gestion des favoris, cache d'itinéraires et mémo dernier kilomètre (parking, code d'accès, sol).
  - `wakeLockService.ts` / `useWakeLock.ts` : Gestion du Screen Wake Lock API pour le mode conduite.
  - `eventsService.ts` : Chargement du dataset consolidé (18 308 événements réels à venir).
  - `profileManager.ts` : Profil danseur (rôle guide/suiveur, jauge de parité).

## Ergonomie Multi-Supports (Mobile, Tablette, Cockpit)
- **Smartphone (< 768px) :** Composant `BottomNav.tsx` fixé en bas dans la zone du pouce (Trajet, Salons, Carte, Favoris, Conduite, Menu).
- **Tablette & Desktop (>= 768px) :** Mise en page Split-View automatique (liste des étapes à gauche, carte interactive sticky à droite).
- **Mode Cockpit / Voiture :** Bouton rapide en haut d'écran (voiture), polices +35%, boutons >= 64px, masquage des données secondaires (< 2s de lecture), `navigator.wakeLock` actif.

## Identité Visuelle & Finitions Tango ("Juice")
- **Palette Milonga Nocturne (Haut Contraste) :**
  - Fond principal : `#0F0F14`
  - Cartes & Conteneurs : `#1A1A24`
  - Accent Rouge Tango : `#E63946`
  - Accent Or Porteño : `#F4A261`
  - Texte principal : `#F8F9FA`
- **Animations & Graphismes Pur CSS / SVG :**
  - Coins Fileteado Porteño dorés (`FileteadoBorderOverlay` SVG `#F4A261`, opacité 40%).
  - Animation d'accordéon "Bandonéon" fluide avec rebond élastique (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
  - Loader "Ocho" en boucle en 8 continue (`stroke-dasharray` / `stroke-dashoffset`).
  - Micro-interaction de validation dorée au départ GPS (`animate-tango-launch`).
