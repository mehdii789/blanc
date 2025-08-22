import React from 'react';
import { OrderStatus } from '../../types';

interface OrderStatusChartProps {
  ordersByStatus: Record<OrderStatus, number>;
}

type StatusConfig = {
  label: string;
  value: OrderStatus;
  color: string;
};

// Définition des statuts et de leurs couleurs
const STATUS_CONFIG: StatusConfig[] = [
  { label: 'En attente', value: 'en_attente', color: '#3B82F6' },
  { label: 'En traitement', value: 'en_traitement', color: '#8B5CF6' },
  { label: 'Lavage', value: 'lavage', color: '#06B6D4' },
  { label: 'Séchage', value: 'sechage', color: '#14B8A6' },
  { label: 'Pliage', value: 'pliage', color: '#10B981' },
  { label: 'Prêt', value: 'pret', color: '#84CC16' },
  { label: 'Livré', value: 'livre', color: '#22C55E' },
  { label: 'Annulé', value: 'annule', color: '#EF4444' }
];

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ ordersByStatus }) => {
  // Calculer le nombre total de commandes
  const totalOrders = Object.values(ordersByStatus).reduce((sum, count) => sum + count, 0);
  
  if (totalOrders === 0) {
    return (
      <div className="w-full text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">Aucune commande pour cette période</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Barre de progression */}
      <div className="h-3 sm:h-4 w-full bg-gray-200 rounded-full overflow-hidden mb-8 sm:mb-12 flex-shrink-0">
        {STATUS_CONFIG.map(({ value, color }) => {
          const count = ordersByStatus[value] || 0;
          const percentage = totalOrders ? (count / totalOrders) * 100 : 0;
          
          return percentage > 0 ? (
            <div 
              key={value}
              className="h-full float-left transition-all duration-300"
              style={{ 
                width: `${percentage}%`, 
                backgroundColor: color
              }} 
            />
          ) : null;
        })}
      </div>
      
      {/* Légendes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full flex-1 content-start">
        {STATUS_CONFIG.map(({ label, value, color }) => {
          const count = ordersByStatus[value] || 0;
          const percentage = totalOrders ? Math.round((count / totalOrders) * 100) : 0;
          
          return (
            <div key={value} className="flex flex-col p-2 sm:p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors w-full">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <span 
                  className="flex-shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-gray-700 truncate flex-1">{label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-gray-900">{count}</span>
                <span className="text-xs font-medium text-gray-500 bg-white px-1.5 py-0.5 rounded">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};