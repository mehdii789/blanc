import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientAccess, Customer, ClientOrder } from '../types';
import { useApp } from '../hooks/useApp';

const ClientOrdersPage: React.FC = () => {
  const { clientOrders } = useApp();
  const [currentClientAccess, setCurrentClientAccess] = useState<ClientAccess | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAccess = sessionStorage.getItem('clientAccess');
    const storedCustomer = sessionStorage.getItem('clientCustomer');
    
    if (!storedAccess || !storedCustomer) {
      navigate('/client-login');
      return;
    }

    setCurrentClientAccess(JSON.parse(storedAccess));
    setCustomer(JSON.parse(storedCustomer));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('clientAccess');
    sessionStorage.removeItem('clientCustomer');
    navigate('/client-login');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      en_attente: 'En attente',
      en_traitement: 'En traitement',
      lavage: 'En lavage',
      sechage: 'En séchage',
      pliage: 'En pliage',
      pret: 'Prêt',
      livre: 'Livré',
      annule: 'Annulé'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      en_traitement: 'bg-blue-100 text-blue-800 border-blue-200',
      lavage: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      sechage: 'bg-purple-100 text-purple-800 border-purple-200',
      pliage: 'bg-pink-100 text-pink-800 border-pink-200',
      pret: 'bg-green-100 text-green-800 border-green-200',
      livre: 'bg-gray-100 text-gray-800 border-gray-200',
      annule: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      en_attente: '⏳',
      en_traitement: '🔄',
      lavage: '🧺',
      sechage: '🌪️',
      pliage: '👕',
      pret: '✅',
      livre: '🚚',
      annule: '❌'
    };
    return icons[status as keyof typeof icons] || '📋';
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  const userOrders = currentClientAccess 
    ? clientOrders.filter(order => order.clientAccessId === currentClientAccess.id)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-white/30 sticky top-0 z-50 transition-all duration-300 hover:shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 lg:py-4">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-10 w-10 lg:h-12 lg:w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
                  <svg className="h-6 w-6 lg:h-7 lg:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent">Mes Commandes</h1>
                <p className="text-sm lg:text-base text-gray-600 font-medium flex items-center">
                  <span className="relative inline-flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Bienvenue, <span className="ml-1 font-semibold text-indigo-600">{customer.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate('/client-portal')}
                className="px-4 py-2.5 lg:px-5 lg:py-2.5 text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour au portail</span>
              </button>
              
              <div className="hidden sm:block relative group">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2.5 lg:px-5 lg:py-2.5 text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium group-hover:translate-x-0.5"
                >
                  <svg className="h-4 w-4 mr-1.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Déconnexion</span>
                </button>
              </div>
              
              <button
                onClick={handleLogout}
                className="sm:hidden p-2.5 text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label="Déconnexion"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {userOrders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-8 lg:p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Aucune commande pour le moment</h2>
            <p className="text-gray-600 mb-8">Vous n'avez pas encore passé de commande. Découvrez nos packs de services !</p>
            <button
              onClick={() => navigate('/client-portal')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Découvrir nos services
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 lg:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Historique de vos commandes
              </h2>
              <p className="text-gray-600 text-lg">
                Suivez l'état d'avancement de vos commandes en temps réel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userOrders.map((order, index) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        Commande #{order.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{order.totalAmount.toFixed(2)}€</p>
                      <p className="text-xs text-gray-500">TTC</p>
                    </div>
                  </div>

                  <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border mb-4 ${getStatusColor(order.status)}`}>
                    <span className="mr-2 text-base">{getStatusIcon(order.status)}</span>
                    {getStatusLabel(order.status)}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 text-sm">Packs commandés :</h4>
                    {order.packs.map((pack, i) => (
                      <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-3">
                        <span className="text-gray-600 flex-1">
                          {pack.packName}
                          {pack.quantity > 1 && (
                            <span className="text-gray-400 ml-1">x{pack.quantity}</span>
                          )}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {pack.total.toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Note :</span> {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOrdersPage;
