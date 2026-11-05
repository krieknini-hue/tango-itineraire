import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ItineraryForm } from './components/ItineraryForm';
import { TangoMap } from './components/TangoMap';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { EmergencyModal } from './components/EmergencyModal';
import { AuthModal } from './components/AuthModal';
import { MembershipModal } from './components/MembershipModal';
import { OutreachModal } from './components/OutreachModal';
import { OfflineBanner } from './components/OfflineBanner';
import { RouteSelector } from './components/RouteSelector';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileModal } from './components/ProfileModal';
import { RouteFiltersBar } from './components/RouteFiltersBar';
import { NearbyPanel, NearbyLaunchButton } from './components/NearbyRadar';
import { profileManager, useProfileState } from './services/profileManager';
import { LabSelectorBar, type UxMode, type DesignTheme } from './components/LabSelectorBar';
import { TunnelGpsWizard } from './components/tunnels/TunnelGpsWizard';
import { TunnelGuichetExpress } from './components/tunnels/TunnelGuichetExpress';
import { TunnelCockpitCarplay } from './components/tunnels/TunnelCockpitCarplay';
import { loadEvents, eventsOnDate } from './services/eventsService';
import type { TangoEvent, CityLocation, RouteResult } from './types/tango';
import { resolveCity, getRoute, filterEventsAlongRoute } from './services/routingService';
import { reportEmergencyCancellation } from './services/supabaseService';
import { useAuth } from './context';
import { Route, Sparkles, AlertCircle, Heart, Car, Zap } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { useWakeLock } from './services/useWakeLock';
import { formatDurationToTandas } from './modules/tangoMetrics';
import { OchoLoader } from './components/FileteadoOrnaments';

