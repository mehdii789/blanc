import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Trash2, CreditCard, Banknote, Building2, FileText, Eye } from 'lucide-react';
import { OrderStatus, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OrderForm } from './OrderForm';
import { useNavigate } from 'react-router-dom';

const OrderList = () => {
  const { orders, customers, deleteOrder } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  
  // Fonction pour gérer la suppression d'une commande
  const handleDeleteClick = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setOrderToDelete(orderId);
    setShowDeleteDialog(true);
  };
  
  // Fonction pour confirmer la suppression
  const confirmDelete = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete);
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    }
  };
  
  // Fonction pour annuler la suppression
  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setOrderToDelete(null);
  };
  
  // Fonction pour afficher les détails d'une commande
  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };
  
  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: OrderStatus) => {
    const statusStyles = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'en_traitement': 'bg-blue-100 text-blue-800',
      'lavage': 'bg-indigo-100 text-indigo-800',
      'sechage': 'bg-purple-100 text-purple-800',
      'pliage': 'bg-pink-100 text-pink-800',
      'pret': 'bg-green-100 text-green-800',
      'livre': 'bg-teal-100 text-teal-800',
      'annule': 'bg-red-100 text-red-800'
    };
    
    const statusLabels = {
      'en_attente': 'En attente',
      'en_traitement': 'En traitement',
      'lavage': 'En lavage',
      'sechage': 'Séchage',
      'pliage': 'En pliage',
      'pret': 'Prêt à récupérer',
      'livre': 'Livré',
      'annule': 'Annulé'
    };
    
    const className = statusStyles[status] || 'bg-gray-100 text-gray-800';
    const label = statusLabels[status] || status;
    
    return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${className}`}>{label}</span>;
  };
  
  // Fonction pour obtenir l'icône du mode de paiement
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return <Banknote size={16} className="text-green-600" />;
      case 'card': return <CreditCard size={16} className="text-blue-600" />;
      case 'transfer': return <Building2 size={16} className="text-purple-600" />;
      case 'check': return <FileText size={16} className="text-orange-600" />;
      default: return <CreditCard size={16} className="text-gray-600" />;
    }
  };
  
  // Fonction pour obtenir le libellé du mode de paiement
  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte';
      case 'transfer': return 'Virement';
      case 'check': return 'Chèque';
      default: return 'Non défini';
    }
  };
  
  // Filtrer les commandes en fonction de la recherche et du filtre de statut
  const filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const customerName = customer?.name || '';
    
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Rendu du composant
  return (
    <div className="bg-white rounded-lg shadow">
      {/* En-tête avec barre de recherche et bouton d'ajout */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Liste des commandes</h2>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="en_traitement">En traitement</option>
            <option value="lavage">En lavage</option>
            <option value="sechage">Séchage</option>
            <option value="pliage">En pliage</option>
            <option value="pret">Prêt à récupérer</option>
            <option value="livre">Livré</option>
            <option value="annule">Annulé</option>
          </select>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            <span>Nouvelle commande</span>
          </button>
        </div>
      </div>

      {/* Tableau des commandes */}
      {filteredOrders.length > 0 ? (
        <div className="overflow-x-auto">
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                const customerName = customer?.name || 'Client inconnu';
                const customerPhone = customer?.phone || '';
                
                return (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">#{order.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customerName}</div>
                      {customerPhone && (
                        <div className="text-sm text-gray-500">{customerPhone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
                      <div className="text-sm text-gray-500">{order.services?.length || 0} service{(order.services?.length || 0) > 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(order.paymentMethod || 'cash')}
                        <span className="text-sm text-gray-900">
                          {getPaymentMethodLabel(order.paymentMethod || 'cash')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order.id);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, order.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer la commande"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">Aucune commande trouvée.</p>
          {searchTerm || statusFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Nouvelle commande</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <OrderForm onClose={() => setShowAddForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Supprimer la commande</h3>
            <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
      {/* Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* En-tête amélioré */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Gestion des Commandes</h1>
              <p className="mt-1 text-gray-600">Gérez et suivez toutes vos commandes en cours</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center w-full px-5 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={18} className="mr-2" />
                Nouvelle commande
              </button>
            </div>
          </div>
          
          {/* Barre de recherche et filtres améliorée */}
          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une commande..."
                className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full">
              <select
                className="block w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            
            <div className="flex items-center justify-end sm:col-span-2 lg:col-span-1">
              <span className="text-sm text-gray-500">
                {filteredOrders.length} {filteredOrders.length > 1 ? 'commandes' : 'commande'} trouvée(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Version Desktop - Tableau amélioré */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  N° Commande
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Client
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                  Date
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Montant
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Statut
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Paiement
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const customer = customers.find(c => c.id === order.customerId);
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 font-medium">
                            #{order.id.substring(0, 4)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(order.createdAt, 'dd/MM/yyyy')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(order.createdAt, 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer?.name || 'Client inconnu'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer?.phone || 'Tél. non renseigné'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.services.length} {order.services.length > 1 ? 'articles' : 'article'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center">
                          {getStatusBadge(order.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center">
                            <span className="mr-2">
                              {getPaymentMethodIcon(order.paymentMethod || 'cash')}
                            </span>
                            <span className="text-sm text-gray-600">
                              {getPaymentMethodLabel(order.paymentMethod || 'cash')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order.id);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir les détails"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(e, order.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
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
                  <div className="flex justify-between items-start mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-900 font-medium">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(order.paymentMethod || 'cash')}
                        <span className="text-xs text-gray-500">{getPaymentMethodLabel(order.paymentMethod || 'cash')}</span>
                        {order.paid && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">
                            Payé
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(order.status)}
                      <button
                        onClick={(e) => handleDeleteClick(e, order.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Supprimer la commande"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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