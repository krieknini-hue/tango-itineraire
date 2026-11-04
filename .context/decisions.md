# Décisions Techniques & Résolution de Problèmes

## Choix Techniques Clés
1. **Format PWA (Progressive Web App) & Offline-First :**
   - *Pourquoi :* Aucun frais de licence store (Apple/Google), installable en 1 clic sur l'écran d'accueil mobile, code unique responsive.
   - *Offline-First :* Service Worker (`sw.js`) avec cache dédié pour les tuiles OpenStreetMap (`tango-osm-tiles`) et cache local des tracés d'itinéraires et milongas favorites pour les coupures de réseau sur la route (zones blanches).
2. **Statut Juridique : Association Loi 1901 :**
   - *Pourquoi :* Zéro frais de création, confiance communautaire, cotisations à 2 € / an adaptées.
3. **Architecture des Services Métier (`src/services/`) :**
   - `routingService.ts` : Calcul d'itinéraire avec mise en cache locale automatique et filtrage géométrique `@turf/turf`.
   - `supabaseClient.ts` & `supabaseService.ts` : Client Supabase résilient avec détection d'environnement ; bascule automatique transparente en mode local si les clés `.env` ne sont pas renseignées (zéro plantage en dev).
   - `authService.ts` : Authentification mobile par numéro de téléphone + SMS OTP sans mot de passe, avec code de simulation direct en local.
   - `stripeService.ts` : Gestion de la cotisation annuelle 2 € avec génération d'attestation d'adhésion officielle téléchargeable.
   - `storageService.ts` : Persistance hors-ligne des favoris, des préférences et du dernier tracé calculé.
4. **Schéma SQL Supabase + PostGIS (`supabase/schema.sql`) :**
   - Fonction RPC PostGIS `find_events_along_route` exploitant `ST_DWithin` et `ST_Distance` sur colonnes `geography(Point, 4326)` avec index GiST pour recherche géospatiale côté serveur.
5. **Identité Visuelle "Buenos Aires 1950 — Época de Oro" :**
   - *Concept :* Recréer l'ambiance prestigieuse des clubs sociaux et cabarets de Corrientes de la grande époque du tango (orchestres D'Arienzo, Troilo, Pugliese, Di Sarli).
   - *Vectoriel pur pour les ornements :* Création de composants SVG légers (`FileteadoOrnaments.tsx`) plutôt que des images matricielles lourdes, garantissant une netteté absolue sur mobile OLED sans pénaliser le temps de chargement.
   - *Hiérarchie typographique :* `Cinzel Decorative` pour les en-têtes et sceaux d'époque, `Playfair Display` pour l'esprit bal/partitura, et `Plus Jakarta Sans` pour la clarté des chiffres au volant.
   - *Personnalisation Leaflet :* Marqueurs médaillons bordeaux et or cerclés de laiton, popups sombres aux reflets dorés, préservant la fluidité des tuiles libres OpenStreetMap France.