export function App() {
  const { favoriteIds } = useAuth();

  // Sélecteurs de Test (Parcours Tunnel + Variante Design) — Par défaut sur Tunnel Guichet Express
  const [uxMode, setUxMode] = useState<UxMode>('tunnel_guichet');
  const [designTheme, setDesignTheme] = useState<DesignTheme>('1950');
  const [tunnelStep, setTunnelStep] = useState<1 | 2 | 3>(1);
  const [isLabOpen, setIsLabOpen] = useState(false);

  const [startCity, setStartCity] = useState('Tours');
  const [endCity, setEndCity] = useState('Cannes');
  const [date, setDate] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  });
  const [maxDetourKm, setMaxDetourKm] = useState(30);
  const [avoidTolls, setAvoidTolls] = useState(false);
  
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [events, setEvents] = useState<TangoEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState<TangoEvent[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [overnightOnly, setOvernightOnly] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [nearbyActive, setNearbyActive] = useState(false);
  const { discoveryMode } = useProfileState();
  
  const [startLocation, setStartLocation] = useState<CityLocation | null>(null);
  const [endLocation, setEndLocation] = useState<CityLocation | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<string>('primary');
  
  const [selectedEvent, setSelectedEvent] = useState<TangoEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('tango_guide_seen_v1');
    } catch {
      return false;
    }
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mode Conduite / Cockpit global (polices +35%, boutons >= 64px, wakeLock actif, lecture < 2s)
  const [isDrivingMode, setIsDrivingMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tango_driving_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Verrouillage écran (Screen Wake Lock API avec fallback)
  const { isActive: isWakeLockActive, isSupported: isWakeLockSupported } = useWakeLock(isDrivingMode);

  const handleToggleDrivingMode = () => {
    setIsDrivingMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tango_driving_mode', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    try {
      localStorage.setItem('tango_guide_seen_v1', '1');
    } catch {
      // ignore storage errors
    }
  };

  // Recherche d'itinéraire et calcul du corridor avec propositions bis
  const performSearch = async (
    sCity = startCity, 
    eCity = endCity, 
    detour = maxDetourKm, 
    currentEvents = events,
    isAvoidTolls = avoidTolls
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [startLoc, endLoc] = await Promise.all([
        resolveCity(sCity),
        resolveCity(eCity)
      ]);

      if (!startLoc) {
        setErrorMessage(`Ville de départ inconnue : "${sCity}". Essayez Tours, Paris, Lyon, Bordeaux...`);
        setIsLoading(false);
        return;
      }

      if (!endLoc) {
        setErrorMessage(`Ville d'arrivée inconnue : "${eCity}". Essayez Cannes, Nice, Marseille...`);
        setIsLoading(false);
        return;
      }

      setStartLocation(startLoc);
      setEndLocation(endLoc);

      // Calcul des tracés routiers (avec alternative bis / sans péage)
      const targetRouteId = isAvoidTolls ? 'bis_toll_free' : 'primary';
      const route = await getRoute(startLoc, endLoc, { preferredRouteId: targetRouteId });

      // Seuls les événements du jour choisi sont pertinents pour un trajet
      const dayPool = eventsOnDate(currentEvents, date);

      // Calcule le nombre de milongas pour chaque option de route (directe vs bis)
      const routesWithCounts = route.routes.map((r) => {
        const matched = filterEventsAlongRoute(dayPool, r.coordinates, detour, startLoc);
        return { ...r, eventsCount: matched.length };
      });

      const updatedRoute: RouteResult = {
        ...route,
        routes: routesWithCounts,
      };

      setRouteResult(updatedRoute);
      setActiveRouteId(targetRouteId);

      // Filtrage des événements pour la route sélectionnée
      const activeOption = updatedRoute.routes.find((r) => r.id === targetRouteId) || updatedRoute.routes[0];
      const matched = filterEventsAlongRoute(dayPool, activeOption.coordinates, detour, startLoc);
      setFilteredEvents(matched);

    } catch (err) {
      console.error(err);
      setErrorMessage("Impossible de calculer l'itinéraire. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  // Bascule dynamique entre Itinéraire Principal et Itinéraire Bis
  const handleSelectRoute = (routeId: string) => {
    if (!routeResult || !startLocation) return;
    const selected = routeResult.routes.find((r) => r.id === routeId);
    if (!selected) return;

    setActiveRouteId(routeId);
    setAvoidTolls(selected.isTollFree);

    setRouteResult({
      ...routeResult,
      coordinates: selected.coordinates,
      totalDistanceKm: selected.totalDistanceKm,
      totalDurationMinutes: selected.totalDurationMinutes,
      isTollFree: selected.isTollFree,
      estimatedTollEur: selected.estimatedTollEur,
      activeRouteId: selected.id,
    });

    const matched = filterEventsAlongRoute(dayEvents, selected.coordinates, maxDetourKm, startLocation);
    setFilteredEvents(matched);
  };

  // Événements du jour de recherche (le trajet ne montre que cette date)
  const dayEvents = useMemo(() => eventsOnDate(events, date), [events, date]);

  // Chargement des événements réels puis première recherche (Tours -> Cannes)
  useEffect(() => {
    let cancelled = false;
    loadEvents()
      .then((list) => {
        if (cancelled) return;
        setEvents(list);
        setEventsLoading(false);
        performSearch(startCity, endCity, maxDetourKm, list, avoidTolls);
      })
      .catch(() => {
        if (cancelled) return;
        setEventsLoading(false);
        setErrorMessage('Impossible de charger les événements. Vérifiez votre connexion.');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalcul rapide si le rayon de détour change
  useEffect(() => {
    if (routeResult && startLocation) {
      const activeCoords = routeResult.coordinates;
      const matched = filterEventsAlongRoute(dayEvents, activeCoords, maxDetourKm, startLocation);
      setFilteredEvents(matched);
    }
  }, [maxDetourKm, dayEvents, routeResult, startLocation]);

  // Événements effectivement affichés (avec filtre favoris optionnel)
  const displayedEvents = useMemo(() => {
    let list = filteredEvents;
    if (showOnlyFavorites) {
      list = list.filter((evt) => favoriteIds.includes(evt.id));
    }
    if (overnightOnly) {
      list = list.filter((evt) => evt.nomad_logistics?.overnight_parking === true);
    }
    return list;
  }, [filteredEvents, showOnlyFavorites, favoriteIds, overnightOnly]);

  // Simulation d'une annulation d'urgence (canal WhatsApp Asso & BDD Supabase)
  const handleToggleCancellation = async (eventId: string) => {
    const target = events.find((e) => e.id === eventId);
    const nextStatus = target?.status === 'confirmed' ? 'cancelled' : 'confirmed';
    const reason = nextStatus === 'cancelled'
      ? "Alerte reçue par l'organisateur à 18h30 : Salle inondée suite orage, événement reporté."
      : undefined;

    if (nextStatus === 'cancelled') {
      await reportEmergencyCancellation(eventId, reason || '');
    }

    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const updated: TangoEvent = {
            ...evt,
            status: nextStatus,
            cancellationReason: reason,
          };
          if (selectedEvent?.id === eventId) {
            setSelectedEvent(updated);
          }
          return updated;
        }
        return evt;
      })
    );
  };

  const currentSelected = useMemo(() => {
    if (!selectedEvent) return null;
    return events.find((e) => e.id === selectedEvent.id) || selectedEvent;
  }, [selectedEvent, events]);

  const handleUxModeChange = (mode: UxMode) => {
    setUxMode(mode);
    setTunnelStep(1);
    if (mode === 'tunnel_cockpit' && designTheme === '1950') {
      // On garde le thème actif mais l'utilisateur peut tester Cockpit OLED s'il veut
    }
  };

  return (
    <div
      className={`theme-${designTheme} ${
        isDrivingMode ? 'mode-driving' : ''
      } min-h-screen bg-[#0F0F14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1A1A24]/90 via-[#0F0F14] to-[#08080C] text-[#F8F9FA] flex flex-col font-sans pb-24 md:pb-12 selection:bg-[#F4A261] selection:text-[#0F0F14]`}
    >
      {/* Tiroir Labo Test (ouvert via le bouton roue dentée ⚙️) */}
      <LabSelectorBar
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
        uxMode={uxMode}
        setUxMode={handleUxModeChange}
        designTheme={designTheme}
        setDesignTheme={setDesignTheme}
        onResetTunnel={() => {
          setNearbyActive(false);
          setTunnelStep(1);
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Bandeau d'état réseau hors-ligne nomade */}
      <OfflineBanner />

      {/* HUD & BANDEAU MODE CONDUITE / VOITURE (Haute sécurité au volant) */}
      {isDrivingMode && (
        <aside
          aria-label="Mode conduite actif"
          className="bg-emerald-950 border-b-2 border-emerald-400 text-emerald-100 px-3 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 shadow-xl sticky top-[48px] z-20"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="p-1 rounded-lg bg-emerald-600 text-white shrink-0">
              <Car className="w-4 h-4" />
            </span>
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold uppercase tracking-wider text-white">Mode Conduite Actif</span>
              <span className="text-emerald-300">•</span>
              <span className="text-emerald-200 truncate flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                {isWakeLockActive
                  ? 'Écran maintenu allumé (WakeLock ⚡)'
                  : isWakeLockSupported
                  ? 'Verrouillage écran actif'
                  : 'Mode grand contraste & gros boutons'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleDrivingMode}
            className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-300 font-bold text-xs uppercase cursor-pointer shrink-0 transition"
          >
            Quitter
          </button>
        </aside>
      )}

      {/* Barre de navigation allégée avec bouton Mode Conduite, favoris & menu */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        resultsCount={displayedEvents.length}
        onOpenEmergencyInfo={() => setIsEmergencyModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenMembership={() => setIsMembershipModalOpen(true)}
        onOpenOutreach={() => setIsOutreachModalOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenLab={() => setIsLabOpen(true)}
        onResetHome={() => {
          setNearbyActive(false);
          setTunnelStep(1);
        }}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
        favoritesCount={favoriteIds.length}
        showViewToggle={uxMode === 'classic'}
        isDrivingMode={isDrivingMode}
        onToggleDrivingMode={handleToggleDrivingMode}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      {/* Conteneur principal */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4">
        {/* Indicateur de chargement initial stylisé avec la boucle Ocho */}
        {eventsLoading && (
          <div className="bg-[#1b1210] border border-[#d4af37]/40 rounded-2xl p-6 shadow-xl flex items-center justify-center">
            <OchoLoader size={56} label="Chargement des milongas et festivals réels en France..." />
          </div>
        )}

        {/* Radar local (« Autour d'une ville / de moi ») */}
        {nearbyActive && (
          <NearbyPanel
            events={events}
            selectedEvent={currentSelected}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            onClose={() => setNearbyActive(false)}
          />
        )}

        {/* En mode hors Guichet Express uniquement : raccourci Radar & Filtres à l'étape des résultats */}
        {!nearbyActive && uxMode === 'classic' && (
          <div className="space-y-3">
            <NearbyLaunchButton onClick={() => setNearbyActive(true)} />
            <RouteFiltersBar
              overnightOnly={overnightOnly}
              setOvernightOnly={setOvernightOnly}
              discoveryMode={discoveryMode}
              setDiscoveryMode={profileManager.setDiscoveryMode}
            />
          </div>
        )}

        {/* Message d'erreur éventuel */}
        {errorMessage && (
          <div className="bg-[#3a0d14] border border-rose-500 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* VERSION 1 : TUNNEL GPS 3 ÉTAPES (Mobile & Route) */}
        {!nearbyActive && uxMode === 'tunnel_gps' && (
          <TunnelGpsWizard
            step={tunnelStep}
            setStep={setTunnelStep}
            startCity={startCity}
            setStartCity={setStartCity}
            endCity={endCity}
            setEndCity={setEndCity}
            date={date}
            setDate={setDate}
            maxDetourKm={maxDetourKm}
            setMaxDetourKm={setMaxDetourKm}
            avoidTolls={avoidTolls}
            setAvoidTolls={(avoid) => {
              setAvoidTolls(avoid);
              if (routeResult) handleSelectRoute(avoid ? 'bis_toll_free' : 'primary');
            }}
            onSearch={(s, e, d, avoid) => performSearch(s, e, d, events, avoid)}
            isLoading={isLoading}
            routeResult={routeResult}
            activeRouteId={activeRouteId}
            onSelectRoute={handleSelectRoute}
            startLocation={startLocation}
            endLocation={endLocation}
            events={displayedEvents}
            selectedEvent={currentSelected}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        )}

        {/* VERSION 2 : TUNNEL GUICHET EXPRESS (Par défaut — 2 questions puis Résultat avec tiroir d'options) */}
        {!nearbyActive && uxMode === 'tunnel_guichet' && (
          <TunnelGuichetExpress
            step={tunnelStep}
            setStep={setTunnelStep}
            startCity={startCity}
            setStartCity={setStartCity}
            endCity={endCity}
            setEndCity={setEndCity}
            date={date}
            setDate={setDate}
            maxDetourKm={maxDetourKm}
            setMaxDetourKm={setMaxDetourKm}
            avoidTolls={avoidTolls}
            setAvoidTolls={(avoid) => {
              setAvoidTolls(avoid);
              if (routeResult) handleSelectRoute(avoid ? 'bis_toll_free' : 'primary');
            }}
            overnightOnly={overnightOnly}
            setOvernightOnly={setOvernightOnly}
            discoveryMode={discoveryMode}
            setDiscoveryMode={profileManager.setDiscoveryMode}
            onOpenNearby={() => setNearbyActive(true)}
            onSearch={(s, e, d, avoid) => performSearch(s, e, d, events, avoid)}
            isLoading={isLoading}
            routeResult={routeResult}
            activeRouteId={activeRouteId}
            onSelectRoute={handleSelectRoute}
            startLocation={startLocation}
            endLocation={endLocation}
            events={displayedEvents}
            selectedEvent={currentSelected}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        )}

        {/* VERSION 3 : MODE COCKPIT AUTORADIO / CARPLAY (Spécial Conduite) */}
        {!nearbyActive && uxMode === 'tunnel_cockpit' && (
          <TunnelCockpitCarplay
            step={tunnelStep}
            setStep={setTunnelStep}
            startCity={startCity}
            setStartCity={setStartCity}
            endCity={endCity}
            setEndCity={setEndCity}
            maxDetourKm={maxDetourKm}
            setMaxDetourKm={setMaxDetourKm}
            avoidTolls={avoidTolls}
            setAvoidTolls={(avoid) => {
              setAvoidTolls(avoid);
              if (routeResult) handleSelectRoute(avoid ? 'bis_toll_free' : 'primary');
            }}
            onSearch={(s, e, d, avoid) => performSearch(s, e, d, events, avoid)}
            isLoading={isLoading}
            routeResult={routeResult}
            activeRouteId={activeRouteId}
            onSelectRoute={handleSelectRoute}
            startLocation={startLocation}
            endLocation={endLocation}
            events={displayedEvents}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        )}

        {/* VERSION 4 : VUE COMPLÈTE CLASSIQUE (Originale) */}
        {!nearbyActive && uxMode === 'classic' && (
          <>
            <ItineraryForm
              startCity={startCity}
              setStartCity={setStartCity}
              endCity={endCity}
              setEndCity={setEndCity}
              date={date}
              setDate={setDate}
              maxDetourKm={maxDetourKm}
              setMaxDetourKm={setMaxDetourKm}
              avoidTolls={avoidTolls}
              setAvoidTolls={(avoid) => {
                setAvoidTolls(avoid);
                if (routeResult) {
                  handleSelectRoute(avoid ? 'bis_toll_free' : 'primary');
                }
              }}
              onSearch={() => performSearch(startCity, endCity, maxDetourKm, events, avoidTolls)}
              isLoading={isLoading}
            />

            {routeResult && routeResult.routes && routeResult.routes.length > 1 && (
              <RouteSelector
                routes={routeResult.routes}
                activeRouteId={activeRouteId}
                onSelectRoute={handleSelectRoute}
              />
            )}

            {routeResult && startLocation && endLocation && (
              <div className="bg-[#1b1210] rounded-xl p-3.5 border border-[#d4af37]/40 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#f5d77f] flex items-center gap-1.5 text-sm sm:text-base tracking-wide">
                    <Route className="w-4 h-4 text-[#d4af37]" />
                    {startLocation.name} ➔ {endLocation.name}
                  </span>
                  <span className="text-[#d4af37]/40">•</span>
                  <span className="text-amber-100 font-semibold font-mono">
                    {routeResult.totalDistanceKm} km
                  </span>
                  <span className="text-[#d4af37]/40">•</span>
                  <span className="text-amber-200/80 font-medium">
                    ~{Math.floor(routeResult.totalDurationMinutes / 60)}h{routeResult.totalDurationMinutes % 60 ? (routeResult.totalDurationMinutes % 60).toString().padStart(2, '0') : ''} de route
                    <span className="text-[#F4A261] font-semibold ml-1.5 font-mono">
                      (🎶 ~{formatDurationToTandas(routeResult.totalDurationMinutes).tandasCount} tandas)
                    </span>
                  </span>
                  <span className="text-[#d4af37]/40">•</span>
                  <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    routeResult.isTollFree
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-600/40'
                  }`}>
                    {routeResult.isTollFree ? '0 € péage' : `~${routeResult.estimatedTollEur} € péage`}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-medium">
                  <span className="text-[#fce59e] font-bold bg-[#8e1c2e] px-2.5 py-1 rounded-lg border border-[#d4af37]/50 shadow-sm">
                    {displayedEvents.length} {showOnlyFavorites ? 'favori' : 'salon'}{displayedEvents.length > 1 ? 's' : ''} sur la route
                  </span>
                  <span className="text-amber-200/50 text-xs hidden md:inline font-mono">
                    (détour max : {maxDetourKm} km)
                  </span>
                </div>
              </div>
            )}

            {/* MISE EN PAGE SCINDÉE (SPLIT-VIEW) DÈS 768px (TABLETTE / DESKTOP) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Colonne GAUCHE (>= 768px) : Liste des itinéraires, étapes & milongas */}
              <div className={`space-y-3 md:col-span-5 ${viewMode === 'map' ? 'hidden md:block' : 'block'}`}>
                <div className="flex items-center justify-between pb-1">
                  <h2 className="text-xs font-display font-bold text-[#f5d77f] uppercase tracking-wider flex items-center gap-1.5">
                    {showOnlyFavorites ? (
                      <>
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        Mes Salons & Milongas Enregistrés
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                        Salons & Milongas ordonnés sur le trajet
                      </>
                    )}
                  </h2>
                  <span className="text-xs text-amber-200/60 font-mono font-medium">
                    {displayedEvents.length} résultat{displayedEvents.length > 1 ? 's' : ''}
                  </span>
                </div>

                {displayedEvents.length === 0 ? (
                  <div className="bg-[#1b1210] rounded-2xl p-8 border border-[#d4af37]/35 text-center space-y-2 shadow-lg">
                    <p className="font-bold text-[#f5d77f] text-base">
                      {showOnlyFavorites
                        ? 'Aucun favori enregistré sur cet itinéraire'
                        : 'Aucune milonga dans ce rayon'}
                    </p>
                    <p className="text-xs text-amber-200/80">
                      {showOnlyFavorites
                        ? 'Cliquez sur le cœur d’une milonga pour l’enregistrer et la consulter même sans 4G.'
                        : "Augmentez le curseur de détour (ex: 40 ou 50 km) ou essayez l'autre itinéraire pour trouver les salons."}
                    </p>
                    {showOnlyFavorites ? (
                      <button
                        type="button"
                        onClick={() => setShowOnlyFavorites(false)}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#8e1c2e] hover:bg-[#aa2137] text-[#fce59e] border border-[#d4af37]/60 font-bold text-xs uppercase tracking-wide transition cursor-pointer shadow-md"
                      >
                        Voir tous les salons
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMaxDetourKm(50)}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#8e1c2e] hover:bg-[#aa2137] text-[#fce59e] border border-[#d4af37]/60 font-bold text-xs uppercase tracking-wide transition cursor-pointer shadow-md"
                      >
                        Passer le détour à 50 km
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[580px] md:max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                    {displayedEvents.map((evt) => (
                      <EventCard
                        key={evt.id}
                        event={evt}
                        isSelected={currentSelected?.id === evt.id}
                        onSelect={(e) => setSelectedEvent(e)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Colonne DROITE (>= 768px) : Carte Interactive & Détails */}
              <div className={`md:col-span-7 h-[480px] md:h-[calc(100vh-220px)] md:min-h-[560px] md:sticky md:top-20 ${
                viewMode === 'list' ? 'hidden md:block' : 'block'
              }`}>
                <TangoMap
                  startLocation={startLocation}
                  endLocation={endLocation}
                  routeCoords={routeResult?.coordinates || []}
                  routes={routeResult?.routes || []}
                  activeRouteId={activeRouteId}
                  onSelectRouteId={handleSelectRoute}
                  events={displayedEvents}
                  selectedEvent={currentSelected}
                  onSelectEvent={(evt) => setSelectedEvent(evt)}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Barre de navigation mobile fixée en bas (Zone naturelle du pouce < 768px) */}
      <BottomNav
        currentTab={
          uxMode === 'tunnel_guichet' || uxMode === 'tunnel_gps'
            ? tunnelStep < 3
              ? 'trajet'
              : viewMode === 'map'
              ? 'carte'
              : 'billets'
            : viewMode === 'map'
            ? 'carte'
            : 'billets'
        }
        onChangeTab={(tab) => {
          if (tab === 'trajet') {
            setTunnelStep(2);
            setShowOnlyFavorites(false);
          } else if (tab === 'billets') {
            setTunnelStep(3);
            setViewMode('list');
          } else if (tab === 'carte') {
            setTunnelStep(3);
            setViewMode('map');
          }
        }}
        resultsCount={displayedEvents.length}
        showOnlyFavorites={showOnlyFavorites}
        onToggleFavorites={() => setShowOnlyFavorites((prev) => !prev)}
        favoritesCount={favoriteIds.length}
        isDrivingMode={isDrivingMode}
        onToggleDrivingMode={handleToggleDrivingMode}
        onOpenMenu={() => setIsDrawerOpen(true)}
      />

      {/* Modal Détail Fiche Complète (4 Blocs + Deep Links GPS) */}
      <EventDetailModal
        event={currentSelected}
        onClose={() => setSelectedEvent(null)}
        onToggleCancellation={handleToggleCancellation}
      />

      {/* Modal Charte Zéro Faux Plan & Ligne d'Urgence */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Modal Authentification Mobile SMS OTP */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenMembership={() => setIsMembershipModalOpen(true)}
      />

      {/* Modal Cotisation Annuelle Stripe (2 € / an) */}
      <MembershipModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Modal Outreach & Support Visuel Associations */}
      <OutreachModal
        isOpen={isOutreachModalOpen}
        onClose={() => setIsOutreachModalOpen(false)}
      />

      {/* Modal Fiche Tanguero (bottom sheet mobile) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Modal Didacticiel Rapide (4 étapes) */}
      <OnboardingModal
        isOpen={isGuideOpen}
        onClose={handleCloseGuide}
      />
    </div>
  );
}

export default App;
