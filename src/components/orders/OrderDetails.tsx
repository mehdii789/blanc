import React, { useState, useEffect } from 'react';
import { useApp } from '../../hooks/useApp';
import { ArrowLeft, Edit, Clock, User, Banknote, Building2, FileText, CreditCard, Activity } from 'lucide-react';
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
    servicePacks,
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
              // Trouver le pack correspondant pour obtenir ses détails
              const servicePack = servicePacks.find(sp => sp.id === pack.packId);
              
              // Créer une description détaillée avec les services inclus
              let description = `Pack de ${pack.quantity} x ${pack.packName}`;
              if (servicePack && servicePack.services.length > 0) {
                const servicesList = servicePack.services
                  .map(s => `${s.serviceName} (x${s.quantity})`)
                  .join(', ');
                description += ` - Inclus: ${servicesList}`;
              }
              
              return {
                id: pack.packId,
                name: pack.packName,
                description: description,
                price: pack.unitPrice,
                quantity: pack.quantity,
                estimatedTime: servicePack?.estimatedTime || 24
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center px-4 sm:px-0">
        <button
          className="mr-3 p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={onBack}
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Détails de la commande</h2>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        {/* En-tête mobile optimisé */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            {/* Ligne 1: Titre de commande */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-2xl font-bold text-gray-800 break-words">
                  Commande
                </h3>
                <p className="text-xs sm:text-sm font-mono text-gray-600 break-all mt-1">
                  #{order.id}
                </p>
              </div>
              <span className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            
            {/* Ligne 2: Date */}
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <Clock size={14} className="flex-shrink-0" />
              Créée le {formatDate(order.createdAt)}
            </p>
            
            {/* Ligne 3: Bouton facture */}
            <button
              onClick={() => setShowCreateInvoice(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg font-medium text-sm"
            >
              <FileText size={16} />
              <span>Créer une facture</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Carte Client */}
          <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm w-full">
            <div className="p-2 bg-blue-500 rounded-lg text-white flex-shrink-0">
              <User size={18} className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Client</p>
              <p className="text-sm font-semibold text-gray-900 break-words">{customer?.name}</p>
              <p className="text-xs text-gray-600 mt-1">{customer?.phone}</p>
            </div>
          </div>
          
          {/* Carte Date d'échéance */}
          <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl shadow-sm w-full">
            <div className="p-2 bg-amber-500 rounded-lg text-white flex-shrink-0">
              <Clock size={18} className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Échéance</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(order.dueDate)}</p>
              {new Date() > order.dueDate && order.status !== 'livre' && order.status !== 'annule' && (
                <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                  ⚠️ En retard
                </p>
              )}
            </div>
          </div>
          
          {/* Carte Statut de paiement */}
          <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-sm w-full">
            <div className="p-2 bg-green-500 rounded-lg text-white flex-shrink-0">
              {getPaymentMethodIcon(order.paymentMethod || 'cash')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Paiement</p>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {getPaymentMethodLabel(order.paymentMethod || 'cash')}
              </p>
              {order.paid && (
                <p className="text-xs font-bold text-green-600">
                  ✅ Payé
                </p>
              )}
            </div>
          </div>
        </div>
        
        {!isCompleted && (
          <div className="mb-6 sm:mb-8 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                Statut de la commande
              </h4>
              {!isUpdatingStatus ? (
                <button
                  onClick={() => setIsUpdatingStatus(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-md hover:shadow-lg"
                >
                  <Edit size={14} />
                  Modifier le statut
                </button>
              ) : (
                <button
                  onClick={saveStatusChange}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm shadow-md hover:shadow-lg"
                >
                  ✓ Enregistrer
                </button>
              )}
            </div>
            
            {isUpdatingStatus ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {statuses.map(status => (
                  <button
                    key={status}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      newStatus === status 
                        ? `${getStatusColor(status)} shadow-lg transform scale-105` 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                    }`}
                    onClick={() => handleStatusChange(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative">
                {/* Barre de progression */}
                <div className="overflow-hidden h-3 sm:h-4 mb-4 text-xs flex rounded-full bg-gray-300 shadow-inner">
                  {statuses.slice(0, 7).map((status, index) => {
                    const statusIndex = statuses.indexOf(order.status);
                    const isActive = index <= statusIndex && statusIndex < 7;
                    return (
                      <div
                        key={status}
                        className={`flex flex-col justify-center transition-all duration-500 ${
                          isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
                        }`}
                        style={{ width: `${100 / 7}%` }}
                      ></div>
                    );
                  })}
                </div>
                
                {/* Labels */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-medium">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Début
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 font-medium">
                    Prêt à récupérer
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                </div>
                
                {/* Statut actuel */}
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">Statut actuel :</p>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Détails de la commande</h4>
          </div>
          
          {/* Version Desktop - Tableau */}
          <div className="hidden sm:block overflow-hidden shadow-md ring-1 ring-gray-200 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Qté
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Prix unit.
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orderServices.map((service, index) => {
                  const quantity = (service as any).quantity || 1;
                  const totalPrice = service.price * quantity;
                  
                  return (
                    <tr key={index} className="hover:bg-blue-50 transition-colors">
                      <td className="py-4 pl-6 pr-3 text-sm">
                        <div className="font-semibold text-gray-900">{service.name}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="line-clamp-2">{service.description}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 text-right font-medium">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                          {quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(service.price)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(totalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <td colSpan={4} className="py-4 pl-6 pr-3 text-right text-sm font-bold text-gray-900 uppercase">
                    Montant total :
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Version Mobile - Cartes */}
          <div className="sm:hidden space-y-3">
            {orderServices.map((service, index) => {
              const quantity = (service as any).quantity || 1;
              const totalPrice = service.price * quantity;
              
              return (
                <div key={index} className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-blue-100 p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-gray-900 text-sm mb-2">{service.name}</h5>
                      <p className="text-xs text-gray-600 leading-relaxed break-words">{service.description}</p>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      x{quantity}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">{formatCurrency(service.price)}</span> / unité
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Total</div>
                      <div className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Total Mobile */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold uppercase text-sm">Montant Total</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
          
          {order.notes && (
            <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 mb-2">📝 Notes de la commande</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{order.notes}</p>
                </div>
              </div>
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