# 📌 Mémoire Globale du Projet — Tango Itinéraire

Ce document centralise l'état d'avancement, la stratégie de données, la vision technique et la feuille de route pour les prochaines conversations de travail.

---

## 1. Vision & Architecture Validée
- **Type de produit :** **PWA (Progressive Web App)** Mobile-First (aucun frais Apple Store / Google Play, installable en 1 clic sur l'écran d'accueil du smartphone).
- **Fonction clé :** Trouver les événements tango (milongas, pratiques, festivals, marathons) le long d'un trajet routier (ex: Tours ➔ Cannes) selon un rayon de détour réglable (5 à 60 km).
- **Statut juridique cible :** **Association Loi 1901** (confiance communautaire, 0 € de frais de création, gestion légère).
- **Modèle économique :** 6 mois gratuits (phase d'adoption), puis cotisation annuelle de **2 € / an** par danseur (authentification numéro de téléphone + paiement 1 clic Stripe / Apple Pay / Google Pay).

---

## 2. État Actuel du Prototype (Fonctionnel)
- **Localisation du code :** Racine du dossier `Tango`.
- **Serveur de dev actif :** `http://localhost:5173/`
- **Moteur d'itinéraire :** Calcul de tracé routier (OSRM) + calcul de détour géométrique ultra-rapide avec `@turf/turf`.
- **Cartographie :** Leaflet avec tuiles officielles **OpenStreetMap France** (100% libres, fluides, sans aucune clé API requise).
- **Fiches Événements en 4 Blocs :**
  1. *L'Essentiel :* Horaires, tarif, asso organisatrice, ville/adresse, distance et temps de détour.
  2. *Confort & Sol du Danseur :* Type de parquet (amorti, carrelage, etc.), climatisation (oui/non), parking bagages sécurisé, vestiaire, bar.
  3. *Ambiance & Danse :* Code (mirada/cabeceo, néo, pratique), DJs et styles musicaux, live music, équilibre guide/suiveur.
  4. *Exposants :* Chaussures et vêtements de danse.
- **Deep links :** Redirection 1 clic vers Waze, Google Maps et Apple Maps.
- **Ligne d'urgence intégrée :** Canal WhatsApp Business avec simulateur d'alerte en direct (passage en 🔴 ANNULÉ et alternatives).

---

## 3. Stratégie Données & Scraping (Mémoire Juridique & Pratique)

### A. Cadre Légal
- **Les faits purs sont libres :** Les dates, heures, villes, adresses et noms d'associations sont des informations publiques factuelles non protégeables par le droit d'auteur.
- **Droit des bases de données :** L'extraction massive d'un annuaire tiers peut être contestée s'il y a préjudice direct.
- **Protection totale de notre côté :**
  1. On extrait uniquement les **faits bruts** (pas de copier-coller de textes rédigés).
  2. On réorganise et enrichit la donnée avec nos propres critères exclusifs que les annuaires n'ont pas (sol amorti, clim, parking bagages, DJ, exposants).
  3. Le scraping est cadencé de façon discrète (requêtes lentes, en-tête navigateur normal), le rendant **strictement indétectable** dans les logs.

### B. Démarche Communautaire
- `tango-argentin.fr` est tenu par des bénévoles passionnés.
- Utiliser le site pour répertorier les associations, puis leur envoyer un mot amical pour proposer un échange de visibilité ou une intégration officielle.

---

## 4. Découpage Prévu des Prochaines Conversations

L'approche consistant à séparer les conversations est **excellente** pour éviter la saturation du contexte IA :

1. **Conversation 1 — Données & Scraping :**
   - Mise au point du script d'extraction / moissonneur discret (tango-argentin.fr, milongas.fr, réseaux).
   - Structuration de la base de données réelle (Tours ➔ Cannes et grands axes).
2. **Conversation 2 — Moteur & Évolutions Techniques :**
   - Connexion de la base de données (Supabase / Postgres).
   - Authentification mobile par SMS OTP (sans mot de passe).
   - Module de paiement cotisation 2 € (Stripe).
3. **Conversation 3 — Design & Identité Visuelle : (Terminé)**
   - Charte graphique immersive de l'Âge d'Or du Tango (Buenos Aires 1950) : Fileteado Porteño, boiserie acajou (`#1B1210`), carmin velours (`#8E1C2E`), or patiné (`#D4AF37`) et papier partition (`#FCF8F0`).
   - Typographies Google Fonts : `Cinzel Decorative`, `Playfair Display`, `Plus Jakarta Sans`.
   - Bibliothèque de volutes baroques SVG (`FileteadoOrnaments.tsx`) et fiches stylisées en billets traditionnels "Entrada de Milonga".
   - Habillage complet des composants, de la carte Leaflet et des modales (urgences, auth, cotisation).
