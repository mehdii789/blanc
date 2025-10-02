import React from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

// Données de démonstration pour le monitoring
const demoMetrics = {
  totalQueries: 1247,
  successfulQueries: 1235,
  failedQueries: 12,
  averageResponseTime: 145,
  connectionStatus: 'connected' as const,
  lastError: null,
  lastErrorTime: null
};

const demoStats = {
  totalCustomers: 156,
  totalOrders: 423,
  pendingOrders: 23,
  completedOrders: 387,
  totalInvoices: 298,
  paidInvoices: 276,
  lowStockItems: 3,
  totalRevenue: 15420.50
};

export const MonitoringDemo: React.FC = () => {
  const getSuccessRate = () => {
    return Math.round((demoMetrics.successfulQueries / demoMetrics.totalQueries) * 100);
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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoring Base de Données</h2>
          <p className="text-gray-600">Surveillance en temps réel de Supabase</p>
          <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full inline-block">
            🎯 Projet ID: zmtotombhpklllxjuirb
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <SignalIcon className="h-4 w-4 mr-2" />
            Tester la connexion
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Lancer les tests
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Statut de connexion */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">Statut de la connexion</h3>
              <p className="text-sm text-gray-600">Connecté</p>
              <p className="text-xs text-green-600 mt-1">
                ✅ Connexion établie avec zmtotombhpklllxjuirb.supabase.co
              </p>
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
                    {demoMetrics.totalQueries.toLocaleString()}
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
                    {formatResponseTime(demoMetrics.averageResponseTime)}
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
                    {demoMetrics.failedQueries}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques de l'application */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Statistiques de l'application
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{demoStats.totalCustomers}</div>
              <div className="text-sm text-gray-500">Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{demoStats.totalOrders}</div>
              <div className="text-sm text-gray-500">Commandes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{demoStats.pendingOrders}</div>
              <div className="text-sm text-gray-500">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{demoStats.completedOrders}</div>
              <div className="text-sm text-gray-500">Terminées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{demoStats.totalInvoices}</div>
              <div className="text-sm text-gray-500">Factures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{demoStats.paidInvoices}</div>
              <div className="text-sm text-gray-500">Payées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{demoStats.lowStockItems}</div>
              <div className="text-sm text-gray-500">Stock faible</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(demoStats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-500">Chiffre d'affaires</div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs de performance */}
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
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${getSuccessRate()}%` }}
                ></div>
              </div>
            </div>

            {/* Indicateur de temps de réponse */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Temps de réponse</span>
                <span>{formatResponseTime(demoMetrics.averageResponseTime)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rapport de tests */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Rapport de Tests (Démo)
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{`# Rapport de Test Supabase
Généré le: ${new Date().toLocaleString('fr-FR')}

## Métriques de Performance
- Requêtes totales: ${demoMetrics.totalQueries.toLocaleString()}
- Taux de succès: ${getSuccessRate()}%
- Temps de réponse moyen: ${formatResponseTime(demoMetrics.averageResponseTime)}
- Statut de connexion: ${demoMetrics.connectionStatus}

## Statistiques de l'Application
- Clients: ${demoStats.totalCustomers}
- Commandes: ${demoStats.totalOrders}
- Commandes en attente: ${demoStats.pendingOrders}
- Commandes terminées: ${demoStats.completedOrders}
- Factures: ${demoStats.totalInvoices}
- Factures payées: ${demoStats.paidInvoices}
- Articles en stock faible: ${demoStats.lowStockItems}
- Chiffre d'affaires: ${formatCurrency(demoStats.totalRevenue)}

## Recommandations
- ✅ Système fonctionnel, aucune action requise
- 🎯 Projet Supabase: zmtotombhpklllxjuirb
- 🚀 Prêt pour la production`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
