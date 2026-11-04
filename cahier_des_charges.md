# 💃 Spécifications Fonctionnelles & Techniques — Tango Itinéraire

## 1. Vision & Objectifs
Permettre aux danseurs de tango argentin ("tangueros nomades") de trouver facilement les événements de tango (milongas, pratiques, festivals, marathons, stages) situés **sur leur trajet routier** à travers la France, avec un rayon de détour paramétrable (en kilomètres ou en minutes).

---

## 2. Parcours Utilisateur & Fonctionnalités Danseur

### A. Recherche par Itinéraire
- **Saisie du trajet :** Ville de départ, ville d'arrivée, dates du trajet, étapes intermédiaires optionnelles.
- **Périmètre de détour :** Curseur réglable (ex. : 10 km, 20 km, 30 km ou 15 à 45 min de détour max).
- **Affichage double :**
  - **Vue Carte interactive :** Tracé routier + puces d'événements géolocalisées avec code couleur par type (Milonga, Pratique, Festival/Marathon).
  - **Vue Timeline / Liste chronologique :** Événements ordonnés par jour et étape du voyage.
- **Deep Links Navigation GPS :** Boutons 1-clic pour ouvrir l'événement directement dans **Waze**, **Google Maps** ou **Apple Maps**.

### B. Fiche Événement Enrichie (Structure en 4 blocs)
1. **L'Essentiel :**
   - Nom de l'événement, date, horaires précis.
   - Organisateur / Nom de l'association.
   - Adresse exacte + distance/détour calculé depuis la route.
   - Tarifs d'entrée.
2. **Confort & Sol du Danseur :**
   - **Type de sol :** Parquet amorti, béton ciré, carrelage, plein air / estrade...
   - **Climatisation :** Oui / Non (crucial l'été).
   - **Services :** Vestiaire, parking pratique (sécurisé pour bagages), bar / restauration.
3. **Ambiance & Danse :**
   - **Format / Étiquette :** Milonga traditionnelle (mirada / cabeceo), néo / alternative, pratique informelle.
   - **Intervenants :** Noms et styles des DJs (traditionnel, alternatif, vinyles), orchestres/musiciens live, professeurs (stages).
   - **Accès & Inscription :** Entrée libre ou inscription obligatoire (équilibre rôles guide / suiveur).
4. **Exposants & Shopping :**
   - Présence de créateurs, vendeurs de chaussures et vêtements de tango.

---

## 3. Fiabilité des Données & Gestion d'Urgence

### A. Collecte Sans Friction pour les Associations
- **Adresse de centralisation :** Réception des programmes et newsletters associatives sur une adresse dédiée (`agenda@...` ou Gmail).
- **Zéro barrière tech :** Pas besoin d'imposer un compte ou un formulaire lourd aux bénévoles d'assos peu technophiles.

### B. Ligne d'Urgence & Zéro Faux Plan
- **Canal WhatsApp Business dédié :** Les organisateurs peuvent prévenir d'un imprévu en 5 secondes (message vocal / texte : intempéries, DJ malade, salle fermée).
- **Statut instantané :** Bascule en **🔴 ANNULÉ** visible immédiatement sur la carte.
- **Redirection automatique :** Suggestion immédiate d'une alternative tango à proximité pour les danseurs en route.

---

## 4. Modèle Économique & Juridique

- **Cadre Juridique :** **Association Loi 1901** (idéal pour la confiance communautaire, gratuité de création, gestion légère, cotisations).
- **Stratégie de Lancement :**
  - **Mois 1 à 6 :** Bêta 100 % gratuite pour créer l'habitude et constituer la base de données.
  - **Après 6 mois :** Cotisation annuelle symbolique de **2 € / an** pour les danseurs nomades (accès sans pub, calculs d'itinéraires et alertes).
- **Authentification & Paiement ultra-simples :**
  - Connexion par numéro de téléphone + SMS OTP (aucun mot de passe à retenir).
  - Paiement en 1 clic via **Stripe** (Apple Pay / Google Pay / CB).
- **Évolution B2B (Optionnelle à 1-2 ans) :**
  - Référencement de base gratuit pour toutes les assos.
  - Formule "Partenaire Privilégié" (15 € / an) pour mise en avant, fiches enrichies et liens billetterie.

---

## 5. Architecture Technique Recommandée

- **Frontend :** **PWA Mobile-First** (React / Next.js ou Vite + Tailwind CSS) — installable sur smartphone en 1 clic sans passer par l'App Store / Play Store.
- **Géolocalisation & Itinéraires :**
  - Calcul de route & corridor : OSRM, GraphHopper ou Mapbox Directions.
  - Requêtes géospatiales : PostgreSQL + PostGIS (recherche de points le long d'un tracé dans un rayon *buffer* de $X$ km).
- **Backend / BDD :** Supabase (Auth SMS OTP + Base Postgres PostGIS intégrée + Stockage photos fiches).
- **Paiement :** Stripe Checkout / Customer Portal.
