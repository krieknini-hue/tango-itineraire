# System Memory — Préférences & Conventions

## Stack Technique & Architecture
- **Type d'application :** PWA (Progressive Web App) Mobile-First (aucun passage obligatoire par les stores).
- **Frontend :** Vite + React 19 + TypeScript + Tailwind CSS v4.
- **Cartographie & Multi-Itinéraires :**
  - Leaflet (tuiles OpenStreetMap France sans clé API) avec rendu double-tracé (route active + route bis cliquable).
  - OSRM avec paramètre `alternatives=true` pour calcul simultané du trajet rapide autoroutier et de l'itinéraire bis (sans péage).
  - Calcul de corridor géométrique indépendant `@turf/turf` pour chaque tracé.
- **Mise en cache hors-ligne :** Service Worker PWA (`public/sw.js`) pour assets et tuiles OSM + `storageService.ts` pour stockage local des trajets, alternatives et favoris en zone blanche (sans 4G).
- **Backend / BDD :** Supabase (PostgreSQL + PostGIS, SMS Auth OTP, Storage) avec script `supabase/schema.sql` et fonction RPC `find_events_along_route`.
- **Organisation des Services (`src/services/`) :**
  - `routingService.ts` : Résolution villes, calcul OSRM multi-routes, estimation des péages, cache d'itinéraires et corridor Turf.js.
  - `supabaseClient.ts` : Client Supabase sécurisé avec détection d'absence de clés et fallback dev sans erreur.
  - `supabaseService.ts` : CRUD événements, requêtes PostGIS et propagation d'alerte annulation d'urgence.
  - `authService.ts` : Authentification numéro de téléphone + SMS OTP (6 chiffres, démo instantanée `123456`).
  - `stripeService.ts` : Cotisations annuelles 2 € / an (Asso Loi 1901) avec reçu officiel téléchargeable.
  - `storageService.ts` : Gestion des favoris, cache d'itinéraires et préférences nomades.
- **Paiement :** Stripe (Apple Pay / Google Pay / CB pour cotisations 2 €).

- **Campagnes & Relations Associations :**
  - Annuaire des organisateurs normalisé dans `src/data/organizers_contacts.json` (189 contacts uniques dédupliqués).
  - Composant `PitchFlyer.tsx` prêt pour impression A4/PDF via CSS `@media print` et rendu visuel Années 50.
  - Modale `OutreachModal.tsx` pour l'envoi 1-clic (mailto, WhatsApp) et la gestion de statuts persistants (`localStorage`).
  - Script d'export de campagne `scripts/exportOutreachCampaign.js` et fichier tableur CSV UTF-8 BOM `contacts_associations_tango.csv`.

## Identité Visuelle & Design System — Buenos Aires 1950 (Época de Oro)
- **Concept graphique :** Atmosphère nocturne et raffinée des grands salons et clubs sociaux de Buenos Aires dans les années 50 (*Fileteado Porteño*, comptoirs en acajou, velours carmin, partitions d'orchestres typiques).
- **Palette Chromatique :**
  - `Noche Porteña` : `#120B0A` (fond sombre immersif façon bal de nuit).
  - `Boiserie Acajou` : `#1B1210` / `#251815` (surfaces de cartes et modales).
  - `Carmín Milonguero` : `#8E1C2E` / `#731221` (boutons d'action, rubans milonga).
  - `Oro Fileteado` : `#D4AF37` / `#F5D77F` (bordures d'angle, séparateurs, liserés de tickets).
  - `Papel de Partitura` : `#FCF8F0` / `#F7F2E7` (textes contrastés, billets de bal).
- **Typographies :**
  - Titrage monumental et boutons : `Cinzel` (épuré, noble, esprit chapiteau de bal 1950, parfaitement lisible sans les fioritures excessives de la version Decorative).
  - Titres de milongas et cartons de bal : `Playfair Display`.
  - Données denses, labels de formulaires, badges et mobile : `Plus Jakarta Sans` (sans empattements, contrasté, zéro italique en micro-tailles pour un confort immédiat en conduite).
- **Composants Décoratifs Dédiés :** `FileteadoOrnaments.tsx` (`FileteadoCorner`, `FileteadoDivider`, `BandoneonIcon`).
- **Laboratoire UX & Tunnels (`src/components/tunnels/` & `LabSelectorBar.tsx`) :**
  - `TunnelGpsWizard.tsx` : Parcours guidé 3 étapes avec carrousel d'escales.
  - `TunnelGuichetExpress.tsx` : Parcours billet express 2 questions et barre de trajet repliable.
  - `TunnelCockpitCarplay.tsx` : Interface autoradio à boutons XXL et affichage "Prochaine escale".
  - 4 thèmes CSS dynamiques dans `src/index.css` (`.theme-1950`, `.theme-midnight`, `.theme-tortoni`, `.theme-cockpit_oled`).

## Stratégie d'Organisation Multi-Conversations
Le projet est découpé en 3 conversations ciblées :
1. **Données & Scraping :**
   - Scripts placés exclusivement dans `scripts/` et fichiers de données dans `src/data/` (zéro interférence avec le build de l'app).
   - Module `scripts/stealthClient.js` : Client HTTP furtif (User-Agent Chrome Windows, headers Sec-Ch-Ua, gestion de session de cookies, jitter aléatoire 1.2s - 2.8s, mise en cache locale anti-spam).
   - Module `scripts/scrapers/tangoArgentinScraper.js` : Extraction des données Leaflet et JSON-LD DanceEvent (100% facts : adresses, GPS, dates, DJ, prix, contacts).
   - Sorties normalisées : `src/data/scraped_milongas.json` et `src/data/associations.json`.
2. **Technique :** Intégration backend, auth SMS, Stripe, offline PWA, multi-itinéraires & alternatives sans péage. (Terminé)
3. **Design :** Identité visuelle tango Buenos Aires 1950, habillage complet des composants, ergonomie tactile mobile. (Terminé)

Toutes les conversations partagent la même mémoire autonome via `.context/` et `MEMOIRE_PROJET.md`.

- Profil local : src/services/profileManager.ts (cl� localStorage tango_profile_v1).

## Modules
- Nouveaux modules métier dans src/modules/ ; stores externes via useSyncExternalStore ; cibles tactiles >= 44px, inputs 16px.
