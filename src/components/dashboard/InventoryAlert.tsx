import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../context/DatabaseContext';

export const InventoryAlert: React.FC = () => {
  const { inventoryItems } = useDatabase();
  const navigate = useNavigate();
  
  const lowInventoryItems = inventoryItems.filter(
    item => item.quantity <= item.reorderLevel
  );
  
  if (lowInventoryItems.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">État du stock</h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-600 font-medium">Tous les articles sont à des niveaux suffisants</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">Alerte stock bas</h3>
        <button 
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex-shrink-0"
          onClick={() => navigate('/inventory')}
        >
          Gérer le stock
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 pr-1">
          {lowInventoryItems.slice(0, 6).map(item => {
            const percentage = Math.round((item.quantity / item.reorderLevel) * 100);
            const colorClass = percentage <= 30 
              ? 'bg-red-500' 
              : percentage <= 70 
                ? 'bg-yellow-500' 
                : 'bg-green-500';
            
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h4 className="font-medium text-gray-800 text-sm truncate flex-1">{item.name}</h4>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full ${colorClass} transition-all duration-300`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                
                <div className="text-xs text-red-600">
                  Seuil : {item.reorderLevel} {item.unit}
                </div>
              </div>
            );
          })}
        </div>
        
        {lowInventoryItems.length > 6 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => navigate('/inventory')}
              className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-md transition-colors"
            >
              Voir tous les {lowInventoryItems.length} articles en stock bas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};