import React from 'react';
import { AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { Service, InventoryItem } from '../../types';
import { calculateInventoryConsumption, serviceInventoryMappings } from '../../utils/inventorySync';

interface InventoryImpactDisplayProps {
  services: { service: Service; quantity: number }[];
  inventoryItems: InventoryItem[];
}

export const InventoryImpactDisplay: React.FC<InventoryImpactDisplayProps> = ({
  services,
  inventoryItems
}) => {
  // Créer une commande temporaire pour calculer l'impact
  const tempOrder = {
    id: 'temp',
    customerId: 'temp',
    services: services.map(item => ({ ...item.service, quantity: item.quantity })),
    items: [],
    status: 'en_traitement' as const,
    totalAmount: 0,
    paid: false,
    paymentMethod: 'cash' as const,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: new Date()
  };

  const consumption = calculateInventoryConsumption(tempOrder);
  
  if (consumption.length === 0) {
    return null;
  }

  const impacts = consumption.map(cons => {
    const inventoryItem = inventoryItems.find(item => item.id === cons.itemId);
    const remaining = inventoryItem ? inventoryItem.quantity - cons.quantity : 0;
    const isInsufficient = remaining < 0;
    const isLowStock = remaining <= (inventoryItem?.reorderLevel || 0) && remaining > 0;

    return {
      itemName: inventoryItem?.name || 'Article inconnu',
      unit: inventoryItem?.unit || '',
      currentStock: inventoryItem?.quantity || 0,
      consumption: cons.quantity,
      remaining: Math.max(0, remaining),
      isInsufficient,
      isLowStock,
      reorderLevel: inventoryItem?.reorderLevel || 0
    };
  });

  const hasInsufficientStock = impacts.some(impact => impact.isInsufficient);
  const hasLowStock = impacts.some(impact => impact.isLowStock);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Package size={18} className="text-gray-600" />
        <h4 className="font-medium text-gray-800">Impact sur l'inventaire</h4>
      </div>
      
      <div className="space-y-2">
        {impacts.map((impact, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-3 rounded-md ${
              impact.isInsufficient 
                ? 'bg-red-100 border border-red-200' 
                : impact.isLowStock 
                ? 'bg-amber-100 border border-amber-200'
                : 'bg-green-100 border border-green-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {impact.isInsufficient ? (
                <AlertTriangle size={16} className="text-red-600" />
              ) : impact.isLowStock ? (
                <AlertTriangle size={16} className="text-amber-600" />
              ) : (
                <CheckCircle size={16} className="text-green-600" />
              )}
              <span className="font-medium text-gray-900">{impact.itemName}</span>
            </div>
            
            <div className="text-right">
              <div className="text-sm">
                <span className="text-gray-600">Stock actuel: </span>
                <span className="font-medium">{impact.currentStock} {impact.unit}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Consommation: </span>
                <span className="font-medium text-red-600">-{impact.consumption.toFixed(1)} {impact.unit}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Restant: </span>
                <span className={`font-medium ${
                  impact.isInsufficient 
                    ? 'text-red-600' 
                    : impact.isLowStock 
                    ? 'text-amber-600'
                    : 'text-green-600'
                }`}>
                  {impact.remaining.toFixed(1)} {impact.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasInsufficientStock && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-red-800 font-medium">Stock insuffisant</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Certains articles n'ont pas assez de stock pour cette commande. 
            Veuillez réduire les quantités ou réapprovisionner l'inventaire.
          </p>
        </div>
      )}

      {hasLowStock && !hasInsufficientStock && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-amber-800 font-medium">Attention - Stock faible</span>
          </div>
          <p className="text-amber-700 text-sm mt-1">
            Cette commande laissera certains articles avec un stock faible. 
            Pensez à réapprovisionner prochainement.
          </p>
        </div>
      )}
    </div>
  );
};
