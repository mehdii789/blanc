import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Edit, Clock, User, Banknote, Building2, FileText, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OrderStatus, Order, Service, PaymentMethod, Invoice, InvoiceItem, OrderService } from '../../types';
import { useNavigate } from 'react-router-dom';

interface OrderDetailsProps {
  orderId: string;
  onBack: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onBack }) => {
  // Tous les Hooks sont maintenant en haut du composant
  const { 
    orders, 
    clientOrders,
    customers, 
    updateOrderStatus,
    updateClientOrderStatus,
    addInvoice
  } = useApp();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderServices, setOrderServices] = useState<Service[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('en_attente');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState<Invoice['status']>('draft');
  
  // Fonctions de gestion d'état déplacées ici
  const handleStatusChange = (status: OrderStatus) => {
    setNewStatus(status);
  };
  
  const saveStatusChange = () => {
    if (!orderId) return;
    
    // Vérifier si c'est une commande client (commence par 'client_')
    const isClientOrder = orderId.startsWith('client_');
    
    if (isClientOrder) {
      // Pour une commande client, utiliser updateClientOrderStatus
      updateClientOrderStatus(orderId.replace('client_', ''), newStatus);
    } else {
      // Pour une commande normale, utiliser updateOrderStatus
      updateOrderStatus(orderId, newStatus);
    }
    
    setIsUpdatingStatus(false);
    
    // Mettre à jour l'état local pour refléter le changement
    setOrder(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date() } : null);
  };
  
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'en_traitement': return 'bg-purple-100 text-purple-800';
      case 'lavage': return 'bg-cyan-100 text-cyan-800';
      case 'sechage': return 'bg-teal-100 text-teal-800';
      case 'pliage': return 'bg-emerald-100 text-emerald-800';
      case 'pret': return 'bg-green-100 text-green-800';
      case 'livre': return 'bg-blue-100 text-blue-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const statuses: OrderStatus[] = [
    'en_attente',
    'en_traitement',
    'lavage',
    'sechage',
    'pliage',
    'pret',
    'livre',
    'annule'
  ];

  // Fonction pour obtenir l'icône du mode de paiement
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return <Banknote size={18} className="text-green-600" />;
      case 'card': return <CreditCard size={18} className="text-blue-600" />;
      case 'transfer': return <Building2 size={18} className="text-purple-600" />;
      case 'check': return <FileText size={18} className="text-orange-600" />;
      default: return <CreditCard size={18} className="text-gray-600" />;
    }
  };

  // Fonction pour obtenir le label du mode de paiement
  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte bancaire';
      case 'transfer': return 'Virement';
      case 'check': return 'Chèque';
      default: return 'Non défini';
    }
  };
  
  // Valeurs dérivées
  const customer = order ? customers.find(c => c.id === order.customerId) : null;
  const isCompleted = order ? (order.status === 'livre' || order.status === 'annule') : false;
  
  // Mettre à jour la commande lorsque l'ID change ou que les commandes sont mises à jour
  useEffect(() => {
    let isMounted = true;
    
    const loadOrder = async () => {
      if (!orderId) return;
      
      setIsLoading(true);
      try {
        // Vérifier si c'est une commande du portail client (commence par 'client_')
        const isClientOrder = orderId.startsWith('client_');
        console.log('Recherche de la commande avec ID:', orderId, 'isClientOrder:', isClientOrder);
        
        let existingOrder;
        
        if (isClientOrder) {
          // Si c'est une commande du portail client, essayer de la trouver dans les clientOrders
          const clientOrder = clientOrders.find(o => `client_${o.id}` === orderId);
          
          if (clientOrder) {
            // Convertir la commande client en format Order pour l'affichage
            // Convertir les packs en services pour l'affichage
            const services: OrderService[] = clientOrder.packs.flatMap(pack => {
              // Créer un service pour chaque pack
              return {
                id: pack.packId,
                name: pack.packName,
                description: `Pack de ${pack.quantity} x ${pack.packName}`,
                price: pack.unitPrice,
                quantity: pack.quantity,
                estimatedTime: 24 // Valeur par défaut, à ajuster si nécessaire
              };
            });
            
            existingOrder = {
              id: `client_${clientOrder.id}`,
              customerId: clientOrder.customerId,
              status: clientOrder.status as OrderStatus,
              totalAmount: clientOrder.totalAmount,
              paymentMethod: 'card' as PaymentMethod, // Par défaut pour les commandes en ligne
              paid: false, // À ajuster selon votre logique de paiement
              notes: clientOrder.notes || 'Commande passée via le portail client',
              services: services,
              createdAt: new Date(clientOrder.createdAt),
              updatedAt: new Date(clientOrder.updatedAt),
              dueDate: clientOrder.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours par défaut
            };
          }
        } else {
          // Sinon, chercher dans les commandes normales
          existingOrder = orders.find(o => o.id === orderId);
        }
        
        console.log('Commande trouvée:', existingOrder);
        
        if (existingOrder && isMounted) {
          console.log('Définition de la commande et de ses services');
          setOrder(existingOrder);
          setNewStatus(existingOrder.status);
          // Mettre à jour les services de la commande
          const services = Array.isArray(existingOrder.services) ? existingOrder.services : [];
          console.log('Services de la commande:', services);
          setOrderServices(services);
        } else if (isMounted) {
          console.error(`Commande avec l'ID ${orderId} non trouvée`);
          console.warn(`Commande avec l'ID ${orderId} non trouvée`);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error);
        if (isMounted) {
          // En cas d'erreur, on peut rediriger vers la liste avec un message d'erreur
          // onBack();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadOrder();
    
    // Nettoyer l'état lors du démontage du composant
    return () => {
      isMounted = false;
    };
  }, [orderId, orders, clientOrders]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-gray-900">Commande non trouvée</h3>
        <p className="mt-2 text-gray-500">La commande demandée n'existe pas ou a été supprimée.</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={onBack}
        >
          Retour à la liste des commandes
        </button>
      </div>
    );
  }
  
  // Les fonctions et constantes ont été déplacées en haut du composant pour respecter les règles des Hooks
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          onClick={onBack}
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Détails de la commande</h2>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-gray-800">Commande #{order.id}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-500">Créée le {formatDate(order.createdAt)}</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateInvoice(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FileText size={16} />
              <span>Créer une facture</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {/* Carte Client */}
          <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm w-full">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0">
              <User size={18} className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Client</p>
              <p className="text-sm font-medium text-gray-900 truncate">{customer?.name}</p>
              <p className="text-xs text-gray-500 mt-1">{customer?.phone}</p>
            </div>
          </div>
          
          {/* Carte Date d'échéance */}
          <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm w-full">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 flex-shrink-0">
              <Clock size={18} className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date d'échéance</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(order.dueDate)}</p>
              {new Date() > order.dueDate && order.status !== 'livre' && order.status !== 'annule' && (
                <p className="text-xs text-red-600 font-medium mt-1">En retard</p>
              )}
            </div>
          </div>
          
          {/* Carte Statut de paiement */}
          <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm w-full">
            <div className="p-2 bg-green-50 rounded-lg text-green-600 flex-shrink-0">
              {getPaymentMethodIcon(order.paymentMethod || 'cash')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Paiement</p>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {getPaymentMethodLabel(order.paymentMethod || 'cash')}
              </p>
              {order.paid && (
                <p className="text-xs font-medium text-green-600">
                  Payé
                </p>
              )}
            </div>
          </div>
        </div>
        
        {!isCompleted && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-800">Statut de la commande</h4>
              {!isUpdatingStatus ? (
                <button
                  onClick={() => setIsUpdatingStatus(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Edit size={14} />
                  Modifier le statut
                </button>
              ) : (
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Retour à la liste
                  </button>
                  <button
                    onClick={saveStatusChange}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Enregistrer
                  </button>
                </div>
              )}
            </div>
            
            {isUpdatingStatus ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                {statuses.map(status => (
                  <button
                    key={status}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newStatus === status 
                        ? getStatusColor(status) 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleStatusChange(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  {statuses.slice(0, 7).map((status, index) => {
                    const statusIndex = statuses.indexOf(order.status);
                    const isActive = index <= statusIndex && statusIndex < 7;
                    return (
                      <div
                        key={status}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap justify-center ${
                          isActive ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${100 / 7}%` }}
                      ></div>
                    );
                  })}
                </div>
                <div className="flex justify-between">
                  <div className="text-xs text-gray-600">Début</div>
                  <div className="text-xs text-gray-600">Prêt à récupérer</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4">Détails de la commande</h4>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 hidden sm:table-header-group">
                    <tr>
                      <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">
                        Service
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                        Quantité
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">
                        Prix unitaire
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {orderServices.map((service, index) => {
                      const quantity = (service as any).quantity || 1;
                      const totalPrice = service.price * quantity;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 pl-6 pr-3 text-sm font-medium text-gray-900 sm:whitespace-nowrap">
                            <div className="font-medium">{service.name}</div>
                            <div className="sm:hidden text-gray-500 text-xs mt-1">
                              {service.description}
                              <div className="mt-1">
                                <span className="font-medium">Quantité:</span> {quantity} × {formatCurrency(service.price)} = {formatCurrency(totalPrice)}
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500">
                            {service.description}
                          </td>
                          <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-900 text-right">
                            {quantity}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-900 text-right">
                            {formatCurrency(service.price)}
                          </td>
                          <td className="py-3 px-6 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                            {formatCurrency(totalPrice)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td className="py-3 pl-6 text-sm font-medium text-gray-900 sm:hidden">
                        Total
                      </td>
                      <td className="hidden sm:table-cell py-3 pl-6 pr-3 text-right text-sm font-medium text-gray-900" colSpan={2}>
                        Montant total :
                      </td>
                      <td className="py-3 px-6 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {order.notes && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création de facture */}
      {showCreateInvoice && order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Créer une facture</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut de la facture
              </label>
              <select
                value={invoiceStatus}
                onChange={(e) => setInvoiceStatus(e.target.value as Invoice['status'])}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyée</option>
                <option value="paid">Payée</option>
                <option value="overdue">En retard</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateInvoice(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Calculer le total des articles de la commande avec les bonnes quantités
                  const subtotal = orderServices.reduce((sum, service) => {
                    const quantity = (service as any).quantity || 1;
                    return sum + (service.price * quantity);
                  }, 0);
                  
                  // Créer la facture
                  addInvoice({
                    orderId: order.id,
                    customerId: order.customerId,
                    issueDate: new Date(),
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours plus tard
                    items: orderServices.map(service => {
                      const quantity = (service as any).quantity || 1;
                      return {
                        id: `item_${Date.now()}_${service.id}`,
                        description: service.name,
                        quantity: quantity,
                        unitPrice: service.price,
                        total: service.price * quantity
                      } as InvoiceItem;
                    }),
                    subtotal,
                    tax: subtotal * 0.2, // 20% de TVA
                    discount: 0,
                    total: subtotal * 1.2, // TTC
                    notes: '',
                    status: invoiceStatus,
                    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
                  });
                  
                  // Rediriger vers la page des factures
                  navigate('/invoices');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Créer la facture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};