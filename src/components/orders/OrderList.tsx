import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Trash2, CreditCard, Banknote, Building2, FileText, Eye } from 'lucide-react';
import { OrderStatus, PaymentMethod, Order, ClientOrder } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { OrderForm } from './OrderForm';
import { useNavigate } from 'react-router-dom';

const OrderList = () => {
  const { 
    orders, 
    customers, 
    deleteOrder, 
    deleteClientOrder, 
    clientOrders, 
    servicePacks 
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  // Convertir les ClientOrder en format Order pour l'affichage unifié
  const convertedClientOrders = useMemo(() => {
    return clientOrders.map((clientOrder): Order => ({
      id: `client_${clientOrder.id}`,
      customerId: clientOrder.customerId,
      services: clientOrder.packs.map(pack => {
        const servicePack = servicePacks.find(sp => sp.id === pack.packId);
        return {
          id: pack.packId,
          name: pack.packName,
          price: pack.unitPrice,
          description: servicePack?.description || 'Pack de services',
          estimatedTime: servicePack?.estimatedTime || 24,
          quantity: pack.quantity
        };
      }),
      status: clientOrder.status,
      totalAmount: clientOrder.totalAmount,
      paid: false, // Les commandes client ne sont pas encore payées par défaut
      notes: clientOrder.notes || 'Commande via portail client',
      createdAt: clientOrder.createdAt,
      updatedAt: clientOrder.updatedAt,
      dueDate: clientOrder.deliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 jours par défaut
    }));
  }, [clientOrders, servicePacks]);

  // Combiner toutes les commandes
  const allOrders = useMemo(() => {
    return [...orders, ...convertedClientOrders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, convertedClientOrders]);
  
  const handleDeleteClick = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setOrderToDelete(orderId);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    if (!orderToDelete) return;
    
    try {
      // Vérifier si c'est une commande client (commence par 'client_')
      if (orderToDelete.startsWith('client_')) {
        // Supprimer la commande client
        const orderId = orderToDelete.replace('client_', '');
        deleteClientOrder(orderId);
        toast.success('Commande client supprimée avec succès');
      } else {
        // Supprimer une commande normale
        deleteOrder(orderToDelete);
        toast.success('Commande supprimée avec succès');
      }
      
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      toast.error('Une erreur est survenue lors de la suppression de la commande');
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setOrderToDelete(null);
  };
  
  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };
  
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
  
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return <Banknote size={16} className="text-green-600" />;
      case 'card': return <CreditCard size={16} className="text-blue-600" />;
      case 'transfer': return <Building2 size={16} className="text-purple-600" />;
      case 'check': return <FileText size={16} className="text-orange-600" />;
      default: return <CreditCard size={16} className="text-gray-600" />;
    }
  };
  
  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte';
      case 'transfer': return 'Virement';
      case 'check': return 'Chèque';
      default: return 'Non défini';
    }
  };
  
  const filteredOrders = allOrders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const customerName = customer?.name || '';
    
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (showAddForm) {
    return <OrderForm onClose={() => setShowAddForm(false)} />;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-hidden">
      {/* En-tête avec barre de recherche et bouton d'ajout */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center sm:text-left w-full sm:w-auto">Commandes</h2>
          <div className="w-full sm:w-auto flex justify-center sm:block">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
            >
              <Plus size={16} />
              <span>Nouvelle commande</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
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

          <div className="text-sm text-gray-600 flex items-center">
            <span className="font-medium">{filteredOrders.length}</span>
            <span className="ml-1">commande{filteredOrders.length > 1 ? 's' : ''} trouvée{filteredOrders.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <>
          {/* Version Mobile - Cartes améliorée */}
          <div className="md:hidden p-3">
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const customer = customers.find(c => c.id === order.customerId);
                const customerName = customer?.name || 'Client inconnu';
                const customerPhone = customer?.phone || '';
                
                return (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer border border-gray-100 hover:border-blue-200 transition-colors"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    {/* En-tête avec numéro de commande et date */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-gray-900">#{order.id.substring(0, 8)}</span>
                        {order.id.startsWith('client_') && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            Portail Client
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                    </div>
                    
                    {/* Informations client */}
                    <div className="mb-3">
                      <div className="text-base font-medium text-gray-900 truncate">{customerName}</div>
                      {customerPhone && (
                        <div className="text-sm text-blue-600 mt-1">{customerPhone}</div>
                      )}
                    </div>
                    
                    {/* Montant et nombre de services */}
                    <div className="flex justify-between items-center mb-3 text-sm">
                      <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {order.services?.length || 0} service{(order.services?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* Statut et méthode de paiement */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex-shrink-0">
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getPaymentMethodIcon(order.paymentMethod || 'cash')}
                        <span className="text-xs font-medium text-gray-700">
                          {getPaymentMethodLabel(order.paymentMethod || 'cash')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Version Desktop - Tableau */}
          <div className="hidden md:block overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Commande
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Heure
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paiement
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                #{order.id.substring(0, 8)}
                              </span>
                              {order.id.startsWith('client_') && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Portail
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{customerName}</div>
                            {customerPhone && (
                              <div className="text-sm text-gray-500">{customerPhone}</div>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
                            <div className="text-sm text-gray-500">
                              {order.services?.length || 0} service{(order.services?.length || 0) > 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
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
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Voir les détails"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(e, order.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
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
            </div>
          </div>
        </>
      ) : (
        <div className="p-6 md:p-12 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">Aucune commande trouvée</p>
            <p className="text-sm mb-4">Aucune commande ne correspond à vos critères de recherche.</p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Supprimer la commande</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette commande ? 
              {orderToDelete?.startsWith('client_') && (
                <span className="block mt-2 text-blue-600">
                  Le client sera notifié de la suppression de sa commande.
                </span>
              )}
              <span className="block mt-2 font-medium text-red-600">
                Cette action est irréversible.
              </span>
            </p>
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
          </div>
        </div>
      )}
    </div>
  );
};

export { OrderList };
