import React, { useState } from 'react';
import { Service, InventoryItem } from '../../types';
import { ServiceInventoryImpact } from './ServiceInventoryImpact';
import { serviceInventoryMappings } from '../../utils/inventorySync';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface ServiceInventoryDemoProps {
  services: Service[];
  inventoryItems: InventoryItem[];
}

export const ServiceInventoryDemo: React.FC<ServiceInventoryDemoProps> = ({
  services,
  inventoryItems
}) => {
  const [selectedServices, setSelectedServices] = useState<{ service: Service; quantity: number; }[]>([]);

  const handleAddService = (service: Service) => {
    const existing = selectedServices.find(s => s.service.id === service.id);
    if (existing) {
      setSelectedServices(prev => 
        prev.map(s => 
          s.service.id === service.id 
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      );
    } else {
      setSelectedServices(prev => [...prev, { service, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (serviceId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedServices(prev => prev.filter(s => s.service.id !== serviceId));
    } else {
      setSelectedServices(prev => 
        prev.map(s => 
          s.service.id === serviceId 
            ? { ...s, quantity: newQuantity }
            : s
        )
      );
    }
  };

  const getServiceMapping = (serviceId: string) => {
    return serviceInventoryMappings.find(m => m.serviceId === serviceId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Simulateur d'Impact Inventaire
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Sélectionnez des services pour voir leur impact sur l'inventaire
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {services.map(service => {
              const mapping = getServiceMapping(service.id);
              const selectedService = selectedServices.find(s => s.service.id === service.id);
              
              return (
                <div
                  key={service.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedService ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      <p className="text-sm font-medium text-green-600 mt-1">
                        {service.price.toFixed(2)}€
                      </p>
                      
                      {mapping && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 font-medium">Consomme :</p>
                          <ul className="text-xs text-gray-500 mt-1 space-y-1">
                            {mapping.inventoryRequirements.map(req => {
                              const item = inventoryItems.find(i => i.id === req.itemId);
                              return (
                                <li key={req.itemId}>
                                  • {item?.name}: {req.quantityPerUnit} {item?.unit}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      {selectedService ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(service.id, selectedService.quantity - 1)}
                            className="p-1 rounded-full bg-white border border-gray-300 hover:bg-gray-50"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="font-medium text-blue-600 min-w-[2rem] text-center">
                            {selectedService.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(service.id, selectedService.quantity + 1)}
                            className="p-1 rounded-full bg-white border border-gray-300 hover:bg-gray-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddService(service)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Ajouter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedServices.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Services sélectionnés ({selectedServices.length})
              </h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {selectedServices.map(({ service, quantity }) => (
                    <div key={service.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div>
                        <span className="font-medium text-gray-900">{service.name}</span>
                        <span className="text-sm text-gray-500 ml-2">x{quantity}</span>
                      </div>
                      <span className="font-medium text-green-600">
                        {(service.price * quantity).toFixed(2)}€
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between font-bold">
                      <span>Total</span>
                      <span className="text-green-600">
                        {selectedServices.reduce((total, { service, quantity }) => 
                          total + (service.price * quantity), 0
                        ).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <ServiceInventoryImpact
                    services={selectedServices}
                    inventoryItems={inventoryItems}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedServices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Sélectionnez des services pour voir leur impact sur l'inventaire</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
