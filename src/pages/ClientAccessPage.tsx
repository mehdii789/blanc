import React, { useState, useEffect, useMemo } from 'react';
import { mockCustomers } from '../data/mockData';
import { ClientAccess, Customer } from '../types';
import { useApp } from '../hooks/useApp';

const ClientAccessPage: React.FC = () => {
  const { clientAccess, addClientAccess, updateClientAccess, deleteClientAccess, customers } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newAccessCode, setNewAccessCode] = useState('');

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Client inconnu';
  };

  const getCustomerEmail = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.email : '';
  };

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateAccess = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      alert('Veuillez sélectionner un client');
      return;
    }

    // Vérifier si le client a déjà un accès
    const existingAccess = clientAccess.find(access => access.customerId === selectedCustomerId);
    if (existingAccess) {
      alert('Ce client a déjà un code d\'accès');
      return;
    }

    const accessCode = newAccessCode || generateAccessCode();
    
    // Vérifier l'unicité du code
    const codeExists = clientAccess.find(access => access.accessCode === accessCode);
    if (codeExists) {
      alert('Ce code d\'accès existe déjà');
      return;
    }

    addClientAccess({
      customerId: selectedCustomerId,
      accessCode: accessCode,
      isActive: true
    });
    setSelectedCustomerId('');
    setNewAccessCode('');
    setShowCreateForm(false);
  };

  const toggleAccessStatus = (accessId: string) => {
    const accessToUpdate = clientAccess.find(access => access.id === accessId);
    if (accessToUpdate) {
      updateClientAccess({ ...accessToUpdate, isActive: !accessToUpdate.isActive });
    }
  };

  const deleteAccess = (accessId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet accès ?')) {
      deleteClientAccess(accessId);
    }
  };

  console.log('Tous les clients:', customers);
  console.log('Accès clients actuels:', clientAccess);
  
  // Vérifier que les clients sont bien chargés
  useEffect(() => {
    console.log('ClientAccessPage - Liste des clients:', customers);
    console.log('ClientAccessPage - Accès clients actuels:', clientAccess);
  }, [customers, clientAccess]);

  // Filtrer les clients qui n'ont pas encore d'accès
  const availableCustomers = useMemo(() => {
    const available = customers.filter(customer => 
      !clientAccess.some(access => access.customerId === customer.id)
    );
    console.log('Clients disponibles pour accès:', available);
    return available;
  }, [customers, clientAccess]);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🔐 Gestion des Accès Clients</h1>
          <p className="text-sm sm:text-base text-gray-600">Créez et gérez les codes d'accès sécurisés pour vos clients</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Créer un accès
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-200 w-full">
          <div className="flex flex-col items-center text-center justify-center h-full min-h-[120px]">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">Total Accès</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">{clientAccess.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-200 w-full">
          <div className="flex flex-col items-center text-center justify-center h-full min-h-[120px]">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-3 shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">Actifs</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-900">
              {clientAccess.filter(access => access.isActive).length}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-amber-200 w-full">
          <div className="flex flex-col items-center text-center justify-center h-full min-h-[120px]">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mb-3 shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">Inactifs</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-900">
              {clientAccess.filter(access => !access.isActive).length}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-purple-200 w-full">
          <div className="flex flex-col items-center text-center justify-center h-full min-h-[120px]">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-3 shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wide">Connexions<br/>récentes</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-900">
              {clientAccess.filter(access => access.lastLogin && 
                new Date(access.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
              ).length}
            </p>
          </div>
        </div>
      </div>

      {/* Liste des accès - Version Cards pour mobile, Table pour desktop */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Liste des Accès</h2>
        </div>

        {/* Version Mobile - Cartes */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {clientAccess.map((access) => (
              <div key={access.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                      {getCustomerName(access.customerId)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {getCustomerEmail(access.customerId)}
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    access.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {access.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Code d'accès</p>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {access.accessCode}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Créé le</p>
                    <p className="text-xs text-gray-900">
                      {new Date(access.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Dernière connexion</p>
                    <p className="text-xs text-gray-900">
                      {access.lastLogin 
                        ? new Date(access.lastLogin).toLocaleDateString('fr-FR')
                        : 'Jamais connecté'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAccessStatus(access.id)}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      access.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {access.isActive ? '🔒 Désactiver' : '✅ Activer'}
                  </button>
                  <button
                    onClick={() => deleteAccess(access.id)}
                    className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version Desktop - Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code d'accès
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientAccess.map((access) => (
                <tr key={access.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getCustomerName(access.customerId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getCustomerEmail(access.customerId)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {access.accessCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      access.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {access.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {access.lastLogin 
                      ? new Date(access.lastLogin).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(access.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => toggleAccessStatus(access.id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          access.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {access.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => deleteAccess(access.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <form onSubmit={handleCreateAccess} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Créer un Accès Client</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {availableCustomers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code d'accès (optionnel)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAccessCode}
                      onChange={(e) => setNewAccessCode(e.target.value.toUpperCase())}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Laisser vide pour génération automatique"
                      maxLength={10}
                    />
                    <button
                      type="button"
                      onClick={() => setNewAccessCode(generateAccessCode())}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Générer
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Créer l'accès
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAccessPage;
