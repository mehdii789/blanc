import React, { useState, useEffect } from 'react';
import { HardDrive, Database, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { supabaseStorageService, StorageStats } from '../../services/supabaseStorage';

interface StorageMonitorProps {
  refreshInterval?: number; // en millisecondes
  showDetails?: boolean;
}

export const StorageMonitor: React.FC<StorageMonitorProps> = ({
  refreshInterval = 30000, // 30 secondes par défaut
  showDetails = true
}) => {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadStats = async () => {
    try {
      setError(null);
      const storageStats = await supabaseStorageService.getStorageStats();
      setStats(storageStats);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial et rafraîchissement automatique
  useEffect(() => {
    loadStats();

    const interval = setInterval(loadStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStorageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 bg-red-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStorageIcon = (percentage: number) => {
    if (percentage >= 80) return <AlertTriangle className="w-5 h-5" />;
    if (percentage >= 60) return <Info className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Chargement des statistiques de stockage...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Erreur de chargement</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={loadStats}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const recommendations = supabaseStorageService.getRecommendations(stats);

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble du stockage */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getStorageColor(stats.percentage)}`}>
              {getStorageIcon(stats.percentage)}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Stockage Supabase</h3>
              <p className="text-sm text-gray-600">
                Mis à jour: {lastUpdate?.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={loadStats}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Utilisation</span>
            <span>{stats.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                stats.percentage >= 80
                  ? 'bg-red-500'
                  : stats.percentage >= 60
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(stats.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Utilisé</p>
            <p className="text-lg font-bold text-blue-600">
              {supabaseStorageService.formatSize(stats.used)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Limite</p>
            <p className="text-lg font-bold text-gray-600">
              {supabaseStorageService.formatSize(stats.limit)}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Disponible</p>
            <p className="text-lg font-bold text-green-600">
              {supabaseStorageService.formatSize(stats.remaining)}
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Tables</p>
            <p className="text-lg font-bold text-purple-600">
              {stats.tables.length}
            </p>
          </div>
        </div>
      </div>

      {/* Détails par table */}
      {showDetails && stats.tables.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Utilisation par table
          </h4>
          <div className="space-y-3">
            {stats.tables.slice(0, 8).map((table) => (
              <div key={table.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize">
                      {table.name.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {table.rows} lignes
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(table.percentage, 2)}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium">
                    {supabaseStorageService.formatSize(table.size)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {table.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Recommandations
          </h4>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-yellow-700 text-sm">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
