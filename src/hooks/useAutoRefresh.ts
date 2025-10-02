import { useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';

interface UseAutoRefreshOptions {
  interval?: number; // en millisecondes
  enabled?: boolean;
  onRefresh?: () => void;
}

export const useAutoRefresh = (options: UseAutoRefreshOptions = {}) => {
  const {
    interval = 30000, // 30 secondes par défaut
    enabled = true,
    onRefresh
  } = options;

  const { refreshData } = useDatabase();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const performRefresh = async () => {
      try {
        // Éviter les rafraîchissements trop fréquents
        const now = Date.now();
        if (now - lastRefreshRef.current < 5000) { // Minimum 5 secondes entre les rafraîchissements
          return;
        }

        lastRefreshRef.current = now;
        
        // Rafraîchir les données
        await refreshData();
        
        // Callback personnalisé
        if (onRefresh) {
          onRefresh();
        }

        console.log(`🔄 Auto-refresh effectué à ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement automatique:', error);
      }
    };

    // Premier rafraîchissement immédiat
    performRefresh();

    // Configurer l'intervalle
    intervalRef.current = setInterval(performRefresh, interval);

    // Rafraîchir quand la page devient visible
    const handleVisibilityChange = () => {
      if (!document.hidden && enabled) {
        performRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Nettoyage
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [interval, enabled, refreshData, onRefresh]);

  // Fonction pour forcer un rafraîchissement
  const forceRefresh = async () => {
    try {
      await refreshData();
      if (onRefresh) {
        onRefresh();
      }
      console.log('🔄 Rafraîchissement forcé effectué');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement forcé:', error);
    }
  };

  return {
    forceRefresh,
    lastRefresh: lastRefreshRef.current
  };
};
