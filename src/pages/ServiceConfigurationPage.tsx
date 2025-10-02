import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { ServiceInventoryManager } from '../components/services/ServiceInventoryManager';
import { ServiceInventoryDemo } from '../components/services/ServiceInventoryDemo';
import { ServiceInventoryMapping } from '../utils/inventorySync';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const ServiceConfigurationPage: React.FC = () => {
  const { services, inventoryItems } = useApp();
  const navigate = useNavigate();

  const handleUpdateMappings = (mappings: ServiceInventoryMapping[]) => {
    // Ici vous pourriez sauvegarder les mappings dans la base de données
    console.log('Nouveaux mappings:', mappings);
    // Pour l'instant, on affiche juste dans la console
    // Dans une vraie application, vous feriez un appel API pour sauvegarder
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Retour au tableau de bord
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Configuration des Services</h1>
            <p className="mt-2 text-gray-600">
              Gérez les liens entre vos services et votre inventaire
            </p>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{services.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Services actifs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {services.length} services
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
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{inventoryItems.length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Produits d'inventaire
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inventoryItems.length} produits
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
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {inventoryItems.filter(item => item.quantity <= item.reorderLevel).length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Stock faible
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inventoryItems.filter(item => item.quantity <= item.reorderLevel).length} alertes
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simulateur d'impact */}
        <ServiceInventoryDemo
          services={services}
          inventoryItems={inventoryItems}
        />

        {/* Gestionnaire de configuration */}
        <ServiceInventoryManager
          services={services}
          inventoryItems={inventoryItems}
          onUpdateMappings={handleUpdateMappings}
        />

        {/* Guide d'utilisation */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Guide d'utilisation
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">
                  🔧 Configuration des mappings
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Cliquez sur "Modifier" pour un service</li>
                  <li>• Ajoutez des produits avec "Ajouter un produit"</li>
                  <li>• Définissez la quantité consommée par unité</li>
                  <li>• Supprimez des produits avec l'icône poubelle</li>
                </ul>
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">
                  📊 Synchronisation automatique
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• L'inventaire se met à jour automatiquement</li>
                  <li>• Vérification avant création de commande</li>
                  <li>• Alertes en cas de stock insuffisant</li>
                  <li>• Restauration en cas d'annulation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
