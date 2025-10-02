import React from 'react';
import { Service, InventoryItem, OrderService } from '../../types';
import { calculateInventoryConsumption, serviceInventoryMappings } from '../../utils/inventorySync';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ServiceInventoryImpactProps {
  services: OrderService[] | { service: Service; quantity: number; }[];
  inventoryItems: InventoryItem[];
  className?: string;
}

export const ServiceInventoryImpact: React.FC<ServiceInventoryImpactProps> = ({
  services,
  inventoryItems,
  className = ''
}) => {
  // Normaliser les services pour avoir le bon format
  const normalizedServices: OrderService[] = services.map(service => {
    if ('service' in service) {
      // Format { service: Service; quantity: number; }
      return {
        ...service.service,
        quantity: service.quantity
      };
    } else {
      // Format OrderService
      return service;
    }
  });

  // Créer un ordre fictif pour calculer l'impact
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
  
  const getInventoryItemName = (itemId: string) => {
    return inventoryItems.find(item => item.id === itemId)?.name || 'Article inconnu';
  };

  const getInventoryItemUnit = (itemId: string) => {
    return inventoryItems.find(item => item.id === itemId)?.unit || 'unité';
  };

  const getAvailableQuantity = (itemId: string) => {
    return inventoryItems.find(item => item.id === itemId)?.quantity || 0;
  };

  const isStockSufficient = (itemId: string, requiredQuantity: number) => {
    const available = getAvailableQuantity(itemId);
    return available >= requiredQuantity;
  };

  if (consumption.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <p className="text-sm text-gray-500 text-center">
          Aucun impact sur l'inventaire
        </p>
      </div>
    );
  }

  const hasInsufficientStock = consumption.some(cons => !isStockSufficient(cons.itemId, cons.quantity));

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">
          Impact sur l'inventaire
        </h4>
        {hasInsufficientStock ? (
          <div className="flex items-center text-red-600">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Stock insuffisant</span>
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Stock suffisant</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {consumption.map(cons => {
          const available = getAvailableQuantity(cons.itemId);
          const sufficient = isStockSufficient(cons.itemId, cons.quantity);
          
          return (
            <div
              key={cons.itemId}
              className={`flex items-center justify-between p-2 rounded-md text-sm ${
                sufficient ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {getInventoryItemName(cons.itemId)}
                </span>
                <span className="text-gray-500">
                  ({cons.quantity.toFixed(2)} {getInventoryItemUnit(cons.itemId)})
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${sufficient ? 'text-green-700' : 'text-red-700'}`}>
                  {available.toFixed(2)} disponible
                </span>
                {!sufficient && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasInsufficientStock && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-700">
            ⚠️ Certains produits sont en stock insuffisant. La commande ne pourra pas être traitée.
          </p>
        </div>
      )}
    </div>
  );
};
