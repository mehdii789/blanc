import React, { useState, useEffect } from 'react';
import { Service, InventoryItem } from '../../types';
import { ServiceInventoryMapping } from '../../utils/inventorySync';
import { PlusIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { HelpTooltip } from '../common/HelpTooltip';
import { getCurrentMappings } from '../../utils/mappingStorage';

interface SimpleServiceConfigProps {
  services: Service[];
  inventoryItems: InventoryItem[];
  onUpdateMappings: (mappings: ServiceInventoryMapping[]) => void;
}

export const SimpleServiceConfig: React.FC<SimpleServiceConfigProps> = ({
  services,
  inventoryItems,
  onUpdateMappings
}) => {
  const [editingService, setEditingService] = useState<string | null>(null);
  const [currentMappings, setCurrentMappings] = useState<ServiceInventoryMapping[]>([]);

  // Charger les mappings au démarrage
  useEffect(() => {
    const mappings = getCurrentMappings();
    setCurrentMappings(mappings);
  }, []);

  // Obtenir le mapping pour un service donné
  const getServiceMapping = (serviceId: string) => {
    return currentMappings.find(mapping => mapping.serviceId === serviceId);
  };

  const handleAddProduct = (serviceId: string, itemId: string, quantity: number) => {
    const updatedMappings = currentMappings.map(mapping => {
      if (mapping.serviceId === serviceId) {
        const existingReq = mapping.inventoryRequirements.find(req => req.itemId === itemId);
        
        if (existingReq) {
          // Mettre à jour la quantité existante
          return {
            ...mapping,
            inventoryRequirements: mapping.inventoryRequirements.map(req =>
              req.itemId === itemId ? { ...req, quantityPerUnit: quantity } : req
            )
          };
        } else {
          // Ajouter nouveau produit
          return {
            ...mapping,
            inventoryRequirements: [
              ...mapping.inventoryRequirements,
              { itemId, quantityPerUnit: quantity }
            ]
          };
        }
      }
      return mapping;
    });
    
    setCurrentMappings(updatedMappings);
    onUpdateMappings(updatedMappings);
  };

  const handleRemoveProduct = (serviceId: string, itemId: string) => {
    const updatedMappings = currentMappings.map(mapping => {
      if (mapping.serviceId === serviceId) {
        return {
          ...mapping,
          inventoryRequirements: mapping.inventoryRequirements.filter(req => req.itemId !== itemId)
        };
      }
      return mapping;
    });
    
    setCurrentMappings(updatedMappings);
    onUpdateMappings(updatedMappings);
  };

  const isProductAssigned = (serviceId: string, itemId: string) => {
    const mapping = getServiceMapping(serviceId);
    return mapping?.inventoryRequirements.some(req => req.itemId === itemId) || false;
  };

  const getAssignedQuantity = (serviceId: string, itemId: string) => {
    const mapping = getServiceMapping(serviceId);
    const req = mapping?.inventoryRequirements.find(req => req.itemId === itemId);
    return req?.quantityPerUnit || 0.1;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">
            🔗 Lier Services et Produits
          </h3>
          <HelpTooltip
            title="Comment ça marche ?"
            content="Configurez quels produits d'inventaire sont consommés quand vous traitez chaque type de service."
            example="Lavage & Pliage de 10kg consomme 1L de lessive (0.1L par kg)"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Choisissez quels produits sont utilisés pour chaque service
        </p>
      </div>

      <div className="p-3 sm:p-4 space-y-6">
        {services.map(service => {
          const mapping = getServiceMapping(service.id);
          const isEditing = editingService === service.id;

          return (
            <div key={service.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col bg-white shadow-sm">
              {/* En-tête du service */}
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">{service.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mapping?.inventoryRequirements.length ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {mapping?.inventoryRequirements.length || 0} produit(s)
                  </div>
                  <button
                    onClick={() => setEditingService(isEditing ? null : service.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      isEditing 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition-colors`}
                  >
                    {isEditing ? '✓ Terminer' : 'Configurer'}
                  </button>
                </div>
              </div>

              {/* Produits assignés */}
              <div className="mb-3">
                {mapping?.inventoryRequirements.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {mapping.inventoryRequirements.map(req => {
                      const item = inventoryItems.find(i => i.id === req.itemId);
                      return (
                        <div key={req.itemId} className="bg-green-50 border border-green-200 rounded-lg p-2 flex flex-col">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-green-900 text-xs leading-tight truncate">{item?.name || 'Produit inconnu'}</div>
                            </div>
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveProduct(service.id, req.itemId)}
                                className="text-red-600 hover:text-red-800 p-0.5 flex-shrink-0 -mt-0.5"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-green-700 leading-tight">
                            {req.quantityPerUnit} {item?.unit || 'unités'} par {service.name.includes('kg') ? 'kg' : 'pièce'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-lg flex items-center justify-center border border-gray-200">
                    Aucun produit configuré pour ce service
                  </div>
                )}
              </div>

              {/* Interface d'édition */}
              {isEditing && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="text-xs font-semibold text-gray-700">
                      📦 Ajouter des produits
                    </h5>
                    <HelpTooltip
                      title="Quantité par unité"
                      content="Entrez la quantité de produit utilisée pour une unité de service (1kg, 1 pièce, etc.)"
                      example="0.1 signifie 0.1L de lessive par kg de linge"
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {inventoryItems.map(item => {
                      const isAssigned = isProductAssigned(service.id, item.id);
                      const currentQuantity = getAssignedQuantity(service.id, item.id);

                      return (
                        <div key={item.id} className={`border rounded-lg p-2 flex items-center gap-2 ${
                          isAssigned ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                        } transition-colors`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900 text-xs leading-tight">{item.name}</div>
                              {isAssigned && (
                                <div className="text-green-600 flex-shrink-0">
                                  <CheckIcon className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">Stock: {item.quantity} {item.unit}</div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={isAssigned ? currentQuantity : 0.1}
                              onChange={(e) => {
                                const quantity = parseFloat(e.target.value) || 0.1;
                                if (quantity > 0) {
                                  handleAddProduct(service.id, item.id, quantity);
                                }
                              }}
                              className="w-16 px-1.5 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0.1"
                            />
                            <span className="text-xs text-gray-500 w-8">{item.unit}</span>
                            {!isAssigned && (
                              <button
                                onClick={() => handleAddProduct(service.id, item.id, 0.1)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                              >
                                + Ajouter
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
