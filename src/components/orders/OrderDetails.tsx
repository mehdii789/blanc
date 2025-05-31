import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Edit, Printer, CreditCard, MessageCircle, Clock, User } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OrderStatus } from '../../types';

interface OrderDetailsProps {
  orderId: string;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId }) => {
  const { 
    orders, 
    customers, 
    setSelectedOrderId, 
    updateOrderStatus,
    updateOrder 
  } = useApp();
  
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Commande non trouvée</p>
        <button
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
          onClick={() => setSelectedOrderId(null)}
        >
          Retour à la liste des commandes
        </button>
      </div>
    );
  }
  
  const customer = customers.find(c => c.id === order.customerId);
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  
  const handleStatusChange = (status: OrderStatus) => {
    setNewStatus(status);
  };
  
  const saveStatusChange = () => {
    updateOrderStatus(orderId, newStatus);
    setIsUpdatingStatus(false);
  };
  
  const togglePaidStatus = () => {
    updateOrder({
      ...order,
      paid: !order.paid
    });
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
  
  const isCompleted = order.status === 'livre' || order.status === 'annule';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          onClick={() => setSelectedOrderId(null)}
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
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Printer size={16} />
              <span>Imprimer le reçu</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <MessageCircle size={16} />
              <span>Envoyer une notification</span>
            </button>
            <button
              onClick={togglePaidStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                order.paid 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <CreditCard size={16} />
              <span>{order.paid ? 'Marqué comme payé' : 'Marquer comme payé'}</span>
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
              <CreditCard size={18} className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Paiement</p>
              <p className={`text-sm font-medium ${order.paid ? 'text-green-600' : 'text-red-600'}`}>
                {order.paid ? 'Payé' : 'Non payé'}
              </p>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsUpdatingStatus(false)}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Annuler
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
                      <th scope="col" className="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">
                        Prix
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {order.services.map((service, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 pl-6 pr-3 text-sm font-medium text-gray-900 sm:whitespace-nowrap">
                          <div className="font-medium">{service.name}</div>
                          <div className="sm:hidden text-gray-500 text-xs mt-1">
                            {service.description}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {service.description}
                        </td>
                        <td className="py-3 px-6 text-right text-sm font-medium text-gray-900 whitespace-nowrap">
                          {formatCurrency(service.price)}
                        </td>
                      </tr>
                    ))}
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
    </div>
  );
};