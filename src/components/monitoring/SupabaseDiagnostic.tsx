import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabaseTestService, SupabaseTestResult } from '../../services/supabaseTest';

export const SupabaseDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      console.log('🚀 Lancement du diagnostic Supabase...');
      const result = await supabaseTestService.runFullTest();
      setTestResult(result);
      setLastRun(new Date());
      console.log('📊 Diagnostic terminé:', result);
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getTableStatusIcon = (status: { accessible: boolean; count: number; error?: string }) => {
    if (!status.accessible) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (status.count === 0) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getTableStatusColor = (status: { accessible: boolean; count: number; error?: string }) => {
    if (!status.accessible) return 'bg-red-50 border-red-200';
    if (status.count === 0) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Diagnostic Supabase</h3>
          <p className="text-sm text-gray-600">
            Vérification complète de la connectivité et des données
          </p>
        </div>
        <button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isRunning ? 'Test en cours...' : 'Lancer le diagnostic'}
        </button>
      </div>

      {lastRun && (
        <div className="mb-4 text-sm text-gray-600">
          Dernier test: {lastRun.toLocaleString()}
        </div>
      )}

      {testResult && (
        <div className="space-y-4">
          {/* Statut général */}
          <div className={`p-4 rounded-lg border ${
            testResult.isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {testResult.isConnected ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${
                testResult.isConnected ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.isConnected ? 'Connexion établie' : 'Connexion échouée'}
              </span>
            </div>
            {testResult.isConnected && (
              <p className="text-sm text-green-700 mt-1">
                Total: {testResult.totalRows} lignes dans la base de données
              </p>
            )}
          </div>

          {/* Erreurs générales */}
          {testResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Erreurs détectées:</h4>
              <ul className="space-y-1">
                {testResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Statut des tables */}
          <div>
            <h4 className="font-medium mb-3">Statut des tables:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(testResult.tablesStatus).map(([tableName, status]) => (
                <div
                  key={tableName}
                  className={`p-3 rounded-lg border ${getTableStatusColor(status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTableStatusIcon(status)}
                      <span className="text-sm font-medium capitalize">
                        {tableName.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      {status.accessible ? `${status.count} lignes` : 'Erreur'}
                    </span>
                  </div>
                  {status.error && (
                    <p className="text-xs text-red-600 mt-1">{status.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommandations */}
          {testResult.isConnected && testResult.totalRows === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Base de données vide</span>
              </div>
              <p className="text-sm text-yellow-700">
                Votre base de données Supabase est connectée mais ne contient aucune donnée. 
                Cela explique pourquoi le monitoring du stockage affiche 0.
              </p>
              <div className="mt-3">
                <p className="text-sm text-yellow-700 font-medium">Solutions:</p>
                <ul className="text-sm text-yellow-700 mt-1 ml-4">
                  <li>• Créez quelques clients, commandes ou employés dans l'application</li>
                  <li>• Importez des données existantes</li>
                  <li>• Vérifiez que l'application utilise bien Supabase (pas localStorage)</li>
                </ul>
              </div>
            </div>
          )}

          {!testResult.isConnected && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Problème de connexion</span>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Impossible de se connecter à Supabase. L'application utilise probablement localStorage.
              </p>
              <div className="mt-3">
                <p className="text-sm text-red-700 font-medium">Vérifications:</p>
                <ul className="text-sm text-red-700 mt-1 ml-4">
                  <li>• Vérifiez vos clés API dans .env.local</li>
                  <li>• Vérifiez que votre projet Supabase est actif</li>
                  <li>• Vérifiez les politiques RLS</li>
                  <li>• Consultez la console du navigateur pour plus de détails</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
