import React from 'react';
import { useApp } from '../../context/AppContext';

export const InventoryAlert: React.FC = () => {
  const { inventoryItems, setActiveView } = useApp();
  
  const lowInventoryItems = inventoryItems.filter(
    item => item.quantity <= item.reorderLevel
  );
  
  if (lowInventoryItems.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">État du stock</h3>
        <p className="text-green-600 font-medium">Tous les articles sont à des niveaux suffisants.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Alerte stock bas</h3>
        <button 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => setActiveView('inventory')}
        >
          Gérer le stock
        </button>
      </div>
      
      <div className="space-y-4">
        {lowInventoryItems.map(item => {
          const percentage = Math.round((item.quantity / item.reorderLevel) * 100);
          const colorClass = percentage <= 30 
            ? 'bg-red-500' 
            : percentage <= 70 
              ? 'bg-yellow-500' 
              : 'bg-green-500';
          
          return (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium text-gray-800">{item.name}</h4>
                <span className="text-sm text-gray-500">
                  {item.quantity} {item.unit} restants
                </span>
              </div>
              
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colorClass}`} 
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              <div className="mt-2 text-sm text-red-600">
                Niveau de réapprovisionnement : {item.reorderLevel} {item.unit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};