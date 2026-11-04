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
import { LabSelectorBar, type UxMode, type DesignTheme } from './components/LabSelectorBar';
import { TunnelGpsWizard } from './components/tunnels/TunnelGpsWizard';
import { TunnelGuichetExpress } from './components/tunnels/TunnelGuichetExpress';
import { TunnelCockpitCarplay } from './components/tunnels/TunnelCockpitCarplay';
import { INITIAL_MOCK_EVENTS } from './data/mockEvents';
import type { TangoEvent, CityLocation, RouteResult } from './types/tango';
import { resolveCity, getRoute, filterEventsAlongRoute } from './services/routingService';
import { reportEmergencyCancellation } from './services/supabaseService';
import { useAuth } from './context';
import { Route, Sparkles, AlertCircle, Heart } from 'lucide-react';

export function App() {
  const { favoriteIds } = useAuth();

  // Sélecteurs de Test (Parcours Tunnel + Variante Design)
  const [uxMode, setUxMode] = useState<UxMode>('tunnel_gps');
  const [designTheme, setDesignTheme] = useState<DesignTheme>('1950');
  const [tunnelStep, setTunnelStep] = useState<1 | 2 | 3>(1);

  const [startCity, setStartCity] = useState('Tours');
  const [endCity, setEndCity] = useState('Cannes');
  const [date, setDate] = useState('2026-11-06');
  const [maxDetourKm, setMaxDetourKm] = useState(30);
  const [avoidTolls, setAvoidTolls] = useState(false);
  
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [events, setEvents] = useState<TangoEvent[]>(INITIAL_MOCK_EVENTS);
  const [filteredEvents, setFilteredEvents] = useState<TangoEvent[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      // Calcule le nombre de milongas pour chaque option de route (directe vs bis)
      const routesWithCounts = route.routes.map((r) => {
        const matched = filterEventsAlongRoute(currentEvents, r.coordinates, detour, startLoc);
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
      const matched = filterEventsAlongRoute(currentEvents, activeOption.coordinates, detour, startLoc);
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

    const matched = filterEventsAlongRoute(events, selected.coordinates, maxDetourKm, startLocation);
    setFilteredEvents(matched);
  };

  // Lancement automatique au premier chargement (Tours -> Cannes)
  useEffect(() => {
    performSearch();
  }, []);

  // Recalcul rapide si le rayon de détour change
  useEffect(() => {
    if (routeResult && startLocation) {
      const activeCoords = routeResult.coordinates;
      const matched = filterEventsAlongRoute(events, activeCoords, maxDetourKm, startLocation);
      setFilteredEvents(matched);
    }
  }, [maxDetourKm, events, routeResult, startLocation]);

  // Événements effectivement affichés (avec filtre favoris optionnel)
  const displayedEvents = useMemo(() => {
    if (showOnlyFavorites) {
      return filteredEvents.filter((evt) => favoriteIds.includes(evt.id));
    }
    return filteredEvents;
  }, [filteredEvents, showOnlyFavorites, favoriteIds]);

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
      className={`theme-${designTheme} min-h-screen bg-[#120b0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a1713]/70 via-[#150d0c] to-[#0d0706] text-[#f7f2e7] flex flex-col font-sans pb-12 selection:bg-[#d4af37] selection:text-[#120b0a]`}
    >
      {/* Barre de sélection Mode Test (Menu déroulant Parcours Tunnel + Design) */}
      <LabSelectorBar
        uxMode={uxMode}
        setUxMode={handleUxModeChange}
        designTheme={designTheme}
        setDesignTheme={setDesignTheme}
        onResetTunnel={() => setTunnelStep(1)}
      />

      {/* Bandeau d'état réseau hors-ligne nomade */}
      <OfflineBanner />

      {/* Barre de navigation façon grand salon */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        resultsCount={displayedEvents.length}
        onOpenEmergencyInfo={() => setIsEmergencyModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenMembership={() => setIsMembershipModalOpen(true)}
        onOpenOutreach={() => setIsOutreachModalOpen(true)}
        showOnlyFavorites={showOnlyFavorites}
        setShowOnlyFavorites={setShowOnlyFavorites}
        favoritesCount={favoriteIds.length}
      />

      {/* Conteneur principal */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4">
        {/* Message d'erreur éventuel */}
        {errorMessage && (
          <div className="bg-[#3a0d14] border border-rose-500 text-rose-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* VERSION 1 : TUNNEL GPS 3 ÉTAPES (Mobile & Route) */}
        {uxMode === 'tunnel_gps' && (
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

        {/* VERSION 2 : TUNNEL GUICHET EXPRESS (2 questions puis Résultat) */}
        {uxMode === 'tunnel_guichet' && (
          <TunnelGuichetExpress
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
            selectedEvent={currentSelected}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
          />
        )}

        {/* VERSION 3 : MODE COCKPIT AUTORADIO / CARPLAY (Spécial Conduite) */}
        {uxMode === 'tunnel_cockpit' && (
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
        {uxMode === 'classic' && (
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className={`lg:col-span-7 h-[480px] lg:h-[580px] ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
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

              <div className={`space-y-3 lg:col-span-5 ${viewMode === 'map' ? 'hidden lg:block' : 'block'}`}>
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
                  <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
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
            </div>
          </>
        )}
      </main>

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
    </div>
  );
}

export default App;
