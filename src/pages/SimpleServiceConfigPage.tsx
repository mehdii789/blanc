import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { SimpleServiceConfig } from '../components/services/SimpleServiceConfig';
import { ServiceInventoryMapping } from '../utils/inventorySync';
import { 
  ArrowLeftIcon, 
  CogIcon, 
  SparklesIcon,
  ChartBarIcon,
  CubeIcon,
  LinkIcon,
  LightBulbIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { SuccessMessage } from '../components/common/SuccessMessage';
import { saveMappings, resetToDefaultMappings } from '../utils/mappingStorage';

export const SimpleServiceConfigPage: React.FC = () => {
  const { services, inventoryItems } = useApp();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdateMappings = (mappings: ServiceInventoryMapping[]) => {
    saveMappings(mappings);
    console.log('✅ Configuration sauvegardée:', mappings);
    setShowSuccess(true);
  };

  const handleResetMappings = () => {
    resetToDefaultMappings();
    setShowSuccess(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-x-hidden">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Tableau de bord</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <CogIcon className="h-4 w-4" />
                <span>Configuration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mb-4">
            <LinkIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Services & Produits
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6 px-2">
            Configurez les liens entre services et produits pour un suivi automatique
          </p>
          
          <button
            onClick={handleResetMappings}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Charger les exemples
          </button>
        </div>

        {/* Message de succès */}
        <SuccessMessage
          message="Les mappings ont été mis à jour avec succès"
          show={showSuccess}
          onHide={() => setShowSuccess(false)}
        />

        {/* Statistiques avec design moderne */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 w-full">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <CogIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Services</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{services.length}</p>
              <p className="text-xs text-gray-600">Disponibles</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 w-full">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <CubeIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Produits</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{inventoryItems.length}</p>
              <p className="text-xs text-gray-600">En stock</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 w-full">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Mappings</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">∞</p>
              <p className="text-xs text-gray-600">Illimités</p>
            </div>
          </div>
        </div>

        {/* Configuration principale avec container responsive */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6 w-full max-w-7xl mx-auto">
          <div className="px-3 sm:px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <CogIcon className="h-5 w-5 mr-2 text-blue-600" />
              Configuration des Services
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Définissez quels produits sont consommés pour chaque service
            </p>
          </div>
          
          <div className="p-3 sm:p-4">
            <SimpleServiceConfig
              services={services}
              inventoryItems={inventoryItems}
              onUpdateMappings={handleUpdateMappings}
            />
          </div>
        </div>

        {/* Section conseils avec design amélioré */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 w-full max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200 shadow-md">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <LightBulbIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-blue-900 ml-2">
                Comment ça fonctionne
              </h3>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Configurez une fois les liens entre services et produits. 
              Le système calculera automatiquement les consommations.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200 shadow-md">
            <div className="flex items-center mb-2">
              <div className="p-2 bg-green-500 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-green-900 ml-2">
                Avantages
              </h3>
            </div>
            <p className="text-xs text-green-800 leading-relaxed">
              Suivi automatique des stocks, alertes intelligentes et calcul précis des coûts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
