import React, { useState, useEffect } from 'react';
import { monitor, DatabaseMetrics } from '../config/supabase';
import { supabaseService } from '../services/supabaseService';
import { StorageMonitor } from '../components/monitoring/StorageMonitor';
import { SupabaseDiagnostic } from '../components/monitoring/SupabaseDiagnostic';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { Activity, Database, Clock, AlertCircle, CheckCircle, TrendingUp, Server, Wifi, HardDrive } from 'lucide-react';

export const SupabaseMonitoringPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DatabaseMetrics>(monitor.getMetrics());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Mise à jour des métriques toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(monitor.getMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Test de connexion Supabase
  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      await supabaseService.getCustomers();
      setLastTestResult('✅ Connexion Supabase réussie !');
    } catch (error) {
      setLastTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Connexion échouée'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const data = await supabaseService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Rafraîchissement automatique spécifique à cette page
  useAutoRefresh({
    interval: 15000, // 15 secondes pour le monitoring
    enabled: true,
    onRefresh: () => {
      setMetrics(monitor.getMetrics());
      loadStats();
    }
  });

  const getConnectionStatusColor = () => {
    switch (metrics.connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (metrics.connectionStatus) {
      case 'connected': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                Monitoring Supabase
              </h1>
              <p className="text-gray-600 mt-1">Surveillance en temps réel de la base de données</p>
            </div>
            <button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              {isTestingConnection ? 'Test en cours...' : 'Tester la connexion'}
            </button>
          </div>

          {/* Résultat du test */}
          {lastTestResult && (
            <div className={`p-4 rounded-lg ${lastTestResult.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="font-medium">{lastTestResult}</p>
            </div>
          )}

          {/* Statut de connexion */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getConnectionStatusColor()}`}>
                  {getConnectionStatusIcon()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Statut de la connexion</h2>
                  <p className="text-gray-600 capitalize">{metrics.connectionStatus}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Projet Supabase</p>
                <p className="font-mono text-sm">zmtotombhpklllxjuirb</p>
              </div>
            </div>
          </div>

          {/* Métriques de performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Requêtes totales</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalQueries}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Succès</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.successfulQueries}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Erreurs</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.failedQueries}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Temps moyen</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.averageResponseTime)}ms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques de la base de données */}
          {stats && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Statistiques de la base de données
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</p>
                  <p className="text-sm text-gray-600">Clients</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.totalOrders}</p>
                  <p className="text-sm text-gray-600">Commandes</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                  <p className="text-sm text-gray-600">En attente</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{stats.totalInvoices}</p>
                  <p className="text-sm text-gray-600">Factures</p>
                </div>
              </div>
            </div>
          )}

          {/* Dernière erreur */}
          {metrics.lastError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Dernière erreur
              </h3>
              <p className="text-red-700 font-mono text-sm">{metrics.lastError}</p>
              {metrics.lastErrorTime && (
                <p className="text-red-600 text-sm mt-1">
                  {new Date(metrics.lastErrorTime).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Diagnostic Supabase */}
          <SupabaseDiagnostic />

          {/* Monitoring du stockage */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <HardDrive className="w-7 h-7 text-blue-600" />
              Stockage en Temps Réel
            </h2>
            <StorageMonitor refreshInterval={15000} showDetails={true} />
          </div>

          {/* Configuration */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-gray-600" />
              Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">URL Supabase</p>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {import.meta.env.VITE_SUPABASE_URL || 'https://zmtotombhpklllxjuirb.supabase.co'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mode</p>
                <p className="text-sm text-gray-900">
                  Hybride (Supabase + localStorage fallback)
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rafraîchissement</p>
                <p className="text-sm text-gray-900">
                  Automatique (15s monitoring, 30s global)
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <p className="text-sm text-gray-900">
                  Gratuit (500MB DB, 1GB Storage)
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Actions de monitoring</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => monitor.resetMetrics()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Réinitialiser les métriques
              </button>
              <button
                onClick={loadStats}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Actualiser les stats
              </button>
              <button
                onClick={() => window.open('https://supabase.com/dashboard/project/zmtotombhpklllxjuirb', '_blank')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Ouvrir Supabase Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
