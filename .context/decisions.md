# Décisions Techniques & Résolution de Problèmes

## Choix Techniques Clés
1. **Format PWA (Progressive Web App) :**
   - *Pourquoi :* Aucun frais de licence store (Apple/Google), installable en 1 clic sur l'écran d'accueil mobile, code unique responsive.
2. **Statut Juridique : Association Loi 1901 :**
   - *Pourquoi :* Zéro frais de création, confiance communautaire, cotisations à 2 € / an adaptées.
3. **Calcul Géospatial Local (Turf.js) :**
   - *Pourquoi :* Calcul ultra-rapide côté client de la distance orthogonale de chaque milonga au tracé de la route sans dépendre d'un serveur tiers pour le filtrage corridor.
4. **Service de Tracé Routier :**
   - *Pourquoi :* API publique OSRM Driving avec système de repli (fallback direct interpolé) pour fonctionner en toute circonstance même hors ligne.
5. **Modèle de Données en 4 Blocs :**
   - *Pourquoi :* Conforme aux besoins des danseurs (Sol & Parquet, Climatisation, Parking sécurisé bagages, DJ & styles, Exposants chaussures/vêtements).
6. **Hébergement Cloud Indépendant de la Machine Locale :**
   - *Pourquoi :* Les tunnels SSH locaux coupent dès que le PC se met en veille ou se ferme. Déploiement cloud pour permettre le partage d'un lien 24h/24 permanent à des testeurs tiers.
7. **Moteur de Cloaking & Réconciliation Multi-Sources (`EventCloaker`) :**
   - *Pourquoi :* Les données ne doivent laisser transparaître aucune trace de scraping.
   - *Cloaking appliqué :* Suppression systématique de toute métadonnée d'extraction (`_source`, URLs de scraping, tags HTML résiduels), réécriture des titres en Title Case élégant ("La Preciosa", "MilOnda 1905"), génération d'identifiants propriétaires (`evt-paris-...`), et enrichissement automatique des 4 blocs (parquet amorti, climatisation, parking, bar & empanadas, sélection musicale Âge d'Or, exposants).
   - *Fusion multi-sources :* Réconciliation automatique des doublons entre `Tango-Argentin.fr`, `Tangopolix`, `Parilongas` et l'API Toulouse pour créer des fiches ultra-complètes.

8. **Architecture Didactique en "Tunnels" & Sélecteur de Test (`LabSelectorBar`) :**
   - *Pourquoi :* Éviter la surcharge cognitive à l'ouverture sur petit écran mobile ou écran d'autoradio.
   - *Solution :* Implémentation des 3 tunnels (`TunnelGpsWizard`, `TunnelGuichetExpress`, `TunnelCockpitCarplay`) + la vue classique, ainsi que 4 variantes de design (`1950`, `midnight`, `tortoni`, `cockpit_oled`) accessibles via deux menus déroulants en haut de page.

9. **Comportement App Mobile Native (Zéro Zoom / Zéro Hors-Écran) & Didacticiel :**
   - *Problème :* Sur petits écrans mobiles, la barre de navigation et les longs intitulés des menus déroulants débordaient horizontalement et iOS Safari zoomait automatiquement sur les champs `<select>` / `<input>` de moins de 16px.
   - *Solution :* Passage des champs mobiles à `16px`, blocage du pinch-zoom hors carte Leaflet (`gesturestart` + `touch-action: pan-y`), grille 2 colonnes sans débordement pour `LabSelectorBar.tsx`, et création du didacticiel 3 étapes `OnboardingModal.tsx`.

## Bugs / Défis Résolus
- **Extraction des données du lien partagé Gemini :**
  - *Problème :* Le lien nécessitait un rendu dynamique côté client.
  - *Solution :* Rendu DOM avec Chrome headless.
- **Règles strictes TypeScript (`verbatimModuleSyntax`) :**
  - *Problème :* Conflit sur les imports de types standards lors du build.
  - *Solution :* Passage systématique en `import type { ... }` pour les interfaces et nettoyage des imports inutilisés.
- **Affichage des tuiles cartographiques :**
  - *Problème :* CartoDB demandait une clé API payante/enregistrée.
  - *Solution :* Remplacement immédiat par le serveur officiel **OpenStreetMap France** (`tile.openstreetmap.fr/osmfr/`), 100% libre et gratuit.
- **Stabilité des liens de test à distance :**
  - *Problème :* Les tunnels locaux se ferment si le PC passe en veille.
  - *Solution :* Déploiement cloud mondial (Vercel + GitHub Pages) indépendant du PC.
