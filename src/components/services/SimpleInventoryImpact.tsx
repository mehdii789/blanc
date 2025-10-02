import React from 'react';
import { Service, InventoryItem, OrderService } from '../../types';
import { calculateInventoryConsumption } from '../../utils/inventorySync';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface SimpleInventoryImpactProps {
  services: OrderService[] | { service: Service; quantity: number; }[];
  inventoryItems: InventoryItem[];
  className?: string;
}

export const SimpleInventoryImpact: React.FC<SimpleInventoryImpactProps> = ({
  services,
  inventoryItems,
  className = ''
}) => {
  // Normaliser les services
  const normalizedServices: OrderService[] = services.map(service => {
    if ('service' in service) {
      return { ...service.service, quantity: service.quantity };
    } else {
      return service;
    }
  });

  // Calculer l'impact
  const mockOrder = {
    id: 'temp',
    customerId: 'temp',
    services: normalizedServices,
    status: 'en_traitement' as const,
    totalAmount: 0,
    paid: false,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date()
  };

  const consumption = calculateInventoryConsumption(mockOrder);
  
  if (consumption.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-gray-500">
          Aucun produit nécessaire pour ces services
        </p>
      </div>
    );
  }

  const hasInsufficientStock = consumption.some(cons => {
    const item = inventoryItems.find(i => i.id === cons.itemId);
    return !item || item.quantity < cons.quantity;
  });

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">
          📦 Produits nécessaires
        </h4>
        {hasInsufficientStock ? (
          <div className="flex items-center text-red-600 text-sm">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            Stock insuffisant
          </div>
        ) : (
          <div className="flex items-center text-green-600 text-sm">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Stock OK
          </div>
        )}
      </div>

      {/* Liste des produits */}
      <div className="space-y-2">
        {consumption.map(cons => {
          const item = inventoryItems.find(i => i.id === cons.itemId);
          const available = item?.quantity || 0;
          const sufficient = available >= cons.quantity;
          
          return (
            <div
              key={cons.itemId}
              className={`flex items-center justify-between p-3 rounded-md ${
                sufficient ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${sufficient ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <span className="font-medium text-gray-900">
                    {item?.name || `Produit inconnu (ID: ${cons.itemId})`}
                  </span>
                  <div className="text-sm text-gray-600">
                    Besoin: {cons.quantity.toFixed(2)} {item?.unit || 'unités'}
                  </div>
                  {!item && (
                    <div className="text-xs text-red-500">
                      ⚠️ Produit non trouvé dans l'inventaire
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${sufficient ? 'text-green-700' : 'text-red-700'}`}>
                  {available.toFixed(2)} disponible
                </div>
                {!sufficient && (
                  <div className="text-xs text-red-600">
                    Manque: {(cons.quantity - available).toFixed(2)} {item?.unit}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message d'alerte */}
      {hasInsufficientStock && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Attention : Stock insuffisant
              </p>
              <p className="text-xs text-red-700 mt-1">
                Vous devez réapprovisionner certains produits avant de pouvoir traiter cette commande.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
