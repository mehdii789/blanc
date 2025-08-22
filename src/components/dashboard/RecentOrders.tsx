import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Order } from '../../types';

interface RecentOrdersProps {
  orders: Order[];
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  const { customers, setSelectedOrderId } = useApp();
  const navigate = useNavigate();
  
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
    navigate(`/orders/${orderId}`);
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-end mb-4 gap-3">
        <button 
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium w-full sm:w-auto text-center flex-shrink-0"
          onClick={() => navigate('/orders')}
        >
          Voir tout
        </button>
      </div>
      
      {/* Version Desktop - Tableau */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {getCustomerName(order.customerId)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
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
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrder(order.id);
                      }}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Version Mobile/Tablette - Cartes */}
      <div className="lg:hidden space-y-3">
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <div 
              key={order.id}
              className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
              onClick={() => handleViewOrder(order.id)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">Commande #{order.id}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{getCustomerName(order.customerId)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
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
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewOrder(order.id);
                  }}
                  className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Détails 
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Aucune commande pour cette période</p>
          </div>
        )}
      </div>
    </div>
  );
};