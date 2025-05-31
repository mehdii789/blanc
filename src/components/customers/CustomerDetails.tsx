import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface CustomerDetailsProps {
  customerId: string;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customerId }) => {
  const { customers, orders, setSelectedCustomerId } = useApp();
  
  const customer = customers.find(c => c.id === customerId);
  
  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Client non trouvé</p>
        <button
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
          onClick={() => setSelectedCustomerId(null)}
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
          onClick={() => setSelectedCustomerId(null)}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700 mt-0.5">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Téléphone</p>
              <p className="text-gray-900">{customer.phone}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-700 mt-0.5">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">E-mail</p>
              <p className="text-gray-900">{customer.email}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700 mt-0.5">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Adresse</p>
              <p className="text-gray-900">{customer.address}</p>
            </div>
          </div>
        </div>
        
        {customer.notes && (
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{customer.notes}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 mb-1">Dépense totale</h4>
            <p className="text-2xl font-bold text-blue-900">${totalSpent.toFixed(2)}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-700 mb-1">Total des commandes</h4>
            <p className="text-2xl font-bold text-green-900">{totalOrders}</p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-amber-700 mb-1">Commandes en attente</h4>
            <p className="text-2xl font-bold text-amber-900">{pendingOrders}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Historique des commandes</h3>
        
        {sortedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° de commande
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">#{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        <span>Due: {formatDate(order.dueDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.services.map(service => service.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.paid ? 'Payé' : 'Non payé'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status === 'livre' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Livré
                        </span>
                      ) : order.status === 'annule' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
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
        ) : (
          <p className="text-center py-6 text-gray-500">No order history found</p>
        )}
      </div>
    </div>
  );
};