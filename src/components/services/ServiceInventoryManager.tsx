import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Service, InventoryItem } from '../../types';
import { serviceInventoryMappings, ServiceInventoryMapping } from '../../utils/inventorySync';

interface ServiceInventoryManagerProps {
  services: Service[];
  inventoryItems: InventoryItem[];
  onUpdateMappings: (mappings: ServiceInventoryMapping[]) => void;
}

export const ServiceInventoryManager: React.FC<ServiceInventoryManagerProps> = ({
  services,
  inventoryItems,
  onUpdateMappings
}) => {
  const [mappings, setMappings] = useState<ServiceInventoryMapping[]>(serviceInventoryMappings);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [newRequirement, setNewRequirement] = useState<{
    serviceId: string;
    itemId: string;
    quantityPerUnit: number;
  } | null>(null);

  const handleAddRequirement = (serviceId: string) => {
    setNewRequirement({
      serviceId,
      itemId: inventoryItems[0]?.id || '',
      quantityPerUnit: 0.1
    });
  };

  const handleSaveRequirement = () => {
    if (!newRequirement) return;

    const updatedMappings = mappings.map(mapping => {
      if (mapping.serviceId === newRequirement.serviceId) {
        return {
          ...mapping,
          inventoryRequirements: [
            ...mapping.inventoryRequirements,
            {
              itemId: newRequirement.itemId,
              quantityPerUnit: newRequirement.quantityPerUnit
            }
          ]
        };
      }
      return mapping;
    });

    setMappings(updatedMappings);
    onUpdateMappings(updatedMappings);
    setNewRequirement(null);
  };

  const handleRemoveRequirement = (serviceId: string, itemId: string) => {
    const updatedMappings = mappings.map(mapping => {
      if (mapping.serviceId === serviceId) {
        return {
          ...mapping,
          inventoryRequirements: mapping.inventoryRequirements.filter(req => req.itemId !== itemId)
        };
      }
      return mapping;
    });

    setMappings(updatedMappings);
    onUpdateMappings(updatedMappings);
  };

  const handleUpdateQuantity = (serviceId: string, itemId: string, newQuantity: number) => {
    const updatedMappings = mappings.map(mapping => {
      if (mapping.serviceId === serviceId) {
        return {
          ...mapping,
          inventoryRequirements: mapping.inventoryRequirements.map(req => 
            req.itemId === itemId 
              ? { ...req, quantityPerUnit: newQuantity }
              : req
          )
        };
      }
      return mapping;
    });

    setMappings(updatedMappings);
    onUpdateMappings(updatedMappings);
  };

  const getInventoryItemName = (itemId: string) => {
    return inventoryItems.find(item => item.id === itemId)?.name || 'Article inconnu';
  };

  const getInventoryItemUnit = (itemId: string) => {
    return inventoryItems.find(item => item.id === itemId)?.unit || 'unité';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Configuration Service → Inventaire
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Configurez quels produits d'inventaire sont consommés par chaque service
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {services.map(service => {
            const mapping = mappings.find(m => m.serviceId === service.id);
            const isEditing = editingService === service.id;

            return (
              <div key={service.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                  <button
                    onClick={() => setEditingService(isEditing ? null : service.id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    {isEditing ? 'Terminer' : 'Modifier'}
                  </button>
                </div>

                {mapping && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Produits consommés :</h5>
                    
                    {mapping.inventoryRequirements.map(req => (
                      <div key={req.itemId} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            {getInventoryItemName(req.itemId)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {req.quantityPerUnit} {getInventoryItemUnit(req.itemId)} par {service.description.includes('kilo') ? 'kg' : 'pièce'}
                          </span>
                        </div>
                        
                        {isEditing && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={req.quantityPerUnit}
                              onChange={(e) => handleUpdateQuantity(service.id, req.itemId, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                            <button
                              onClick={() => handleRemoveRequirement(service.id, req.itemId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <div className="mt-4">
                        {newRequirement?.serviceId === service.id ? (
                          <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-md">
                            <select
                              value={newRequirement.itemId}
                              onChange={(e) => setNewRequirement({ ...newRequirement, itemId: e.target.value })}
                              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md"
                            >
                              {inventoryItems.map(item => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.unit})
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={newRequirement.quantityPerUnit}
                              onChange={(e) => setNewRequirement({ 
                                ...newRequirement, 
                                quantityPerUnit: parseFloat(e.target.value) || 0 
                              })}
                              placeholder="Quantité"
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md"
                            />
                            <button
                              onClick={handleSaveRequirement}
                              className="text-green-600 hover:text-green-800"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setNewRequirement(null)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddRequirement(service.id)}
                            className="inline-flex items-center px-3 py-1 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Ajouter un produit
                          </button>
                        )}
                      </div>
                    )}

                    {mapping.inventoryRequirements.length === 0 && (
                      <div className="text-sm text-gray-500 italic">
                        Aucun produit d'inventaire assigné à ce service
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Comment ça fonctionne</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Chaque service peut consommer plusieurs produits d'inventaire</li>
          <li>• La quantité est calculée automatiquement selon les unités du service</li>
          <li>• L'inventaire est consommé quand une commande passe en traitement</li>
          <li>• Des alertes apparaissent si l'inventaire est insuffisant</li>
        </ul>
      </div>
    </div>
  );
};