6. **Architecture du Moissonneur Furtif (`scripts/` et `src/data/`) :**
   - *Confinement strict :* Fichiers de scraping logés dans `scripts/` et sorties JSON dans `src/data/`, garantissant zéro impact sur le code client Vite/React.
   - *Empreinte indétectable :* Client `StealthClient` simulant une navigation Chrome/Windows avec headers complets (`Sec-Ch-Ua`, `Sec-Fetch-*`), gestion d'état de cookies de session (`ta_consent`, `tango_argentin_session`), et temporisation aléatoire (jitter de 1.2s à 2.8s).
   - *Cache disque local intelligent :* Sauvegarde locale des réponses HTML avec TTL de 24h évitant tout appel réseau redondant pendant les tests et les développements.
   - *Extraction hybride (Leaflet + JSON-LD DanceEvent) :* Récupération des coordonnées précises et adresses depuis les marqueurs JS Leaflet de chaque région, puis enrichissement automatique via le schéma Schema.org `DanceEvent` (prix, DJ, contacts d'assos).
   - *Modèle à deux niveaux (Lieux maîtres vs Occurrences calendaires) :*
     - `scraped_venues.json` : Répertoire maître des 291 lieux et festivals uniques répertoriés avec leur règle de récurrence (jour de la semaine).
     - `scraped_milongas.json` : Projection calendaire hebdomadaire complète (16 566 dates jusqu'au 31/12/2027) permettant de garantir qu'une recherche pour n'importe quelle date choisie par le voyageur dans le calendrier fera remonter les milongas actives.
7. **Multi-Itinéraires & Propositions Bis (Sans péage) :**
   - *Calcul d'alternatives :* Requête OSRM paramétrée avec `alternatives=true` pour récupérer le tracé rapide autoroutier et le tracé bis. En cas de route unique renvoyée par le serveur, génération géométrique d'une alternative réaliste déviée (contournement national).
   - *Estimation financière du péage :* Calcul automatique du coût de péage estimé sur la base de ~0.08 €/km pour les sections autoroutières, contre 0 € pour l'itinéraire bis.
   - *Filtrage indépendant de corridor :* Le corridor géométrique `@turf/turf` est recalculé pour chaque route alternative, permettant d'afficher à l'avance sur les boutons de sélection le nombre exact de milongas situées sur chacune des options.
   - *Rendu interactif Leaflet :* Affichage simultané des 2 tracés (route active en trait fort carmin/émeraude, route bis en tirets ambrés cliquables pour changer de trajet d'un seul clic sur la carte).
8. **Cartographie des Sources Complémentaires & Stratégie d'Enrichissement :**
   - *Paris / IDF :* `Parilongas.fr` (ultra-réactif pour les milongas éphémères et changements du jour).
   - *Occitanie & Sud-Ouest :* `tango-toulouse.net` et `tango-argentin-bordeaux.com` (très précis sur les bals régionaux).
   - *Rhône-Alpes :* `tsibelle.com` (actualités et bals lyonnais).
   - *Festivals & Marathons Internationaux :* `Tangopolix.com`, `Tango Marathon Directory (TMD)` et `Zeste Tango` (cartes et calendriers des grands rassemblements en France et Europe).
   - *Approche technique :* Conserver `scripts/stealthClient.js` comme moteur réseau unique et brancher des scrapers modulaires spécialisés dans `scripts/scrapers/`.

9. **Outil d'Outreach & Prise de contact Associations / Milongas :**
   - *Problème :* Nécessité d'avertir et d'embarquer les 200+ associations et milongas de France sans effort manuel fastidieux, avec une démarche respectueuse et non intrusive.
   - *Solution :*
     - Extraction et déduplication automatique des organisateurs depuis `scraped_venues.json` vers un annuaire structuré de 189 contacts uniques (`organizers_contacts.json`).
     - Générateur multi-canal avec préremplissage dynamique (Email officiel, Email amical, WhatsApp/SMS).
     - Intégration de liens d'action directs : `mailto:` encodé ouvrant immédiatement le client mail avec objet et corps rédigés, et `https://wa.me/` pour WhatsApp Mobile/Web.
     - Suivi de campagne local et persistant via `localStorage` (évite de recontacter les mêmes associations).
     - Export CSV avec encodage UTF-8 BOM pour un affichage direct parfait dans Excel sous Windows.
10. **Support Visuel d'Explication Synthétique (Format A4 / PDF) :**
    - *Objectif :* Permettre aux organisateurs de comprendre le projet en moins de 60 secondes.
    - *Structure :* 1) Le problème des danseurs de passage qui loupent la milonga, 2) Le calcul automatique du détour routier, 3) Les 4 atouts assos (100% gratuit, nouveaux danseurs, valorisation du sol/parquet/DJ/exposants, ligne d'urgence Zéro Faux Plan), 4) QR code interactif et lien démo.
    - *Technique d'export :* CSS dédié `@media print` masquant l'interface applicative pour générer une plaquette A4 papier/PDF propre et élégante via la boîte de dialogue système d'impression (`window.print()`).

## Bugs / Défis Résolus
- **Confusion sur le nom de domaine de l'annuaire cible :**
   - *Problème :* `tangoargentin.fr` (sans tiret) est une page de parking de domaine à vendre (Dovendi).
   - *Solution :* Détection et ciblage du domaine réel `tango-argentin.fr` (avec tiret), qui héberge l'agenda national collaboratif et l'annuaire complet.
- **Extraction des données du lien partagé Gemini :**
  - *Problème :* Le lien nécessitait un rendu dynamique côté client.
  - *Solution :* Rendu DOM avec Chrome headless.
- **Règles strictes TypeScript (`verbatimModuleSyntax`) :**
  - *Problème :* Conflit sur les imports de types standards lors du build.
  - *Solution :* Passage systématique en `import type { ... }` pour les interfaces et nettoyage des imports inutilisés.
- **Affichage des tuiles cartographiques :**
  - *Problème :* Le fournisseur de fond de carte (CartoDB) demandait une clé API payante/enregistrée.
  - *Solution :* Remplacement immédiat par le serveur officiel **OpenStreetMap France** (`tile.openstreetmap.fr/osmfr/`), 100% libre, gratuit et sans aucune clé API requise.
- **Appel conditionnel d'un Hook React dans EventDetailModal :**
  - *Problème :* `useAuth()` était appelé après `if (!event) return null;`, violant la règle `react-hooks/rules-of-hooks`.
  - *Solution :* Déplacement de l'appel `useAuth()` au niveau racine inconditionnel du composant.
- **Lisibilité des polices de caractères sur le thème Buenos Aires 1950 :**
  - *Problème :* `Cinzel Decorative` comportait des entrelacs et volutes intérieures trop chargées, rendant les titres et boutons difficiles à déchiffrer sur mobile. De plus, les petits labels de formulaires en italique avec empattements manquaient de clarté.
  - *Solution :* Remplacement par **`Cinzel` standard** (lignes romaines nobles, épurées et majestueuses, esprit marquise de bal 1950) et bascule de tous les labels, formulaires et badges d'information vers **`Plus Jakarta Sans`**, garantissant un confort de lecture immédiat et sans effort.
- **Fast Refresh et exportation de Hook/Context :**
  - *Problème :* Avertissement `only-export-components` lors de l'export combiné de `AuthProvider` et `useAuth`.
  - *Solution :* Découpage propre avec `useAuth.ts` dédié et lazy initialization de l'état sans `useEffect` synchrone.
- **Imports inutilisés sous `noUnusedLocals: true` :**
  - *Problème :* Plusieurs variables et icônes importées non exploitées bloquaient la compilation `tsc -b`.
  - *Solution :* Nettoyage rigoureux des imports dans l'ensemble des composants et réexportation propre de `useAuth` depuis `AuthContext.tsx`.
