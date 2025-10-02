import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface RefreshIndicatorProps {
  isRefreshing?: boolean;
  lastRefresh?: Date;
  interval?: number; // en millisecondes
  className?: string;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  isRefreshing = false,
  lastRefresh,
  interval = 30000,
  className = ''
}) => {
  const [timeUntilNext, setTimeUntilNext] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Mettre à jour le temps jusqu'au prochain rafraîchissement
  useEffect(() => {
    if (!lastRefresh) return;

    const updateTimer = () => {
      const now = Date.now();
      const nextRefresh = lastRefresh.getTime() + interval;
      const remaining = Math.max(0, nextRefresh - now);
      setTimeUntilNext(remaining);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [lastRefresh, interval]);

  // Surveiller le statut de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Indicateur de connexion */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>

      {/* Indicateur de rafraîchissement */}
      <div className="flex items-center gap-1">
        <RefreshCw 
          className={`w-4 h-4 ${
            isRefreshing 
              ? 'animate-spin text-blue-500' 
              : 'text-gray-400'
          }`} 
        />
        <span className="text-xs text-gray-600">
          {isRefreshing ? (
            'Actualisation...'
          ) : timeUntilNext > 0 ? (
            `Prochaine: ${formatTime(timeUntilNext)}`
          ) : lastRefresh ? (
            `Mis à jour: ${lastRefresh.toLocaleTimeString()}`
          ) : (
            'En attente...'
          )}
        </span>
      </div>
    </div>
  );
};
