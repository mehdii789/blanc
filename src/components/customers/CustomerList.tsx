import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { CustomerForm } from './CustomerForm';
import { Search, UserPlus, Edit, Trash, Mail, Phone, MapPin } from 'lucide-react';

interface CustomerListProps {
  onSelectCustomer?: (customerId: string) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer }) => {
  const { customers, deleteCustomer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleViewCustomer = (customerId: string) => {
    onSelectCustomer?.(customerId);
  };
  
  const handleEditCustomer = (customerId: string) => {
    setEditingCustomerId(customerId);
    setShowAddForm(true);
  };
  
  return (
    <div className="p-4 md:p-0">
      {showAddForm ? (
        <CustomerForm 
          customerId={editingCustomerId} 
          onClose={() => {
            setShowAddForm(false);
            setEditingCustomerId(null);
          }} 
        />
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Rechercher des clients..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
              onClick={() => setShowAddForm(true)}
            >
              <UserPlus size={18} />
              <span>Ajouter un client</span>
            </button>
          </div>
          
          <div className="space-y-4 md:space-y-0">
            {filteredCustomers.length > 0 ? (
              <>
                {/* Version mobile */}
                <div className="md:hidden space-y-3">
                  {filteredCustomers.map((customer) => (
                    <div 
                      key={customer.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                      onClick={() => handleViewCustomer(customer.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                        <div className="flex space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCustomer(customer.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${customer.name}" ?`)) {
                                try {
                                  await deleteCustomer(customer.id);
                                } catch (error) {
                                  console.error('Erreur lors de la suppression du client:', error);
                                  alert('Une erreur est survenue lors de la suppression du client.');
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          <span>{customer.email || 'Aucun email'}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          <span>{customer.phone || 'Aucun téléphone'}</span>
                        </div>
                        {customer.address && (
                          <div className="flex items-start">
                            <MapPin size={14} className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{customer.address}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-2 text-xs text-gray-500 border-t border-gray-100">
                        Client depuis le {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Version desktop */}
                <div className="hidden md:block bg-white shadow-sm rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Adresse
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Depuis
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr 
                          key={customer.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewCustomer(customer.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{customer.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{customer.address}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCustomer(customer.id);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${customer.name}" ?`)) {
                                  try {
                                    await deleteCustomer(customer.id);
                                  } catch (error) {
                                    console.error('Erreur lors de la suppression du client:', error);
                                    alert('Une erreur est survenue lors de la suppression du client.');
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Trash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm">
                Aucun client trouvé
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};