# Suivi du Projet — Tango Itinéraire

## État d'avancement général
Le projet intègre désormais :
- L'ergonomie responsive pour 3 formats (Smartphone au pouce, Tablette en Split-View, et Écran embarqué Conduite avec Screen Wake Lock).
- L'assistance au trajet et les métriques Tango (lanceurs universels Waze/Google Maps Android Auto, convertisseur temps -> tandas, indicateur temps de danse restant avec alerte Cumparsita, mémo dernier kilomètre).
- La finition visuelle "juice" (ornements Fileteado Porteño dorés, animation d'accordéon Bandonéon au rebond élastique, Loader Ocho de tango continu, micro-interaction pulsée au départ GPS).

## Tâches terminées
- [x] **Lanceurs de Navigation Universels (Android Auto & CarPlay) :**
  - Boutons larges et ultra-lisibles sur chaque destination et étape (`routingService.ts`, `EventCard.tsx`, `EventDetailModal.tsx`, `TunnelCockpitCarplay.tsx`).
  - Waze : `https://waze.com/ul?q={coords_ou_adresse}&navigate=yes`
  - Google Maps : `https://www.google.com/maps/dir/?api=1&destination={coords_ou_adresse}&travelmode=driving`
- [x] **Convertisseur Temps -> Tandas :**
  - Module `tangoMetrics.ts` : conversion temps de route en Tandas (base : 1 tanda + cortina = 12 minutes).
  - Badges ludiques sur les étapes, cartes et récapitulatif global d'itinéraire (ex: `48 min • 🎶 env. 4 tandas de route`).
- [x] **Indicateur "Temps de danse restant" :**
  - Calcul dynamique de la différence entre l'heure estimée d'arrivée (ETA) et l'heure de clôture du bal (par défaut 01h00).
  - Code couleur réactif : Vert (> 2h), Orange (1h à 2h), Rouge (< 1h "Juste à temps pour La Cumparsita !").
- [x] **Mémo "Dernier Kilomètre" :**
  - Persistance locale dans `localStorage` via `storageService.ts` (`getLastMileMemo`, `saveLastMileMemo`).
  - 3 tags rapides : Infos Parking, Code d'accès (avec bouton Copier), et Qualité du sol (Parquet glissant ⛸️ / normal 👟 / accrocheur 🧲).
- [x] **Finitions Visuelles & "Juice" Tango Argentin (pur CSS & SVG léger) :**
  - Ornements Fileteado Porteño dorés (`FileteadoBorderOverlay` SVG `#F4A261`, opacité 40%).
  - Animation d'accordéon "Bandonéon" fluide avec léger effet de rebond (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
  - Loader "Ocho" en SVG représentant une boucle continue en 8 avec animation `stroke-dashoffset`.
  - Micro-interaction de validation dorée déclenchée au lancement du GPS.
- [x] Build de production Vite & TypeScript sans erreur.
- [x] Déploiement GitHub effectué :
  - Dépôt source : https://github.com/krieknini-hue/tango-itineraire
  - Application en ligne (GitHub Pages) : https://krieknini-hue.github.io/tango-itineraire/

## Tâches en cours / Backlog
- [ ] Retours d'utilisateurs sur les longs trajets de nuit.
