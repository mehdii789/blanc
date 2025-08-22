import React, { useMemo, useState, useEffect } from 'react';
import { 
  ClipboardList, 
  DollarSign, 
  Users,
  PackageCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { OrderStatusChart } from '../components/dashboard/OrderStatusChart';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { InventoryAlert } from '../components/dashboard/InventoryAlert';
import { DateRangeSelector } from '../components/dashboard/DateRangeSelector';
import { formatCurrency } from '../utils/formatters';

// Fonction pour vérifier si une date est dans une plage donnée
const isDateInRange = (date: Date, startDate: Date, endDate: Date) => {
  const time = date.getTime();
  return time >= startDate.getTime() && time <= endDate.getTime();
};

// Fonction pour calculer les statistiques du tableau de bord
const calculateDashboardStats = (orders: any[], customers: any[], startDate: Date, endDate: Date) => {
  // Filtrer les commandes dans la période (pour le comptage des commandes)
  const periodOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    
    // Gérer à la fois les chaînes de caractères et les objets Date
    const orderDate = order.createdAt instanceof Date 
      ? order.createdAt 
      : new Date(order.createdAt);
      
    return !isNaN(orderDate.getTime()) && isDateInRange(orderDate, startDate, endDate);
  });
  
  // Calculer le revenu de la période à partir des commandes payées
  const periodRevenue = orders.reduce((sum, order) => {
    // Vérifier si la commande est payée et dans la période
    if (!order.paid) return sum;
    
    const orderDate = order.updatedAt instanceof Date 
      ? order.updatedAt 
      : new Date(order.updatedAt);
      
    if (isNaN(orderDate.getTime()) || !isDateInRange(orderDate, startDate, endDate)) {
      return sum;
    }
    
    return sum + (typeof order.totalAmount === 'number' ? order.totalAmount : 0);
  }, 0);
  
  // Calculer les statistiques
  const pendingOrders = orders.filter(order => 
    ['en_attente', 'en_traitement', 'lavage', 'sechage', 'pliage'].includes(order.status)
  ).length;
  
  const readyForPickup = orders.filter(order => 
    order.status === 'pret' && !order.paid
  ).length;
  
  // Calculer le nombre de commandes par statut pour le graphique
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);
  
  // Récupérer les 5 commandes les plus récentes
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  // Calculer le nombre total de commandes en additionnant toutes les commandes par statut
  const orderCount = periodOrders.length;
  
  return {
    periodRevenue,
    pendingOrders,
    readyForPickup,
    totalCustomers: customers.length,
    ordersByStatus,
    recentOrders,
    orderCount,
  };
};

