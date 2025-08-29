import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServicePack, PackCategory, ClientAccess, Customer, ClientOrder } from '../types';
import { useApp } from '../context/AppContext';

const ClientPortalPage: React.FC = () => {
  const { servicePacks, clientOrders, addClientOrder, customers, inventoryItems, checkClientOrderInventory } = useApp();
  const [currentClientAccess, setCurrentClientAccess] = useState<ClientAccess | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PackCategory | 'all'>('all');
  const [cart, setCart] = useState<{ pack: ServicePack; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
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

  const filteredPacks = servicePacks.filter(pack => 
    pack.isActive && (selectedCategory === 'all' || pack.category === selectedCategory)
  );

  const checkPackAvailability = (pack: ServicePack, quantity: number = 1) => {
    if (!currentClientAccess || !customer) return { available: false, shortages: [] };
    
    const testOrder = {
      id: 'test',
      clientAccessId: currentClientAccess.id,
      customerId: customer.id,
      packs: [{
        packId: pack.id,
        packName: pack.name,
        quantity: quantity,
        unitPrice: pack.totalPrice,
        total: pack.totalPrice * quantity
      }],
      totalAmount: pack.totalPrice * quantity,
      status: 'en_attente' as const,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return checkClientOrderInventory(testOrder);
  };

  const addToCart = (pack: ServicePack) => {
    const existingItem = cart.find(item => item.pack.id === pack.id);
    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
    
    // VÃ©rifier la disponibilitÃ© avant d'ajouter au panier
    const availability = checkPackAvailability(pack, newQuantity);
    if (!availability.available) {
      alert(`Stock insuffisant pour ce pack. Articles manquants: ${availability.shortages.map(s => `${s.itemName} (requis: ${s.required}, disponible: ${s.available})`).join(', ')}`);
      return;
    }
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.pack.id === pack.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { pack, quantity: 1 }]);
    }
  };

  const removeFromCart = (packId: string) => {
    setCart(cart.filter(item => item.pack.id !== packId));
  };

  const updateQuantity = (packId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(packId);
    } else {
      setCart(cart.map(item => 
        item.pack.id === packId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.pack.totalPrice * item.quantity), 0);
  };

  const handleOrder = async () => {
    if (cart.length === 0 || !currentClientAccess || !customer) return;
    
    setIsProcessingOrder(true);
    setOrderError(null);

    try {
      // CrÃ©er une nouvelle commande via le contexte
      addClientOrder({
        clientAccessId: currentClientAccess.id,
        customerId: customer.id,
        packs: cart.map(item => ({
          packId: item.pack.id,
          packName: item.pack.name,
          quantity: item.quantity,
          unitPrice: item.pack.totalPrice,
          total: item.pack.totalPrice * item.quantity
        })),
        totalAmount: getTotalAmount(),
        status: 'en_attente',
        notes: 'Commande passÃ©e via le portail client'
      });

      setCart([]);
      setShowCart(false);
      
      alert('Commande passÃ©e avec succÃ¨s! Vous recevrez une confirmation par email.');
    } catch (error) {
      console.error('Erreur lors de la crÃ©ation de la commande:', error);
      setOrderError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la crÃ©ation de la commande.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const getCategoryLabel = (category: PackCategory) => {
    const labels = {
      standard: 'Standard',
      express: 'Express',
      premium: 'Premium',
      literie: 'Literie',
      professionnel: 'Professionnel'
    };
    return labels[category];
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      en_attente: 'En attente',
      en_traitement: 'En traitement',
      lavage: 'En lavage',
      sechage: 'En sÃ©chage',
      pliage: 'En pliage',
      pret: 'PrÃªt',
      livre: 'LivrÃ©',
      annule: 'AnnulÃ©'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      en_traitement: 'bg-blue-100 text-blue-800',
      lavage: 'bg-indigo-100 text-indigo-800',
      sechage: 'bg-purple-100 text-purple-800',
      pliage: 'bg-pink-100 text-pink-800',
      pret: 'bg-green-100 text-green-800',
      livre: 'bg-gray-100 text-gray-800',
      annule: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 lg:h-12 lg:w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg transform hover:scale-105 transition-transform">
                <svg className="h-6 w-6 lg:h-7 lg:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Portail Client</h1>
                <p className="text-sm lg:text-base text-gray-600 font-medium">Bienvenue, {customer.name} âœ¨</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 lg:space-x-4">
              <button
                onClick={() => setShowCart(true)}
                className="relative p-3 lg:p-4 text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center px-4 py-2 lg:px-6 lg:py-3 text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium"
              >
                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                DÃ©connexion
              </button>
              <button
                onClick={handleLogout}
                className="sm:hidden p-3 text-gray-600 hover:text-white bg-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Catalogue des packs */}
          <div className="xl:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Nos Packs de Services</h2>
                <p className="text-gray-600 text-lg">Choisissez le pack qui vous convient le mieux âœ¨</p>
              </div>
              
              {/* Filtres par catÃ©gorie */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200'
                      : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-xl border border-gray-200'
                  }`}
                >
                  ðŸŒŸ Tous
                </button>
                {[
                  { key: 'standard', label: 'Standard', emoji: 'ðŸ“¦' },
                  { key: 'express', label: 'Express', emoji: 'âš¡' },
                  { key: 'premium', label: 'Premium', emoji: 'ðŸ’Ž' },
                  { key: 'literie', label: 'Literie', emoji: 'ðŸ›ï¸' },
                  { key: 'professionnel', label: 'Professionnel', emoji: 'ðŸ’¼' }
                ].map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as PackCategory)}
                    className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      selectedCategory === key
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200'
                        : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-xl border border-gray-200'
                    }`}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>

              {/* Liste des packs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPacks.map((pack, index) => {
                  const availability = checkPackAvailability(pack, 1);
                  const categoryConfig = {
                    express: { gradient: 'from-orange-500 to-red-500', emoji: 'âš¡', bgGradient: 'from-orange-50 to-red-50' },
                    premium: { gradient: 'from-purple-500 to-pink-500', emoji: 'ðŸ’Ž', bgGradient: 'from-purple-50 to-pink-50' },
                    literie: { gradient: 'from-green-500 to-teal-500', emoji: 'ðŸ›ï¸', bgGradient: 'from-green-50 to-teal-50' },
                    professionnel: { gradient: 'from-blue-500 to-indigo-500', emoji: 'ðŸ’¼', bgGradient: 'from-blue-50 to-indigo-50' },
                    standard: { gradient: 'from-gray-500 to-gray-600', emoji: 'ðŸ“¦', bgGradient: 'from-gray-50 to-gray-100' }
                  };
                  const config = categoryConfig[pack.category] || categoryConfig.standard;
                  
                  return (
                    <div 
                      key={pack.id} 
                      className={`group relative bg-gradient-to-br ${config.bgGradient} rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/50 hover:border-white/80 animate-fade-in`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Badge catÃ©gorie flottant */}
                      <div className={`absolute -top-3 -right-3 bg-gradient-to-r ${config.gradient} text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300`}>
                        {config.emoji} {getCategoryLabel(pack.category)}
                      </div>
                      
                      {/* En-tÃªte du pack */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">{pack.name}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{pack.description}</p>
                      </div>
                      
                      {/* Services inclus */}
                      <div className="bg-white/60 rounded-xl p-4 mb-4 backdrop-blur-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <span className="mr-2">ðŸ“‹</span> Services inclus
                        </h4>
                        <div className="space-y-2">
                          {pack.services.map(service => (
                            <div key={service.serviceId} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 flex-1">
                                {service.serviceName} x{service.quantity}
                              </span>
                              <span className="font-semibold text-gray-900 bg-white/80 px-2 py-1 rounded-lg">
                                {(service.quantity * service.unitPrice).toFixed(2)}â‚¬
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prix et action */}
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="flex items-baseline mb-1">
                            <span className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                              {pack.totalPrice.toFixed(2)}â‚¬
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            DÃ©lai: {pack.estimatedTime}h
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <button
                            onClick={() => addToCart(pack)}
                            disabled={!availability.available}
                            className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                              availability.available
                                ? `bg-gradient-to-r ${config.gradient} text-white hover:opacity-90`
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {availability.available ? (
                              <span className="flex items-center">
                                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Ajouter
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Stock insuffisant
                              </span>
                            )}
                          </button>
                          {!availability.available && (
                            <p className="text-[10px] text-red-600 mt-1 text-center">
                              âš ï¸ Articles manquants
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mes commandes */}
          <div className="xl:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-24">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Mes Commandes</h3>
                <div className="w-12 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto"></div>
              </div>
              {currentClientAccess && clientOrders.filter(order => order.clientAccessId === currentClientAccess.id).length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Aucune commande pour le moment</p>
                  <p className="text-gray-400 text-xs mt-1">Vos commandes apparaÃ®tront ici ðŸ“¦</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {currentClientAccess && clientOrders
                    .filter(order => order.clientAccessId === currentClientAccess.id)
                    .slice(0, 5)
                    .map((order, index) => {
                      const statusConfig = {
                        en_attente: { color: 'from-yellow-400 to-orange-400', icon: 'â³', bg: 'from-yellow-50 to-orange-50' },
                        en_traitement: { color: 'from-blue-400 to-indigo-400', icon: 'ðŸ”„', bg: 'from-blue-50 to-indigo-50' },
                        lavage: { color: 'from-cyan-400 to-blue-400', icon: 'ðŸ§¼', bg: 'from-cyan-50 to-blue-50' },
                        sechage: { color: 'from-purple-400 to-pink-400', icon: 'ðŸŒªï¸', bg: 'from-purple-50 to-pink-50' },
                        pliage: { color: 'from-pink-400 to-rose-400', icon: 'ðŸ‘•', bg: 'from-pink-50 to-rose-50' },
                        pret: { color: 'from-green-400 to-emerald-400', icon: 'âœ…', bg: 'from-green-50 to-emerald-50' },
                        livre: { color: 'from-gray-400 to-gray-500', icon: 'ðŸ“¦', bg: 'from-gray-50 to-gray-100' },
                        annule: { color: 'from-red-400 to-red-500', icon: 'âŒ', bg: 'from-red-50 to-red-100' }
                      };
                      const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.en_attente;
                      
                      return (
                        <div 
                          key={order.id} 
                          className={`group relative bg-gradient-to-br ${config.bg} rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-102 border border-white/50 animate-slide-in`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {/* Badge statut */}
                          <div className={`absolute -top-2 -right-2 bg-gradient-to-r ${config.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center`}>
                            <span className="mr-1">{config.icon}</span>
                            {getStatusLabel(order.status)}
                          </div>
                          
                          {/* En-tÃªte commande */}
                          <div className="mb-3">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-bold text-gray-800 bg-white/60 px-2 py-1 rounded-lg">
                                #{order.id.slice(-6)}
                              </span>
                            </div>
                            
                            {/* Packs commandÃ©s */}
                            <div className="space-y-1">
                              {order.packs.map(pack => (
                                <div key={pack.packId} className="flex items-center text-sm text-gray-700">
                                  <span className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mr-2"></span>
                                  <span className="flex-1">{pack.packName}</span>
                                  <span className="bg-white/60 px-2 py-1 rounded-lg font-medium">x{pack.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Footer */}
                          <div className="flex justify-between items-center pt-3 border-t border-white/30">
                            <div className="flex items-center text-xs text-gray-500">
                              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </div>
                            <div className={`text-lg font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                              {order.totalAmount.toFixed(2)}â‚¬
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Panier */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 animate-scale-in">
            {/* Header du panier */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Mon Panier</h3>
                    <p className="text-white/80 text-sm">{cart.length} article{cart.length > 1 ? 's' : ''} sÃ©lectionnÃ©{cart.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">

              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-700 mb-2">Votre panier est vide</h4>
                  <p className="text-gray-500 mb-6">Ajoutez des packs pour commencer vos achats ðŸ›ï¸</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Continuer mes achats
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 mb-8">
                    {cart.map((item, index) => {
                      const categoryConfig = {
                        express: { gradient: 'from-orange-500 to-red-500', emoji: 'âš¡', bgGradient: 'from-orange-50 to-red-50' },
                        premium: { gradient: 'from-purple-500 to-pink-500', emoji: 'ðŸ’Ž', bgGradient: 'from-purple-50 to-pink-50' },
                        literie: { gradient: 'from-green-500 to-teal-500', emoji: 'ðŸ›ï¸', bgGradient: 'from-green-50 to-teal-50' },
                        professionnel: { gradient: 'from-blue-500 to-indigo-500', emoji: 'ðŸ’¼', bgGradient: 'from-blue-50 to-indigo-50' },
                        standard: { gradient: 'from-gray-500 to-gray-600', emoji: 'ðŸ“¦', bgGradient: 'from-gray-50 to-gray-100' }
                      };
                      const config = categoryConfig[item.pack.category] || categoryConfig.standard;
                      
                      return (
                        <div 
                          key={item.pack.id} 
                          className={`group bg-gradient-to-br ${config.bgGradient} rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300 animate-slide-in`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Info du pack */}
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-3">{config.emoji}</span>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">{item.pack.name}</h4>
                                  <p className="text-sm text-gray-600">{item.pack.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center mt-3">
                                <span className={`text-xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                                  {item.pack.totalPrice.toFixed(2)}â‚¬
                                </span>
                                <span className="text-sm text-gray-500 ml-2">/ pack</span>
                              </div>
                            </div>
                            
                            {/* ContrÃ´les quantitÃ© */}
                            <div className="flex items-center justify-between lg:justify-end gap-4">
                              <div className="flex items-center bg-white/80 rounded-2xl p-2 shadow-lg">
                                <button
                                  onClick={() => updateQuantity(item.pack.id, item.quantity - 1)}
                                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                                >
                                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="text-xl font-bold text-gray-900 w-12 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.pack.id, item.quantity + 1)}
                                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                                >
                                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Prix total et suppression */}
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                                    {(item.pack.totalPrice * item.quantity).toFixed(2)}â‚¬
                                  </div>
                                  <div className="text-xs text-gray-500">Total</div>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.pack.id)}
                                  className="w-12 h-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                                >
                                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer avec total et commande */}
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <span className="text-lg font-semibold text-gray-600">Total de la commande</span>
                        <div className="flex items-center mt-1">
                          <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {getTotalAmount().toFixed(2)}â‚¬
                          </span>
                          <span className="text-sm text-gray-500 ml-2">TTC</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>ðŸšš Livraison estimÃ©e</div>
                        <div className="font-semibold text-gray-700">2-3 jours ouvrÃ©s</div>
                      </div>
                    </div>
                    
                    {orderError && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-red-800 mb-1">
                              âš ï¸ Commande impossible
                            </h3>
                            <div className="text-sm text-red-700">
                              <p className="mb-2">{orderError}</p>
                              <p className="text-xs">ðŸ’¡ Veuillez rÃ©duire les quantitÃ©s ou contacter notre service client.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setShowCart(false)}
                        className="flex-1 py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:scale-105"
                      >
                        Continuer mes achats
                      </button>
                      <button
                        onClick={handleOrder}
                        disabled={isProcessingOrder}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                          isProcessingOrder
                            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-200'
                        }`}
                      >
                        {isProcessingOrder ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Traitement en cours...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Passer la commande ðŸš€
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortalPage;


