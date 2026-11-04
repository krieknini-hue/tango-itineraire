import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <div className="bg-[#122a1f] border-b border-emerald-500/50 text-emerald-200 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 transition-all">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span className="font-medium">Connexion rétablie — Données synchronisées avec les salons.</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="bg-[#2a1410] border-b border-[#d4af37]/50 text-[#fce59e] text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
      <span className="font-medium">
        Mode Hors-ligne — Vos trajets et milongas enregistrés restent consultables sans réseau au volant.
      </span>
    </div>
  );
};
