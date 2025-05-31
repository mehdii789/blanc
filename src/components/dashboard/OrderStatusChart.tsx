import React from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';

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

export const OrderStatusChart: React.FC = () => {
  const { orders } = useApp();
  
  // Initialiser un objet avec tous les statuts à 0
  const statusCounts = STATUS_CONFIG.reduce((acc, { value }) => {
    acc[value] = 0;
    return acc;
  }, {} as Record<OrderStatus, number>);
  
  // Compter les occurrences de chaque statut
  orders.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });
  
  const totalOrders = orders.length;
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">État des commandes</h3>
      
      <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden mb-6">
        {STATUS_CONFIG.map(({ value, color }) => {
          const count = statusCounts[value] || 0;
          const percentage = totalOrders ? (count / totalOrders) * 100 : 0;
          
          return percentage > 0 ? (
            <div 
              key={value}
              className="h-full float-left"
              style={{ 
                width: `${percentage}%`, 
                backgroundColor: color
              }} 
            />
          ) : null;
        })}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
        {STATUS_CONFIG.map(({ label, value, color }) => {
          const count = statusCounts[value] || 0;
          const percentage = totalOrders ? Math.round((count / totalOrders) * 100) : 0;
          
          return (
            <div key={value} className="flex flex-col p-2 bg-white border border-gray-100 rounded-lg shadow-sm h-full w-full">
              <div className="flex items-center gap-2 mb-1.5">
                <span 
                  className="flex-shrink-0 w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-gray-700 truncate flex-1">{label}</span>
              </div>
              <div className="w-full text-center">
                <span className="text-xs font-semibold text-gray-900 px-2 py-1 bg-gray-50 rounded-md inline-block w-full">
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