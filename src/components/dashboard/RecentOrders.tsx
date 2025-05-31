import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const RecentOrders: React.FC = () => {
  const { orders, customers, setActiveView, setSelectedOrderId } = useApp();
  
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Client inconnu';
  };
  
  const getStatusColor = (status: string) => {
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
  
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveView('orders');
  };
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-800 text-center sm:text-left">Commandes récentes</h3>
        <button 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full sm:w-auto text-center"
          onClick={() => setActiveView('orders')}
        >
          Voir tout
        </button>
      </div>
      
      {/* Version Desktop - Tableau */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Commande</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
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
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status === 'en_attente' ? 'En attente' :
                     order.status === 'en_traitement' ? 'En traitement' :
                     order.status === 'lavage' ? 'Lavage' :
                     order.status === 'sechage' ? 'Séchage' :
                     order.status === 'pliage' ? 'Pliage' :
                     order.status === 'pret' ? 'Prêt' :
                     order.status === 'livre' ? 'Livré' :
                     'Annulé'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewOrder(order.id);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Version Mobile - Cartes */}
      <div className="sm:hidden space-y-3">
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <div 
              key={order.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleViewOrder(order.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">Commande #{order.id}</p>
                  <p className="text-sm text-gray-500 mt-1">{getCustomerName(order.customerId)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status === 'en_attente' ? 'En attente' :
                       order.status === 'en_traitement' ? 'En traitement' :
                       order.status === 'lavage' ? 'Lavage' :
                       order.status === 'sechage' ? 'Séchage' :
                       order.status === 'pliage' ? 'Pliage' :
                       order.status === 'pret' ? 'Prêt' :
                       order.status === 'livre' ? 'Livré' :
                       'Annulé'}
                    </span>
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
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                >
                  Détails <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">
            Aucune commande récente
          </div>
        )}
      </div>
    </div>
  );
};