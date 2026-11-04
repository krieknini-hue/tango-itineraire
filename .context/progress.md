# Suivi du Projet — Tango Itinéraire

## État d'avancement général
Le prototype PWA est entièrement fonctionnel sur `http://localhost:5173/`. Le système intègre désormais le calcul multi-itinéraires avec propositions bis (trajet rapide avec autoroute vs itinéraire bis sans péage), le filtrage dynamique des milongas par corridor, la cartographie interactive double-tracé, l'infrastructure Supabase/Stripe et l'univers immersif Buenos Aires 1950.

## Tâches terminées
- [x] Extraction et analyse de la conversation partagée Gemini (`https://share.gemini.google/L7K20Gu5bnTf`).
- [x] Rédaction du [cahier des charges fonctionnel et technique](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/cahier_des_charges.md).
- [x] Initialisation du système de mémoire projet dans `.context/`.
- [x] Scaffolding du projet Vite + React 19 + TypeScript + Tailwind CSS v4.
- [x] Implémentation du moteur de recherche d'itinéraire (OSRM + géolocalisation France).
- [x] Implémentation du filtrage de corridor géospatial avec `@turf/turf` (calcul automatique du détour en km et en minutes).
- [x] Intégration de la cartographie Leaflet avec tuiles officielles OpenStreetMap France (sans clé API).
- [x] Fiche événement complète en 4 blocs (L'Essentiel, Confort & Sol, Ambiance & Danse, Exposants & Shopping).
- [x] Deep links de navigation GPS directe (1 clic vers Waze, Google Maps, Apple Maps).
- [x] Simulateur de ligne d'urgence (bascule instantanée en 🔴 ANNULÉ avec message organisateur).
- [x] **Améliorations Techniques (Conversation 2) :**
  - [x] Architecture complète des services dans `src/services/` (`routingService`, `supabaseClient`, `supabaseService`, `authService`, `stripeService`, `storageService`).
  - [x] Schéma PostgreSQL + PostGIS complet (`supabase/schema.sql`) avec fonction RPC `find_events_along_route`, tables `profiles`, `events`, `memberships`, triggers et RLS.
  - [x] Authentification Mobile par SMS OTP (zéro mot de passe) avec modal élégant et mode démo instantané.
  - [x] Module de cotisation annuelle 2 € / an (Association Loi 1901) avec simulation Stripe et attestation téléchargeable.
  - [x] Support PWA Offline-First : `manifest.webmanifest`, Service Worker avec mise en cache des tuiles OSM et assets, détection hors-ligne et favoris locaux synchronisés.
- [x] **Multi-Itinéraires & Propositions Bis (Sans péage) :**
  - [x] Calcul d'itinéraires alternatifs OSRM (`alternatives=true`) + fallback de courbure scénique.
  - [x] Différenciation : Trajet Rapide (Autoroutes, péages estimés) vs Itinéraire Bis (Découverte / Sans péage, 0 €).
  - [x] Composant [`RouteSelector.tsx`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/components/RouteSelector.tsx) pour comparer et basculer en 1 clic entre les routes (distance, durée, péages, nombre de milongas).
  - [x] Cartographie interactive double tracé dans [`TangoMap.tsx`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/components/TangoMap.tsx) : route active en trait plein (bordeaux/émeraude) et route alternative en pointillé doré cliquable.
  - [x] Recalcul instantané du corridor milonguero selon la route sélectionnée.
  - [x] Sélecteur rapide "Option Route & Péages" dans [`ItineraryForm.tsx`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/components/ItineraryForm.tsx).
- [x] **Identité Visuelle & Habillage Âge d'Or Tango (Conversation 3) :**
  - [x] Typographies haute lisibilité : Remplacement de `Cinzel Decorative` par `Cinzel` standard (élégant, noble, esprit marquise 1950 mais parfaitement lisible) pour les grands titres et boutons, et bascule de tous les labels, formulaires et badges d'information vers `Plus Jakarta Sans` sans italique superflu.
  - [x] Tokens CSS rétro et palette chromatique : Noche Porteña (`#120B0A`), Boiserie Acajou (`#1B1210`), Carmín Milonguero (`#8E1C2E`), Oro Fileteado (`#D4AF37`), Papel de Partitura (`#FCF8F0`).
  - [x] Bibliothèque vectorielle `FileteadoOrnaments.tsx` : volutes d'angle baroques, séparateurs filigranes `❦ ◆ ❦`, icône bandonéon stylisée.
  - [x] Refonte de tous les composants de `src/components/` (Navbar, ItineraryForm, EventCard, EventDetailModal, EmergencyModal, TangoMap).
- [x] **Données & Scraping (Conversation 1) :**
  - [x] Client furtif `scripts/stealthClient.js` et moissonneur `scripts/scrapers/tangoArgentinScraper.js`.
  - [x] Moissonnage national complet (13 régions de France) : 291 lieux/milongas uniques dans [`scraped_venues.json`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/data/scraped_venues.json).
  - [x] Extension temporelle jusqu'au 31/12/2027 : 16 566 occurrences de milongas/séances calendaires générées dans [`scraped_milongas.json`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/data/scraped_milongas.json).
  - [x] Annuaire associatif : 17 associations et écoles nationales dans [`associations.json`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/data/associations.json).
  - [x] Identification et cartographie des sources complémentaires (Parilongas, Buscatango, Zeste-Tango, Tango-Toulouse, Tsibelle Lyon, Tangopolix, Tango Marathon Directory).
- [x] **Outil de Contact & Support Visuel pour les Associations & Milongas :**
  - [x] Extraction et déduplication de 189 organisateurs et associations uniques dans [`organizers_contacts.json`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/data/organizers_contacts.json).
  - [x] Script d'export de campagne [`scripts/exportOutreachCampaign.js`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/scripts/exportOutreachCampaign.js).
  - [x] Fichier tableur Excel/CSV prêt à l'emploi [`contacts_associations_tango.csv`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/contacts_associations_tango.csv) (compatible Excel Windows avec UTF-8 BOM).
  - [x] Guide et modèles rédigés dans [`CAMPAGNE_CONTACT_ASSOCIATIONS.md`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/CAMPAGNE_CONTACT_ASSOCIATIONS.md).
  - [x] Composant support visuel officiel et dépliant imprimable A4 [`PitchFlyer.tsx`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/components/PitchFlyer.tsx) avec QR code, 4 piliers associatifs, et impression PDF 1-clic.
  - [x] Espace modale complet [`OutreachModal.tsx`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/components/OutreachModal.tsx) avec recherche, filtrage par statut, générateur de messages personnalisés, liens direct `mailto:` et WhatsApp `wa.me`, et persistance `localStorage`.
  - [x] Bouton direct "Espace Assos" intégré dans la [`Navbar.tsx`](file:///c:/Users/Utilisateur/Documents/Projet%20perso/Tango/src/components/Navbar.tsx).
- [x] Validation du build TypeScript/Vite (0 erreur).

## Prochaines étapes
- [ ] Connecter `scraped_milongas.json` au mock/Supabase.
- [ ] Implémenter un connecteur pour l'une des sources complémentaires identifiées (ex: Parilongas pour Paris/IDF ou Tangopolix pour les festivals/marathons).
