import React, { useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { formatCurrency } from '../utils/formatters';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Package,
  BarChart3,
  PieChart
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { orders, services, customers } = useApp();
  
  // Calculer les KPIs
  const kpis = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const paidRevenue = orders.filter(order => order.paid).reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingRevenue = totalRevenue - paidRevenue;
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      averageOrderValue,
      totalOrders: orders.length,
      activeCustomers: customers.length
    };
  }, [orders, customers]);
  
  // Calculer le chiffre d'affaires par type de service
  const revenueByService = useMemo(() => {
    return services.map(service => {
      const serviceOrders = orders.filter(order => 
        order.services.some(s => s.id === service.id)
      );
      
      const revenue = serviceOrders.reduce((sum, order) => {
        const serviceCount = order.services.filter(s => s.id === service.id).length;
        const totalServices = order.services.length;
        const portion = serviceCount / totalServices;
        return sum + (order.totalAmount * portion);
      }, 0);
      
      const orderCount = serviceOrders.length;
      
      return {
        serviceName: service.name,
        revenue,
        orderCount,
        percentage: kpis.totalRevenue > 0 ? (revenue / kpis.totalRevenue) * 100 : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [services, orders, kpis.totalRevenue]);
  
  // Calculer les commandes par statut
  const ordersByStatus = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);
  
  // Calculer le pourcentage de commandes payées et impayées
  const paidOrders = orders.filter(order => order.paid).length;
  const unpaidOrders = orders.length - paidOrders;
  const paidPercentage = orders.length ? Math.round((paidOrders / orders.length) * 100) : 0;
  
  // Couleurs pour les statuts
  const statusColors: Record<string, string> = {
    'en_attente': 'bg-yellow-500',
    'en_traitement': 'bg-blue-500',
    'lavage': 'bg-cyan-500',
    'sechage': 'bg-purple-500',
    'pliage': 'bg-indigo-500',
    'pret': 'bg-green-500',
    'livre': 'bg-emerald-600',
    'annule': 'bg-red-500'
  };
  
  const statusLabels: Record<string, string> = {
    'en_attente': 'En attente',
    'en_traitement': 'En traitement',
    'lavage': 'Lavage',
    'sechage': 'Séchage',
    'pliage': 'Pliage',
    'pret': 'Prêt',
    'livre': 'Livré',
    'annule': 'Annulé'
  };
  
  return (
    <div className="space-y-3 sm:space-y-6 px-4 py-4 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-3 sm:mb-6">
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
          Rapports & Analyses
        </h1>
        <p className="text-xs sm:text-base text-gray-600">
          Vue d'ensemble des performances de votre activité
        </p>
      </div>
      
      {/* KPI Cards - Grid responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-4 w-full">
        {/* Total Revenue */}
        <div className="group bg-gradient-to-br from-blue-50/50 to-white border border-gray-200 p-3 sm:p-6 rounded-lg sm:rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col h-[120px] sm:h-auto w-full">
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="text-base sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              {formatCurrency(kpis.totalRevenue)}
            </div>
            <div className="text-[10px] sm:text-sm text-gray-500 font-medium leading-tight">Chiffre d'affaires total</div>
          </div>
        </div>
        
        {/* Paid Revenue */}
        <div className="group bg-gradient-to-br from-emerald-50/50 to-white border border-gray-200 p-3 sm:p-6 rounded-lg sm:rounded-xl hover:border-emerald-200 hover:shadow-md transition-all duration-300 flex flex-col h-[120px] sm:h-auto w-full">
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="text-base sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              {formatCurrency(kpis.paidRevenue)}
            </div>
            <div className="text-[10px] sm:text-sm text-gray-500 font-medium leading-tight">Montant encaissé</div>
          </div>
        </div>
        
        {/* Pending Revenue */}
        <div className="group bg-gradient-to-br from-amber-50/50 to-white border border-gray-200 p-3 sm:p-6 rounded-lg sm:rounded-xl hover:border-amber-200 hover:shadow-md transition-all duration-300 flex flex-col h-[120px] sm:h-auto w-full">
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2.5 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="text-base sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              {formatCurrency(kpis.pendingRevenue)}
            </div>
            <div className="text-[10px] sm:text-sm text-gray-500 font-medium leading-tight">
              <span className="hidden xl:inline">En attente</span>
              <span className="xl:hidden">En attente de paiement</span>
            </div>
          </div>
        </div>
        
        {/* Total Orders */}
        <div className="group bg-gradient-to-br from-violet-50/50 to-white border border-gray-200 p-3 sm:p-6 rounded-lg sm:rounded-xl hover:border-violet-200 hover:shadow-md transition-all duration-300 flex flex-col h-[120px] sm:h-auto w-full">
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2.5 bg-violet-50 rounded-lg group-hover:bg-violet-100 transition-colors">
              <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-violet-600" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="text-base sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              {kpis.totalOrders}
            </div>
            <div className="text-[10px] sm:text-sm text-gray-500 font-medium leading-tight">Commandes totales</div>
          </div>
        </div>
        
        {/* Average Order Value */}
        <div className="group bg-gradient-to-br from-indigo-50/50 to-white border border-gray-200 p-3 sm:p-6 rounded-lg sm:rounded-xl hover:border-indigo-200 hover:shadow-md transition-all duration-300 flex flex-col h-[120px] sm:h-auto w-full">
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="text-base sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              {formatCurrency(kpis.averageOrderValue)}
            </div>
            <div className="text-[10px] sm:text-sm text-gray-500 font-medium leading-tight">Panier moyen</div>
          </div>
        </div>
        
        {/* Active Customers */}
        <div className="group bg-gradient-to-br from-rose-50/50 to-white border border-gray-200 p-3 sm:p-6 rounded-lg sm:rounded-xl hover:border-rose-200 hover:shadow-md transition-all duration-300 flex flex-col h-[120px] sm:h-auto w-full">
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2.5 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-rose-600" />
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="text-base sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
              {kpis.activeCustomers}
            </div>
            <div className="text-[10px] sm:text-sm text-gray-500 font-medium leading-tight">Clients actifs</div>
          </div>
        </div>
      </div>
      
      {/* Revenue by Service */}
      <div className="bg-white border border-gray-100 p-3.5 sm:p-6 lg:p-8 rounded-lg sm:rounded-2xl shadow-sm w-full">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl">
            <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">
              Chiffre d'affaires par service
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Répartition des revenus par type de service</p>
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-5">
          {revenueByService.length > 0 ? revenueByService.map(({ serviceName, revenue, orderCount, percentage }) => (
            <div key={serviceName} className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 p-2.5 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 border border-transparent hover:border-blue-100">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div>
                    <div className="text-xs sm:text-base font-semibold text-gray-900">
                      {serviceName}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      {orderCount} commande{orderCount > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-xs sm:text-base">
                    {formatCurrency(revenue)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="relative h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out" 
                  style={{ 
                    width: `${percentage}%` 
                  }} 
                />
              </div>
            </div>
          )) : (
            <div className="text-center py-8 sm:py-16 text-gray-400">
              <Package className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-40" />
              <p className="text-xs sm:text-base font-medium">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Status & Payment Charts - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 w-full">
        {/* Order Status Distribution */}
        <div className="bg-white border border-gray-100 p-3.5 sm:p-6 lg:p-8 rounded-lg sm:rounded-2xl shadow-sm w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg sm:rounded-xl">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">
                Statuts des commandes
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Répartition par étape de traitement</p>
            </div>
          </div>
          
          <div className="space-y-2.5 sm:space-y-4">
            {Object.entries(ordersByStatus).length > 0 ? Object.entries(ordersByStatus).map(([status, count]) => {
              const percentage = Math.round((count / orders.length) * 100);
              return (
                <div key={status} className="group hover:bg-gray-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${statusColors[status] || 'bg-gray-400'} shadow-sm`}></span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">
                        {statusLabels[status] || status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                        {count}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="relative h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`absolute inset-y-0 left-0 ${statusColors[status] || 'bg-gray-400'} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 sm:py-16 text-gray-400">
                <AlertCircle className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-40" />
                <p className="text-xs sm:text-base font-medium">Aucune commande</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Payment Status */}
        <div className="bg-white border border-gray-100 p-3.5 sm:p-6 lg:p-8 rounded-lg sm:rounded-2xl shadow-sm w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl">
              <PieChart className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">
                Statut des paiements
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Répartition des paiements</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-3 sm:py-6">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 sm:w-44 sm:h-44 lg:w-52 lg:h-52 mb-5 sm:mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#fee2e2"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#greenGradient)"
                  strokeWidth="12"
                  strokeDasharray={`${paidPercentage * 2.51} ${(100 - paidPercentage) * 2.51}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                    {paidPercentage}%
                  </div>
                  <div className="text-[10px] sm:text-sm text-gray-500 font-medium">Taux de paiement</div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
              <div className="group bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-emerald-200 transition-all">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full shadow-sm"></span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Payé</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-emerald-700 mb-0.5 sm:mb-1">{paidOrders}</div>
                <div className="text-[10px] sm:text-xs text-emerald-600 font-medium">{formatCurrency(kpis.paidRevenue)}</div>
              </div>
              <div className="group bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-red-200 transition-all">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full shadow-sm"></span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Impayé</span>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-red-700 mb-0.5 sm:mb-1">{unpaidOrders}</div>
                <div className="text-[10px] sm:text-xs text-red-600 font-medium">{formatCurrency(kpis.pendingRevenue)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};