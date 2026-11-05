# Décisions Techniques & Résolution de Problèmes

## Choix Techniques Clés
1. **Design Tokens & Palette "Milonga Nocturne" :**
   - *Pourquoi :* Lisibilité optimale de nuit et sous forte luminosité sans éblouir le conducteur.
   - *Tokens :* Fond `#0F0F14`, Cartes `#1A1A24`, Rouge Tango `#E63946`, Or Porteño `#F4A261`, Texte `#F8F9FA`.

2. **Navigation Mobile "Thumb-Zone" (< 768px) & Split-View (>= 768px) :**
   - *Pourquoi :* Utilisation à une main sur smartphone en zone du pouce via `BottomNav.tsx`, et affichage simultané liste + carte Leaflet sticky dès 768px sur tablette/desktop.

3. **Mode Cockpit / Voiture & Screen Wake Lock :**
   - *Pourquoi :* Verrouiller l'écran sans mise en veille (`navigator.wakeLock`), polices +35%, boutons tactiles >= 64px, textes secondaires masqués (< 2s de lecture).

4. **Lanceurs Universels GPS & Compatibilité Android Auto :**
   - *Pourquoi :* Permettre un lancement instantané sans ressaisie d'adresse dans Waze ou Google Maps (mobile et écran déporté Android Auto/CarPlay).
   - *Format :* `https://waze.com/ul?q={coords_ou_adresse}&navigate=yes` et `https://www.google.com/maps/dir/?api=1&destination={coords_ou_adresse}&travelmode=driving`.

5. **Métriques Culturelles Tango (Tandas & Cumparsita) :**
   - *Pourquoi :* Donner du sens aux danseurs nomades. Le temps en minutes est traduit en "Tandas" (12 min = 1 tanda + cortina). L'heure estimée d'arrivée (ETA) est comparée à la fin de soirée pour alerter si l'on arrive "Juste à temps pour La Cumparsita !".

6. **Mémo "Dernier Kilomètre" Local-First :**
   - *Pourquoi :* Les détails d'accès (digicode, parking, adhérence du sol) sont indispensables à l'arrivée en zone blanche sans 4G.
   - *Solution :* Persistance instantanée dans `localStorage` sans dépendance réseau.

7. **Finitions Visuelles "Juice" en Pur CSS & SVG Zéro Dépendance :**
   - *Pourquoi :* Éviter des librairies d'animations lourdes (Framer Motion ou GSAP) pour préserver la réactivité PWA sur smartphones modestes.
   - *Solution :*
     - Animation d'accordéon Bandonéon via `@keyframes` et transition `cubic-bezier(0.34, 1.56, 0.64, 1)`.
     - Loader Ocho de Tango en SVG natif avec `stroke-dasharray` / `stroke-dashoffset` en boucle.
     - Coins Fileteado Porteño en SVG `#F4A261` (opacité 40%).
