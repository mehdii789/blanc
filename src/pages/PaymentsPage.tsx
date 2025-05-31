import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const PaymentsPage: React.FC = () => {
  const { orders, customers } = useApp();
  
  // Filter paid orders
  const paidOrders = orders.filter(order => order.paid); // Commandes payées
  
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Client inconnu';
  };
  
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Résumé des paiements</h2>
            <p className="text-sm text-gray-500 mt-1">Aperçu des performances financières</p>
          </div>
          <div className="mt-4 md:mt-0">
            <select className="block w-full md:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
              <option>Ce mois-ci</option>
              <option>Le mois dernier</option>
              <option>Cette année</option>
              <option>Tout le temps</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 auto-rows-fr w-full">
          <div className="h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-5 rounded-xl border border-blue-100 flex flex-col">
            <div className="min-h-[60px]">
              <p className="text-xs sm:text-sm font-medium text-blue-700">Chiffre d'affaires</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="flex items-center mt-4 pt-3 text-xs sm:text-sm text-blue-600 border-t border-blue-100">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>12% vs mois dernier</span>
            </div>
          </div>
          
          <div className="h-full w-full bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-5 rounded-xl border border-green-100 flex flex-col">
            <div className="min-h-[60px]">
              <p className="text-xs sm:text-sm font-medium text-green-700">Commandes payées</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 mt-1">{paidOrders.length}</p>
            </div>
            <div className="flex items-center mt-4 pt-3 text-xs sm:text-sm text-green-600 border-t border-green-100">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>8% vs mois dernier</span>
            </div>
          </div>
          
          <div className="h-full w-full bg-gradient-to-br from-amber-50 to-amber-100 p-4 sm:p-5 rounded-xl border border-amber-100 flex flex-col">
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-700">Panier moyen</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">{paidOrders.length > 0 ? formatCurrency(totalRevenue / paidOrders.length) : formatCurrency(0)}</p>
            </div>
            <div className="flex items-center mt-4 pt-3 text-xs sm:text-sm text-amber-600 border-t border-amber-100">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>5% vs mois dernier</span>
            </div>
          </div>
          
          <div className="h-full w-full bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-5 rounded-xl border border-red-100 flex flex-col">
            <div>
              <p className="text-xs sm:text-sm font-medium text-red-700">En attente</p>
              <p className="text-xl sm:text-2xl font-bold text-red-900 mt-1">{orders.length - paidOrders.length}</p>
            </div>
            <div className="flex items-center mt-4 pt-3 text-xs sm:text-sm text-red-600 border-t border-red-100">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span>3% vs mois dernier</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Historique des paiements</h2>
        
        {/* Version mobile */}
        <div className="md:hidden space-y-4">
          {paidOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Aucun enregistrement de paiement trouvé
            </div>
          ) : (
            paidOrders.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Commande #{order.id}</p>
                    <p className="text-sm text-gray-600">{getCustomerName(order.customerId)}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Payé
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900">{formatDate(order.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Montant</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Version desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° de commande
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paidOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">#{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getCustomerName(order.customerId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(order.updatedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Payé
                    </span>
                  </td>
                </tr>
              ))}
              
              {paidOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucun enregistrement de paiement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};