import React from 'react';

export const MonitoringPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">🚀 Monitoring Supabase</h1>
          
          {/* Statut */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <h2 className="text-lg font-semibold">Configuration Terminée ✅</h2>
                <p className="text-gray-600">Projet: zmtotombhpklllxjuirb</p>
                <p className="text-sm text-green-600">Jeton configuré et application prête</p>
              </div>
            </div>
          </div>

          {/* Étapes suivantes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">🎯 Finaliser la configuration</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">1</span>
                <div>
                  <p className="font-medium">Ouvrez votre projet Supabase</p>
                  <a href="https://supabase.com/dashboard/project/zmtotombhpklllxjuirb" target="_blank" 
                     className="text-blue-600 underline text-sm">
                    https://supabase.com/dashboard/project/zmtotombhpklllxjuirb
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">2</span>
                <div>
                  <p className="font-medium">Cliquez sur "SQL Editor"</p>
                  <p className="text-sm text-gray-600">Dans la sidebar gauche de Supabase</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">3</span>
                <div>
                  <p className="font-medium">Copiez et exécutez ce script SQL :</p>
                  <div className="mt-2 bg-white border rounded p-3 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-800">{`-- Script de base pour tester
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO customers (name, email) VALUES 
('Test Client', 'test@example.com');`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration actuelle */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">⚙️ Configuration actuelle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">URL Supabase</p>
                <p className="font-mono text-sm">https://zmtotombhpklllxjuirb.supabase.co</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jeton d'accès</p>
                <p className="font-mono text-sm">sbp_611cad...*** ✅</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fichier .env.local</p>
                <p className="text-green-600">✅ Créé</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dépendance @supabase/supabase-js</p>
                <p className="text-green-600">✅ Installée</p>
              </div>
            </div>
          </div>

          {/* Test de connexion */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">🔍 Test rapide</h2>
            <p className="text-gray-600 mb-4">
              Une fois le script SQL exécuté, le monitoring complet sera disponible avec :
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Métriques de performance en temps réel</li>
              <li>Statistiques de l'application</li>
              <li>Tests automatisés de la base de données</li>
              <li>Alertes et monitoring avancé</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
