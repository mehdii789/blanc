import React from 'react';

export const MonitoringDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Démonstration Monitoring Supabase</h1>
              <p className="text-gray-600">Aperçu du tableau de bord de monitoring</p>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              🎯 Démo - Projet: zmtotombhpklllxjuirb
            </div>
          </div>

          {/* Statut de connexion */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <div>
                <h2 className="text-lg font-semibold">Statut de la connexion</h2>
                <p className="text-sm text-gray-600">Connecté à Supabase</p>
                <p className="text-xs text-green-600">✅ https://zmtotombhpklllxjuirb.supabase.co</p>
              </div>
            </div>
          </div>

          {/* Métriques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  📊
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requêtes totales</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  ✅
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taux de succès</p>
                  <p className="text-2xl font-bold text-green-600">99%</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  ⚡
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temps de réponse</p>
                  <p className="text-2xl font-bold text-yellow-600">145ms</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  ❌
                </div>
                <div>
                  <p className="text-sm text-gray-600">Erreurs</p>
                  <p className="text-2xl font-bold text-red-600">12</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques business */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📈 Statistiques de l'application</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">156</div>
                <div className="text-sm text-gray-500">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">423</div>
                <div className="text-sm text-gray-500">Commandes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">298</div>
                <div className="text-sm text-gray-500">Factures</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">15,420€</div>
                <div className="text-sm text-gray-500">Chiffre d'affaires</div>
              </div>
            </div>
          </div>

          {/* Barres de performance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">⚡ Indicateurs de performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Taux de succès</span>
                  <span>99%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-green-500 rounded-full" style={{width: '99%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Performance</span>
                  <span>145ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-green-500 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Rapport de test */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">📋 Rapport de Tests (Démo)</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`# Rapport de Test Supabase
Généré le: ${new Date().toLocaleString('fr-FR')}

## Métriques de Performance
- Requêtes totales: 1,247
- Taux de succès: 99%
- Temps de réponse moyen: 145ms
- Statut de connexion: connecté

## Statistiques de l'Application  
- Clients: 156
- Commandes: 423
- Factures: 298
- Chiffre d'affaires: 15,420.00€

## Recommandations
- ✅ Système fonctionnel, aucune action requise
- 🎯 Projet Supabase: zmtotombhpklllxjuirb
- 🚀 Prêt pour la production`}
              </pre>
            </div>
          </div>

          {/* Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              💡 <strong>Note:</strong> Ceci est une démonstration. Pour le monitoring réel, 
              configurez d'abord votre base de données Supabase puis allez sur 
              <span className="font-mono">/monitoring</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
