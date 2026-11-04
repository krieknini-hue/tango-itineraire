# 📌 Mémoire Globale & Journal d'Évolutions — Tango Itinéraire

Ce document centralise l'état d'avancement, l'historique des évolutions, la stratégie de données, la vision technique et les choix d'ergonomie (Mobile & Autoradio).

---

## 1. Vision & Architecture Validée
- **Type de produit :** **PWA (Progressive Web App)** Mobile-First verrouillée comme une application native (aucun zoom/dézoom intempestif, zéro débordement horizontal, installable en 1 clic sur l'écran d'accueil).
- **Fonction clé :** Trouver les événements tango (milongas, pratiques, festivals, marathons) le long d'un trajet routier (ex: Tours ➔ Cannes) selon un rayon de détour réglable (15 à 60 km) et le choix de route (**Autoroute rapide** vs **Sans péage 0 €**).
- **Statut juridique cible :** **Association Loi 1901** (confiance communautaire, 0 € de frais de création, gestion légère).
- **Modèle économique :** 6 mois gratuits (phase d'adoption), puis cotisation annuelle de **2 € / an** par danseur (authentification numéro de téléphone + paiement 1 clic Stripe / Apple Pay / Google Pay).

---

## 2. Journal des Évolutions Réalisées

### A. Moteur d'Itinéraire, Multi-Routes & Mode Hors-Ligne
- **Calcul de tracé routier (OSRM) + corridor `@turf/turf`** ultra-rapide côté client.
- **Comparateur d'itinéraires (`RouteSelector`) :** Calcul simultané de la route directe par autoroute (avec estimation des péages) et de l'itinéraire Bis sans péage (0 €), avec comptage automatique des milongas sur chaque tracé.
- **Cartographie :** Leaflet avec tuiles officielles **OpenStreetMap France** (100 % libres, sans clé API) et cache hors-ligne des tuiles et favoris (`public/sw.js`).
- **Fiches Événements en 4 Blocs :**
  1. *L'Essentiel :* Horaires, tarif, asso organisatrice, ville/adresse, distance et temps de détour.
  2. *Confort & Sol du Danseur :* Type de parquet (amorti, carrelage, etc.), climatisation (oui/non), parking bagages sécurisé, vestiaire, bar.
  3. *Ambiance & Danse :* Code (mirada/cabeceo, néo, pratique), DJs et styles musicaux, live music, équilibre guide/suiveur.
  4. *Exposants :* Chaussures et vêtements de danse.
- **Deep links GPS :** Redirection 1 clic vers Waze, Google Maps et Apple Maps.
- **Ligne d'urgence Zéro Faux Plan :** Canal WhatsApp Business avec bascule instantanée en **🔴 ANNULÉ**.

### B. Ergonomie Mobile Native, Didacticiel & Laboratoire des 3 Tunnels
- **Verrouillage App Mobile Native (`index.html` & `src/index.css`) :**
  - Interdiction du zoom/dézoom tactile (pinch-to-zoom et auto-zoom iOS sur les champs de saisie verrouillés, sauf à l'intérieur de la carte interactive).
  - Suppression totale des éléments hors-écran sur petits smartphones (`max-width: 100vw`, `overflow-x: hidden`, barres responsives).
- **Didacticiel Rapide en 3 Étapes (`OnboardingModal.tsx`) :**
  - Guide visuel express en 3 écrans (*1. Trace ta route • 2. Confort danseur & Favoris hors-ligne • 3. Guidage 1-clic & Zéro Faux Plan*) qui s'affiche à la première ouverture et reste accessible à tout moment via le bouton **`❓ Guide`**.
- **Barre de Sélection Mode Test en Tiroir (`LabSelectorBar.tsx`) :**
  - Accessible via un simple bouton **Roue Dentée (`⚙️`)** dans la barre supérieure (aucun bandeau encombrant).
  - Permet de basculer en 1 clic entre les 4 parcours (**🎟️ Tunnel Guichet Express par défaut**, **🛣️ Tunnel GPS 3 Étapes**, **🚘 Mode Cockpit Autoradio**, **📜 Vue Classique**) et les 4 ambiances visuelles.
- **Navigation Allégée par Tiroirs (`Navbar.tsx`, `TunnelGuichetExpress.tsx`, `EventCard.tsx`) :**
  - **Tiroir Menu (`☰`)** : Regroupe *Mon Profil Danseur*, *Didacticiel*, *Connexion/Cotisation*, *Ligne Zéro Faux Plan* et *Espace Assos*.
  - **Tiroir Options (`Sliders`)** : Regroupe sur l'écran de résultats le choix *Autoroute / Sans péage*, le *Rayon de détour*, la *Nuitée véhicule* et le *Mode Découverte*.
  - **Tiroir Confort sur chaque billet (`Sol, Clim & DJ`)** : Allège la lecture des cartes de milongas en ne gardant à l'écran que la ville, le détour, le titre, l'horaire et les boutons Waze / Maps.
- **4 Variantes de Design Commutables (`src/index.css`) :**
  1. **🕯️ Buenos Aires 1950 :** Acajou (`#1B1210`), Carmin (`#8E1C2E`) & Or patiné (`#D4AF37`).
  2. **🌙 Milonga de Minuit :** Bleu Nuit Puerto Madero, Cuivre & Magenta néon.
  3. **☕ Café Tortoni Jour :** Fond Crème Partition & Sépia haute lisibilité plein soleil.
  4. **🚘 Cockpit OLED Noir :** Noir absolu anti-éblouissement & Ambre haute visibilité pour autoradio de nuit.

### C. Stratégie Données, Cloaking & Campagne Associations
- **Moteur d'extraction multi-sources & Cloaking (`scripts/normalizer/eventCloaker.js`) :**
  - Extraction des faits publics bruts, déduplication multi-sources et nettoyage complet des métadonnées.
- **Outil de Campagne Associations (`OutreachModal.tsx` & `PitchFlyer.tsx`) :**
  - Annuaire de 189 contacts d'associations dédupliqués (`contacts_associations_tango.csv`) + flyer imprimable A4/PDF et envoi 1-clic par e-mail ou WhatsApp.

### D. Déploiement Cloud Permanent (Tests Mobiles 24h/24)
- **Dépôt GitHub :** [https://github.com/krieknini-hue/tango-itineraire](https://github.com/krieknini-hue/tango-itineraire)
- **Application en ligne (GitHub Pages) :** [https://krieknini-hue.github.io/tango-itineraire/](https://krieknini-hue.github.io/tango-itineraire/)
