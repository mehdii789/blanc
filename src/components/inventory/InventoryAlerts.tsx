import React from 'react';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InventoryAlerts: React.FC = () => {
  const { getLowStockItems, getOutOfStockItems } = useApp();
  
  const lowStockItems = getLowStockItems();
  const outOfStockItems = getOutOfStockItems();

  if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Ruptures de stock critiques */}
      {outOfStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="text-red-600 mr-2" size={20} />
            <h3 className="text-red-800 font-semibold">
              Rupture de stock critique ({outOfStockItems.length} article{outOfStockItems.length > 1 ? 's' : ''})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {outOfStockItems.map(item => (
              <div key={item.id} className="bg-white rounded-md p-3 border border-red-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-red-600 font-bold">0 {item.unit}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Seuil de réapprovisionnement : {item.reorderLevel} {item.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock faible */}
      {lowStockItems.filter(item => item.quantity > 0).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <TrendingDown className="text-amber-600 mr-2" size={20} />
            <h3 className="text-amber-800 font-semibold">
              Stock faible ({lowStockItems.filter(item => item.quantity > 0).length} article{lowStockItems.filter(item => item.quantity > 0).length > 1 ? 's' : ''})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.filter(item => item.quantity > 0).map(item => (
              <div key={item.id} className="bg-white rounded-md p-3 border border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-amber-600 font-bold">{item.quantity} {item.unit}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Seuil de réapprovisionnement : {item.reorderLevel} {item.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
