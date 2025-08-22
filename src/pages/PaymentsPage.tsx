import React, { useState, useMemo, Fragment } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Download, 
  Eye, 
  Search,
  ArrowUpRight,
  Wallet,
  PieChart,
  BarChart3,
  Clock
} from 'lucide-react';

type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check';

interface PaymentStats {
  totalRevenue: number;
  paidOrders: number;
  averageOrder: number;
  pendingPayments: number;
  growthRate: number;
  methodBreakdown: Record<PaymentMethod, number>;
}

export const PaymentsPage: React.FC = () => {
  const { orders, customers, invoices } = useApp();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Client inconnu';
  };

  // Récupérer la méthode de paiement depuis l'ordre
  const getPaymentMethod = (order: any): PaymentMethod => {
    return order.paymentMethod || 'cash'; // Valeur par défaut pour la rétrocompatibilité
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const labels = {
      cash: 'Espèces',
      card: 'Carte bancaire',
      transfer: 'Virement',
      check: 'Chèque'
    };
    return labels[method];
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const icons = {
      cash: DollarSign,
      card: CreditCard,
      transfer: ArrowUpRight,
      check: Wallet
    };
    const Icon = icons[method];
    return <Icon size={16} />;
  };

  // Créer un ensemble des IDs de commandes avec facture payée
  const paidOrderIds = React.useMemo(() => new Set(
    invoices
      .filter(invoice => invoice.status === 'paid')
      .map(invoice => invoice.orderId)
      .filter(Boolean)
  ), [invoices]);
  
  // Filtrer les commandes et factures selon la période
  const getFilteredOrders = useMemo(() => {
    return orders.map(order => {
      // Vérifier si une facture payée existe pour cette commande
      const hasPaidInvoice = paidOrderIds.has(order.id);
      
      // Si une facture payée existe, mettre à jour le statut de la commande
      if (hasPaidInvoice && !order.paid) {
        return { ...order, paid: true };
      }
      
      return order;
    }).filter(order => {
      // Filtre par date
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      let matchesTime = true;
      
      if (timeFilter === 'today') {
        matchesTime = orderDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'week') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        matchesTime = orderDate >= startOfWeek;
      } else if (timeFilter === 'month') {
        matchesTime = orderDate.getMonth() === now.getMonth() && 
                     orderDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'year') {
        matchesTime = orderDate.getFullYear() === now.getFullYear();
      }
      
      // Filtre par recherche
      const matchesSearch = searchTerm === '' || 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCustomerName(order.customerId).toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par méthode de paiement
      const orderPaymentMethod = getPaymentMethod(order);
      const matchesPaymentMethod = selectedPaymentMethod === 'all' || 
        orderPaymentMethod === selectedPaymentMethod;
      
      return matchesTime && matchesSearch && matchesPaymentMethod;
    });
  }, [orders, timeFilter, searchTerm, selectedPaymentMethod, customers, invoices]);

  const paidOrders = getFilteredOrders.filter(order => order.paid);
  const pendingOrders = getFilteredOrders.filter(order => !order.paid);
  
  const stats: PaymentStats = useMemo(() => {
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrder = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    
    const methodBreakdown: Record<PaymentMethod, number> = {
      cash: 0,
      card: 0,
      transfer: 0,
      check: 0
    };
    
    paidOrders.forEach(order => {
      const method = getPaymentMethod(order);
      methodBreakdown[method] = (methodBreakdown[method] || 0) + order.totalAmount;
    });
    
    const methodPercentages = Object.entries(methodBreakdown).map(([method, amount]) => ({
      method: method as PaymentMethod,
      percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
      amount
    }));
    
    return {
      totalRevenue,
      paidOrders: paidOrders.length,
      averageOrder,
      pendingPayments: pendingOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      growthRate: Math.random() * 20 - 10, // Simulation du taux de croissance
      methodBreakdown,
      methodPercentages
    };
  }, [paidOrders, pendingOrders]);
  
  return (
    <div className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      {/* En-tête avec contrôles */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Gestion des Paiements</h1>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Suivez vos revenus et analysez vos performances financières</p>
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 text-sm"
              />
            </div>
            
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm flex-1 sm:flex-none"
            >
              <option value="today" className="text-gray-900">Aujourd'hui</option>
              <option value="week" className="text-gray-900">7 derniers jours</option>
              <option value="month" className="text-gray-900">30 derniers jours</option>
              <option value="year" className="text-gray-900">Cette année</option>
              <option value="all" className="text-gray-900">Tout le temps</option>
            </select>
            
            <button 
              onClick={() => {
                // Créer les données CSV
                const headers = ['ID', 'Client', 'Date', 'Montant', 'Méthode', 'Statut'];
                const csvContent = [
                  headers.join(','),
                  ...paidOrders.map(order => {
                    const customer = customers.find(c => c.id === order.customerId);
                    const paymentMethod = getPaymentMethod(order);
                    const formattedDate = formatDate(order.createdAt);
                    return [
                      `#${order.id}`,
                      `"${customer?.name || 'Inconnu'}"`,
                      `"${formattedDate}"`,
                      formatCurrency(order.totalAmount),
                      `"${getPaymentMethodLabel(paymentMethod)}"`,
                      order.paid ? 'Payé' : 'En attente'
                    ].join(',');
                  })
                ].join('\n');
                
                // Créer et télécharger le fichier
                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
                link.download = `export-paiements-${today}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex-1 sm:flex-none"
            >
              <Download size={16} />
              <span className="sm:inline">Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6">
        {/* Chiffre d'affaires */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[140px] sm:min-h-[180px] flex flex-col justify-between w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
              <DollarSign size={18} className="sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center text-sm">
              {stats.growthRate >= 0 ? (
                <><TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+{stats.growthRate.toFixed(1)}%</span></>
              ) : (
                <><TrendingDown size={16} className="text-red-500 mr-1" />
                <span className="text-red-600 font-medium">{stats.growthRate.toFixed(1)}%</span></>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Chiffre d'affaires</h3>
            <p className="text-base sm:text-3xl font-bold text-gray-900 mb-1 break-words">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-500 hidden sm:block">Revenus sur la période sélectionnée</p>
          </div>
        </div>

        {/* Commandes payées */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[140px] sm:min-h-[180px] flex flex-col justify-between w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
              <CreditCard size={18} className="sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+8.2%</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Commandes payées</h3>
            <p className="text-base sm:text-3xl font-bold text-gray-900 mb-1 break-words">{stats.paidOrders}</p>
            <p className="text-xs text-gray-500 hidden sm:block">Transactions réussies</p>
          </div>
        </div>

        {/* Panier moyen */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[140px] sm:min-h-[180px] flex flex-col justify-between w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
              <BarChart3 size={18} className="sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+5.4%</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Panier moyen</h3>
            <p className="text-base sm:text-3xl font-bold text-gray-900 mb-1 break-words">{formatCurrency(stats.averageOrder)}</p>
            <p className="text-xs text-gray-500 hidden sm:block">Valeur moyenne par commande</p>
          </div>
        </div>

        {/* Paiements en attente */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group min-h-[140px] sm:min-h-[180px] flex flex-col justify-between w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
              <Clock size={18} className="sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center text-sm">
              <TrendingDown size={16} className="text-red-500 mr-1" />
              <span className="text-red-600 font-medium">-2.1%</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">En attente</h3>
            <p className="text-base sm:text-3xl font-bold text-gray-900 mb-1 break-words">{formatCurrency(stats.pendingPayments)}</p>
            <p className="text-xs text-gray-500 hidden sm:block">Montant des impayés</p>
          </div>
        </div>
      </div>

      {/* Répartition par méthode de paiement */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <PieChart className="text-blue-600" size={20} />
            <span className="hidden sm:inline">Répartition par méthode de paiement</span>
            <span className="sm:hidden">Méthodes de paiement</span>
          </h2>
          <select 
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full sm:w-auto"
          >
            <option value="all">Toutes les méthodes</option>
            <option value="cash">Espèces</option>
            <option value="card">Carte bancaire</option>
            <option value="transfer">Virement</option>
            <option value="check">Chèque</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {Object.entries(stats.methodBreakdown).map(([method, amount]) => {
            const percentage = stats.totalRevenue > 0 ? (amount / stats.totalRevenue) * 100 : 0;
            return (
              <div key={method} className="bg-gray-50 rounded-lg sm:rounded-xl p-2 sm:p-4 hover:bg-gray-100 transition-colors min-h-[120px] sm:min-h-[140px] flex flex-col justify-between w-full">
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                    {getPaymentMethodIcon(method as PaymentMethod)}
                  </div>
                  <div className="text-center sm:text-left sm:flex-1 sm:min-w-0">
                    <h4 className="font-medium text-gray-900 text-xs sm:text-base leading-tight break-words">{getPaymentMethodLabel(method as PaymentMethod)}</h4>
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="mt-auto w-full">
                  <p className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 text-center sm:text-left break-words">{formatCurrency(amount)}</p>
                  <div className="bg-gray-200 rounded-full h-1.5 sm:h-2 w-full">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Historique des transactions */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              <span className="hidden sm:inline">Historique des transactions</span>
              <span className="sm:hidden">Transactions</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <span className="hidden sm:inline">Affichage:</span>
                <span className="font-medium">{getFilteredOrders.length} transactions</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Version mobile */}
        <div className="md:hidden">
          {getFilteredOrders.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CreditCard className="text-gray-400" size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucune transaction trouvée</h3>
              <p className="text-sm text-gray-500">Aucune transaction ne correspond aux critères de recherche.</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
              {getFilteredOrders.slice(0, 10).map((order) => (
                <div key={order.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        {getPaymentMethodIcon(getPaymentMethod(order))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">#{order.id}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{getCustomerName(order.customerId)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${
                        order.paid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {order.paid ? 'Payé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Date</span>
                      <p className="font-medium text-gray-900">{formatDate(order.updatedAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Montant</span>
                      <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Méthode</span>
                      <p className="font-medium text-gray-900">{getPaymentMethodLabel(getPaymentMethod(order))}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Statut</span>
                      <p className="font-medium text-gray-900">{order.status}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDetails(showDetails === order.id ? null : order.id)}
                    className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Eye size={16} />
                    {showDetails === order.id ? 'Masquer' : 'Voir détails'}
                  </button>
                  {showDetails === order.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Services:</span>
                          <span className="font-medium">{order.services.length} service(s)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Notes:</span>
                          <span className="font-medium">{order.notes || 'Aucune'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Version desktop */}
        <div className="hidden md:block">
          {getFilteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Aucune transaction trouvée</h3>
              <p className="text-gray-500 mb-6">Aucune transaction ne correspond aux critères de recherche.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Méthode</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredOrders.map((order) => (
                    <Fragment key={order.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getPaymentMethodIcon(getPaymentMethod(order))}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">#{order.id}</div>
                            <div className="text-sm text-gray-500">{order.services.length} service(s)</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{getCustomerName(order.customerId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-gray-700">
                            {getPaymentMethodIcon(getPaymentMethod(order))}
                          </span>
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {getPaymentMethodLabel(getPaymentMethod(order))}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          order.paid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {order.paid ? 'Payé' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setShowDetails(showDetails === order.id ? null : order.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                          Détails
                        </button>
                      </td>
                    </tr>
                    {showDetails === order.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Détails de la commande</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Client:</span>
                                  <span className="font-medium">{getCustomerName(order.customerId)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Date de création:</span>
                                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Statut:</span>
                                  <span className="font-medium">{order.status}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Méthode de paiement:</span>
                                  <span className="font-medium">{getPaymentMethodLabel(getPaymentMethod(order))}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Services</h4>
                              <div className="space-y-2">
                                {order.services?.map((service: any, index: number) => (
                                  <div key={index} className="flex justify-between">
                                    <span className="text-gray-500">{service.name || 'Service sans nom'}</span>
                                    <span className="font-medium">{formatCurrency(service.price || 0)}</span>
                                  </div>
                                ))}
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                  <div className="flex justify-between font-semibold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(order.totalAmount)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};