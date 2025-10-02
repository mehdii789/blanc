import React from 'react';
import { useApp } from '../../hooks/useApp';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface CustomerDetailsProps {
  customerId: string;
  onBack?: () => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customerId, onBack }) => {
  const { customers, orders } = useApp();
  
  const customer = customers.find(c => c.id === customerId);
  
  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Client non trouvé</p>
        <button
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
          onClick={onBack}
        >
          Retour à la liste des clients
        </button>
      </div>
    );
  }
  
  // Get customer's orders
  const customerOrders = orders.filter(order => order.customerId === customerId);
  
  // Sort by date (most recent first)
  const sortedOrders = [...customerOrders].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  
  // Calculate customer metrics
  const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = customerOrders.length;
  const pendingOrders = customerOrders.filter(
    order => order.status !== 'livre' && order.status !== 'annule'
  ).length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          onClick={onBack}
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Détails du client</h2>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{customer.name}</h3>
            <p className="text-gray-500">Client depuis le {formatDate(customer.createdAt)}</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Edit size={16} />
            <span>Modifier</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full">
          <div className="flex-1 min-w-0 bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-700 flex-shrink-0">
                <Phone size={18} />
              </div>
              <p className="text-sm text-gray-500 font-medium">Téléphone</p>
            </div>
            <p className="text-gray-900 break-words pl-11">{customer.phone}</p>
          </div>
          
          <div className="flex-1 min-w-0 bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg text-green-700 flex-shrink-0">
                <Mail size={18} />
              </div>
              <p className="text-sm text-gray-500 font-medium">E-mail</p>
            </div>
            <p className="text-gray-900 break-words pl-11 truncate">{customer.email}</p>
          </div>
          
          <div className="flex-1 min-w-0 bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-700 flex-shrink-0">
                <MapPin size={18} />
              </div>
              <p className="text-sm text-gray-500 font-medium">Adresse</p>
            </div>
            <p className="text-gray-900 break-words pl-11">{customer.address}</p>
          </div>
        </div>
        
        {customer.notes && (
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{customer.notes}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="bg-blue-50 p-4 rounded-lg flex flex-col h-full w-full">
            <h4 className="text-sm font-medium text-blue-700 mb-2">Dépense totale</h4>
            <p className="text-2xl font-bold text-blue-900 mt-auto">${totalSpent.toFixed(2)}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg flex flex-col h-full w-full">
            <h4 className="text-sm font-medium text-green-700 mb-2">Total des commandes</h4>
            <p className="text-2xl font-bold text-green-900 mt-auto">{totalOrders}</p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg flex flex-col h-full w-full">
            <h4 className="text-sm font-medium text-amber-700 mb-2">Commandes en attente</h4>
            <p className="text-2xl font-bold text-amber-900 mt-auto">{pendingOrders}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Historique des commandes</h3>
        
        {sortedOrders.length > 0 ? (
          <div className="overflow-hidden">
            {/* Version mobile */}
            <div className="md:hidden space-y-4">
              {sortedOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Commande #{order.id}</h4>
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{order.paid ? 'Payé' : 'Non payé'}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-2">
                    <div className="font-medium mb-1">Services :</div>
                    <div className="line-clamp-2">
                      {order.services.map(service => service.name).join(', ')}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock size={12} className="mr-1" />
                      <span>Échéance: {formatDate(order.dueDate)}</span>
                    </div>
                    <div>
                      {order.status === 'livre' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Livré
                        </span>
                      ) : order.status === 'annule' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Annulé
                        </span>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'en_attente' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Version desktop */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° commande
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Services
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium text-sm text-gray-900">#{order.id}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            <span>Due: {formatDate(order.dueDate)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {order.services.map(service => service.name).join(', ')}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${order.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.paid ? 'Payé' : 'Non payé'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {order.status === 'livre' ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Livré
                            </span>
                          ) : order.status === 'annule' ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Annulé
                            </span>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'en_attente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-6 text-gray-500">No order history found</p>
        )}
      </div>
    </div>
  );
};