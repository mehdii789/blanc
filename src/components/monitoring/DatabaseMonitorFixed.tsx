import React, { useState, useEffect } from 'react';
import { monitor, DatabaseMetrics } from '../../config/supabase';
import { supabaseService } from '../../services/supabaseService';
import { supabaseTest } from '../../utils/testSupabase';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

interface DatabaseStats {
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalInvoices: number;
  paidInvoices: number;
  lowStockItems: number;
  totalRevenue: number;
}

export const DatabaseMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<DatabaseMetrics>(monitor.getMetrics());
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionTest, setConnectionTest] = useState<boolean | null>(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);

  // Rafraîchir les métriques toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(monitor.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Charger les statistiques au montage
  useEffect(() => {
    loadStats();
    testConnection();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const isConnected = await supabaseService.testConnection();
      setConnectionTest(isConnected);
    } catch (error) {
      setConnectionTest(false);
    }
  };

  const resetMetrics = () => {
    monitor.resetMetrics();
    setMetrics(monitor.getMetrics());
  };

  const runTests = async () => {
    setTestRunning(true);
    setTestResults(null);
    
    try {
      const success = await supabaseTest.runAllTests();
      const report = await supabaseTest.generateTestReport();
      setTestResults(report);
      
      if (success) {
        console.log('✅ Tests réussis');
      } else {
        console.log('❌ Certains tests ont échoué');
      }
    } catch (error) {
      console.error('Erreur lors des tests:', error);
      setTestResults('❌ Erreur lors de l\'exécution des tests');
    } finally {
      setTestRunning(false);
    }
  };

  const getConnectionStatusIcon = () => {
    if (connectionTest === null) {
      return <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-500" />;
    }
    
    switch (metrics.connectionStatus) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getConnectionStatusText = () => {
    if (connectionTest === null) return 'Test en cours...';
    
    switch (metrics.connectionStatus) {
      case 'connected':
        return 'Connecté';
      case 'error':
        return 'Erreur de connexion';
      default:
        return 'Déconnecté';
    }
  };

  const getSuccessRate = () => {
    if (metrics.totalQueries === 0) return 100;
    return Math.round((metrics.successfulQueries / metrics.totalQueries) * 100);
  };

  const formatResponseTime = (time: number) => {
    return `${Math.round(time)}ms`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoring Base de Données</h2>
          <p className="text-gray-600">Surveillance en temps réel de Supabase</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={testConnection}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <SignalIcon className="h-4 w-4 mr-2" />
            Tester la connexion
          </button>
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={runTests}
            disabled={testRunning}
            className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${testRunning ? 'animate-spin' : ''}`} />
            {testRunning ? 'Tests en cours...' : 'Lancer les tests'}
          </button>
          <button
            onClick={resetMetrics}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Statut de connexion */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            {getConnectionStatusIcon()}
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">Statut de la connexion</h3>
              <p className="text-sm text-gray-600">{getConnectionStatusText()}</p>
              {metrics.lastError && (
                <p className="text-sm text-red-600 mt-1">
                  Dernière erreur: {metrics.lastError}
                  {metrics.lastErrorTime && (
                    <span className="text-gray-500 ml-2">
                      ({metrics.lastErrorTime.toLocaleTimeString()})
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Requêtes totales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metrics.totalQueries}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Taux de succès
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {getSuccessRate()}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Temps de réponse moyen
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatResponseTime(metrics.averageResponseTime)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Requêtes échouées
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metrics.failedQueries}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques de l'application */}
      {stats && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Statistiques de l'application
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCustomers}</div>
                <div className="text-sm text-gray-500">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalOrders}</div>
                <div className="text-sm text-gray-500">Commandes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                <div className="text-sm text-gray-500">En attente</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.completedOrders}</div>
                <div className="text-sm text-gray-500">Terminées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.totalInvoices}</div>
                <div className="text-sm text-gray-500">Factures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.paidInvoices}</div>
                <div className="text-sm text-gray-500">Payées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
                <div className="text-sm text-gray-500">Stock faible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="text-sm text-gray-500">Chiffre d'affaires</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de performance */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Indicateurs de performance
          </h3>
          <div className="space-y-4">
            {/* Barre de taux de succès */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Taux de succès</span>
                <span>{getSuccessRate()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    getSuccessRate() >= 95 ? 'bg-green-500' :
                    getSuccessRate() >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${getSuccessRate()}%` }}
                ></div>
              </div>
            </div>

            {/* Indicateur de temps de réponse */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Temps de réponse</span>
                <span>{formatResponseTime(metrics.averageResponseTime)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.averageResponseTime <= 200 ? 'bg-green-500' :
                    metrics.averageResponseTime <= 500 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.max(10, 100 - (metrics.averageResponseTime / 10)))}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats des tests */}
      {testResults && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Rapport de Tests
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {testResults}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
