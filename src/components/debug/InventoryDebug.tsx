import React from 'react';
import { Service, InventoryItem } from '../../types';
import { serviceInventoryMappings } from '../../utils/inventorySync';

interface InventoryDebugProps {
  services: { service: Service; quantity: number; }[];
  inventoryItems: InventoryItem[];
}

export const InventoryDebug: React.FC<InventoryDebugProps> = ({
  services,
  inventoryItems
}) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h4 className="font-medium text-yellow-800 mb-3">🔍 Diagnostic Inventaire</h4>
      
      <div className="space-y-4 text-sm">
        <div>
          <strong>Services sélectionnés:</strong>
          <ul className="mt-1 space-y-1">
            {services.map(({ service, quantity }) => (
              <li key={service.id} className="text-yellow-700">
                • {service.name} (ID: {service.id}) - Quantité: {quantity}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <strong>Mappings configurés:</strong>
          <ul className="mt-1 space-y-1">
            {serviceInventoryMappings.map(mapping => (
              <li key={mapping.serviceId} className="text-yellow-700">
                • Service ID {mapping.serviceId} ({mapping.serviceName}):
                <ul className="ml-4 mt-1">
                  {mapping.inventoryRequirements.map(req => (
                    <li key={req.itemId} className="text-yellow-600">
                      - Item ID {req.itemId}: {req.quantityPerUnit} unités
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <strong>Produits d'inventaire disponibles:</strong>
          <ul className="mt-1 space-y-1">
            {inventoryItems.map(item => (
              <li key={item.id} className="text-yellow-700">
                • ID {item.id}: {item.name} ({item.quantity} {item.unit})
              </li>
            ))}
          </ul>
        </div>

        <div>
          <strong>Vérification des correspondances:</strong>
          <ul className="mt-1 space-y-1">
            {services.map(({ service }) => {
              const mapping = serviceInventoryMappings.find(m => m.serviceId === service.id);
              if (!mapping) {
                return (
                  <li key={service.id} className="text-red-600">
                    ❌ Service {service.name} (ID: {service.id}) - Aucun mapping trouvé
                  </li>
                );
              }
              
              return (
                <li key={service.id} className="text-green-600">
                  ✅ Service {service.name} (ID: {service.id}) - Mapping trouvé
                  <ul className="ml-4 mt-1">
                    {mapping.inventoryRequirements.map(req => {
                      const item = inventoryItems.find(i => i.id === req.itemId);
                      return (
                        <li key={req.itemId} className={item ? "text-green-600" : "text-red-600"}>
                          {item ? "✅" : "❌"} Item ID {req.itemId}: {item?.name || "NON TROUVÉ"}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
