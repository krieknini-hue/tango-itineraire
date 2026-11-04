import React from 'react';
import { Zap, Trees, Fuel, Coins, Music, Check } from 'lucide-react';
import type { RouteOption } from '../types/tango';

interface RouteSelectorProps {
  routes: RouteOption[];
  activeRouteId: string;
  onSelectRoute: (routeId: string) => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  activeRouteId,
  onSelectRoute,
}) => {
  if (!routes || routes.length < 2) return null;

  return (
    <div className="bg-[#1b1210] rounded-2xl p-3 sm:p-4 border border-[#d4af37]/45 shadow-2xl space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-display font-bold uppercase tracking-wide text-[#f5d77f] flex items-center gap-1.5">
          <span>◆</span>
          Choix de l'Itinéraire & Propositions Bis
          <span>◆</span>
        </h3>
        <span className="text-xs text-amber-200/70 font-medium hidden sm:inline">
          Cliquez pour basculer le tracé et les milongas associées
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {routes.map((route) => {
          const isActive = route.id === activeRouteId;
          const isTollFree = route.isTollFree;
          const hours = Math.floor(route.totalDurationMinutes / 60);
          const minutes = route.totalDurationMinutes % 60;

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`relative rounded-xl p-3.5 transition-all duration-200 cursor-pointer overflow-hidden border ${
                isActive
                  ? isTollFree
                    ? 'bg-gradient-to-br from-[#122a1f] to-[#0c1c14] border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-black'
                    : 'bg-gradient-to-br from-[#3d1017] to-[#1e0a0d] border-[#d4af37] ring-2 ring-[#d4af37]/30 shadow-lg shadow-black'
                  : 'bg-[#140c0b] border-[#d4af37]/25 hover:border-[#d4af37]/60 hover:bg-[#1a0f0d]'
              }`}
            >
              {/* Badge supérieur */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {isTollFree ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-950 text-emerald-300 border border-emerald-600/50">
                      <Trees className="w-3 h-3 text-emerald-400" />
                      {route.badge}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#8e1c2e] text-[#fce59e] border border-[#d4af37]/50 shadow-sm">
                      <Zap className="w-3 h-3 text-amber-300" />
                      {route.badge}
                    </span>
                  )}

                  {isActive && (
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-200/90 flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                      <Check className="w-3 h-3 text-amber-300" />
                      Sélectionné
                    </span>
                  )}
                </div>

                {/* Péages estimés */}
                <div className="text-right">
                  {isTollFree ? (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
                      <Coins className="w-3 h-3" />
                      0 € péage
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-200/80 flex items-center gap-1 font-mono">
                      <Coins className="w-3 h-3 text-[#d4af37]" />
                      ~{route.estimatedTollEur} € péage
                    </span>
                  )}
                </div>
              </div>

              {/* Titre & Description */}
              <h4 className="font-serif-tango font-bold text-sm text-[#f5d77f] mb-0.5">
                {route.title}
              </h4>
              <p className="text-[11px] text-amber-200/60 line-clamp-1 mb-2.5">
                {route.description}
              </p>

              {/* Métriques : Distance, Durée, Salons */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#d4af37]/20 font-mono text-amber-100">
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="font-bold">{route.totalDistanceKm} km</span>
                  <span className="text-amber-200/40">•</span>
                  <span className="text-amber-200/70">~{hours}h{minutes ? minutes.toString().padStart(2, '0') : ''}</span>
                </div>

                {route.eventsCount !== undefined && (
                  <div className="flex items-center gap-1 text-[11px] font-sans font-bold text-[#fce59e] bg-black/40 px-2 py-0.5 rounded border border-[#d4af37]/30">
                    <Music className="w-3 h-3 text-[#d4af37]" />
                    <span>{route.eventsCount} salon{route.eventsCount > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
