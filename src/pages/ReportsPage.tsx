import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

export const ReportsPage: React.FC = () => {
  const { orders, services } = useApp();
  
  // Calculer le chiffre d'affaires par type de service
  const revenueByService = services.map(service => {
    const serviceOrders = orders.filter(order => 
      order.services.some(s => s.id === service.id)
    );
    
    const revenue = serviceOrders.reduce((sum, order) => {
      // Estimate the portion of the order that comes from this service
      const serviceCount = order.services.filter(s => s.id === service.id).length;
      const totalServices = order.services.length;
      const portion = serviceCount / totalServices;
      
      return sum + (order.totalAmount * portion);
    }, 0);
    
    return {
      serviceName: service.name,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);
  
  // Calculer les commandes par statut
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculer le pourcentage de commandes payées et impayées
  const paidOrders = orders.filter(order => order.paid).length;
  const unpaidOrders = orders.length - paidOrders;
  const paidPercentage = orders.length ? Math.round((paidOrders / orders.length) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Chiffre d'affaires par service</h2>
        
        <div className="space-y-4">
          {revenueByService.map(({ serviceName, revenue }) => (
            <div key={serviceName} className="flex items-center">
              <div className="w-40 text-sm font-medium text-gray-700">{serviceName}</div>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ 
                    width: `${Math.min(100, (revenue / (revenueByService[0]?.revenue || 1)) * 100)}%` 
                  }} 
                />
              </div>
              <div className="w-24 text-right font-medium text-gray-900 ml-4">
                {formatCurrency(revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Répartition des statuts de commande</h2>
          
          <div className="space-y-4">
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-700">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600" 
                    style={{ 
                      width: `${(count / orders.length) * 100}%` 
                    }} 
                  />
                </div>
                <div className="w-16 text-right font-medium text-gray-900 ml-4">
                  {count} ({Math.round((count / orders.length) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Statut des paiements</h2>
          
          <div className="h-48 flex items-center justify-center">
            <div className="relative w-36 h-36">
              {/* Paid orders (green) */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#10B981 0% ${paidPercentage}%, #EF4444 ${paidPercentage}% 100%)`
                }}
              />
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{paidPercentage}%</div>
                  <div className="text-xs text-gray-500">Payé</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-700">Payé ({paidOrders})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-sm text-gray-700">Impayé ({unpaidOrders})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};