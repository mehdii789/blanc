import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus } from 'lucide-react';
import { OrderStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OrderForm } from './OrderForm';

const OrderList: React.FC = () => {
  const { orders, customers, setSelectedOrderId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const filteredOrders = orders.filter(order => {
    // Filter by search term (customer name or order ID)
    const customer = customers.find(c => c.id === order.customerId);
    const customerName = customer?.name || '';
    
    const matchesSearch = 
      order.id.includes(searchTerm) || 
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };
  
  const getStatusBadge = (status: OrderStatus) => {
    const statusStyles: Record<string, string> = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'en_traitement': 'bg-purple-100 text-purple-800',
      'lavage': 'bg-cyan-100 text-cyan-800',
      'sechage': 'bg-teal-100 text-teal-800',
      'pliage': 'bg-emerald-100 text-emerald-800',
      'pret': 'bg-green-100 text-green-800',
      'livre': 'bg-blue-100 text-blue-800',
      'annule': 'bg-red-100 text-red-800'
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
    
    const className = statusStyles[status] || 'bg-gray-100 text-gray-800';
    const label = statusLabels[status] || status;
    
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${className}`}>{label}</span>;
  };
  
  // Fonction utilitaire pour obtenir le nom du client
  const getCustomerName = (customerId: string): string => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Client inconnu';
  };

  // Fonction utilitaire pour obtenir le libellé d'un statut
  const getStatusLabel = (status: OrderStatus): string => {
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
    return statusLabels[status] || status;
  };

  // Afficher le formulaire d'ajout si nécessaire
  if (showAddForm) {
    return <OrderForm onClose={() => setShowAddForm(false)} />;
  }

  // Rendu principal de la liste des commandes
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 text-center sm:text-left">
        <h2 className="text-xl font-semibold text-gray-800 w-full sm:w-auto">Liste des commandes</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          <span className="whitespace-nowrap">Nouvelle commande</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une commande..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_traitement">En traitement</option>
              <option value="lavage">Lavage</option>
              <option value="sechage">Séchage</option>
              <option value="pliage">Pliage</option>
              <option value="pret">Prêt</option>
              <option value="livre">Livré</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
        </div>

        {/* Version Desktop - Tableau */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Commande
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCustomerName(order.customerId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOrder(order.id);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Version Mobile - Cartes */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div 
                key={order.id}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                onClick={() => handleViewOrder(order.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Commande #{order.id}</p>
                    <p className="text-sm text-gray-500 mt-1">{getCustomerName(order.customerId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <div className="mt-1">{getStatusBadge(order.status)}</div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                  <span>{formatDate(order.createdAt)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewOrder(order.id);
                    }}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Détails
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Aucune commande trouvée
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { OrderList };