export const Dashboard: React.FC = () => {
  const { orders, customers, dateRange } = useApp();
  
  // Utiliser la plage de dates sélectionnée depuis le contexte
  const periodStart = dateRange.start;
  const periodEnd = dateRange.end;
  
  // Libellé de la période
  const periodLabel = useMemo(() => {
    const startStr = periodStart.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
    const endStr = periodEnd.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (startStr === endStr) {
      return startStr;
    }
    return `${startStr} - ${endStr}`;
  }, [periodStart, periodEnd]);
  
  // Calculer les statistiques en utilisant useMemo pour optimiser les performances
  const stats = useMemo(() => 
    calculateDashboardStats(orders, customers, periodStart, periodEnd),
    [orders, customers, periodStart, periodEnd]
  );
  
  // Calculer la tendance des revenus (exemple: +8% par rapport à la période précédente)
  const revenueTrend = useMemo(() => {
    // Calculer la période précédente pour comparaison
    const periodDuration = periodEnd.getTime() - periodStart.getTime();
    const prevPeriodEnd = new Date(periodStart.getTime() - 1);
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - periodDuration);
    
    // Calculer le revenu de la période précédente à partir des commandes payées
    const prevRevenue = orders.reduce((sum: number, order) => {
      if (!order.paid || !order.updatedAt) return sum;
      
      const orderDate = order.updatedAt instanceof Date 
        ? order.updatedAt 
        : new Date(order.updatedAt);
        
      if (isNaN(orderDate.getTime()) || !isDateInRange(orderDate, prevPeriodStart, prevPeriodEnd)) {
        return sum;
      }
      
      return sum + (typeof order.totalAmount === 'number' ? order.totalAmount : 0);
    }, 0);
    
    if (prevRevenue === 0) {
      return { valeur: stats.periodRevenue > 0 ? 100 : 0, estPositif: true };
    }
    
    const percentChange = ((stats.periodRevenue - prevRevenue) / prevRevenue) * 100;
    return { 
      valeur: Math.abs(Math.round(percentChange)), 
      estPositif: percentChange >= 0 
    };
  }, [orders, periodStart, periodEnd, stats.periodRevenue]);
  
  // État pour gérer le chargement
  const [isLoading, setIsLoading] = useState(true);
  
  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header avec titre et sélecteur de date */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
                  <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                    <Calendar size={16} className="flex-shrink-0" />
                    <span>Période : {periodLabel}</span>
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <DateRangeSelector className="w-full sm:w-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {/* Revenus */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow h-32 sm:h-36 lg:h-40 flex flex-col w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 sm:p-2 lg:p-3 bg-emerald-100 rounded-lg flex-shrink-0">
                <DollarSign className="text-emerald-600" size={16} />
              </div>
              <div className={`hidden sm:flex items-center gap-1 ${revenueTrend.estPositif ? 'text-emerald-600' : 'text-red-500'} flex-shrink-0`}>
                {revenueTrend.estPositif ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span className="text-xs font-medium">
                  {revenueTrend.estPositif ? '+' : '-'}{revenueTrend.valeur}%
                </span>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(stats.periodRevenue)}
            </div>
            <p className="text-sm text-gray-600">
              Revenus • <span className="text-xs text-gray-500">{stats.orderCount} commandes</span>
            </p>
          </div>

          {/* Commandes en cours */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow h-32 sm:h-36 lg:h-40 flex flex-col w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 sm:p-2 lg:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <ClipboardList className="text-blue-600" size={16} />
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stats.pendingOrders}
            </div>
            <p className="text-sm text-gray-600">
              En cours • <span className="text-xs text-gray-500">commandes actives</span>
            </p>
          </div>

          {/* Prêt à récupérer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow h-32 sm:h-36 lg:h-40 flex flex-col w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 sm:p-2 lg:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <PackageCheck className="text-green-600" size={16} />
              </div>
              {stats.readyForPickup > 0 && (
                <div className="hidden sm:block px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                  À récupérer
                </div>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stats.readyForPickup}
            </div>
            <p className="text-sm text-gray-600">
              Prêt • <span className="text-xs text-gray-500">à récupérer</span>
            </p>
          </div>

          {/* Clients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow h-32 sm:h-36 lg:h-40 flex flex-col w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 sm:p-2 lg:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <Users className="text-purple-600" size={16} />
              </div>
              <div className="text-purple-600 flex-shrink-0">
                <BarChart3 size={12} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stats.totalCustomers}
            </div>
            <p className="text-sm text-gray-600">
              Clients • <span className="text-xs text-gray-500">actifs</span>
            </p>
          </div>
        </div>

        {/* Graphiques et données */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8 mt-4 xl:h-96">
          {/* Graphique des statuts - 2/3 de la largeur */}
          <div className="w-full xl:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full h-full">
              <div className="flex justify-between items-center gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Statut des commandes</h2>
                <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0 w-9 h-9 flex items-center justify-center">
                  <BarChart3 className="text-blue-600" size={18} />
                </div>
              </div>
              <div className="w-full h-[calc(100%-4rem)]">
                <OrderStatusChart ordersByStatus={stats.ordersByStatus} />
              </div>
            </div>
          </div>

          {/* Alertes inventaire - 1/3 de la largeur */}
          <div className="w-full xl:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Alerte de stock</h2>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <BarChart3 className="text-amber-600" size={18} />
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <InventoryAlert />
              </div>
            </div>
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Commandes récentes</h2>
            <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
              {stats.recentOrders.length} commandes
            </div>
          </div>
          <div className="w-full overflow-hidden">
            <RecentOrders orders={stats.recentOrders} />
          </div>
        </div>
      </div>
    </div>
  );
};