# Suivi du Projet — Tango Itinéraire

## État d'avancement général
Le projet est désormais versionné sous Git, hébergé sur GitHub et déployé en ligne sur le cloud pour les tests mobiles 24h/24.

## Tâches terminées
- [x] Initialisation du dépôt Git local et configuration de `.gitignore`.
- [x] Création et synchronisation du dépôt public GitHub : [https://github.com/krieknini-hue/tango-itineraire](https://github.com/krieknini-hue/tango-itineraire).
- [x] Configuration de `base: './'` dans `vite.config.ts`.
- [x] Déploiement en ligne direct sur GitHub Pages (100% stable, 24h/24) : [https://krieknini-hue.github.io/tango-itineraire/](https://krieknini-hue.github.io/tango-itineraire/).
- [x] Miroir cloud haute disponibilité sur Vercel : [https://spry-crystal-yioeutj.tmp.now](https://spry-crystal-yioeutj.tmp.now).
- [x] **Mode Test Multi-Tunnels & Variantes Design** (`LabSelectorBar.tsx`) :
  - `TunnelGpsWizard.tsx` : Tunnel GPS en 3 étapes guidées (1. Où vas-tu ➔ 2. Route & Détour par gros pavés ➔ 3. Carte + Carrousel d'escales).
  - `TunnelGuichetExpress.tsx` : Tunnel Guichet Express en 2 clics (« Sur ma route » vs « Autour d'une ville ») + barre repliée.
  - `TunnelCockpitCarplay.tsx` : Mode Cockpit Autoradio / CarPlay (boutons XXL, navigation escale par escale spécial conduite).
  - 4 thèmes visuels commutables en direct (`Buenos Aires 1950`, `Milonga de Minuit`, `Café Tortoni Jour`, `Cockpit OLED`).

## Tâches en cours
- [ ] Choix final du tunnel et du thème préférés suite aux tests sur mobile / autoradio.
