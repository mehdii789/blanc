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
  const [showFilters, setShowFilters] = useState(false);
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
    // Vérifier la disponibilité avant d'ajouter au panier
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
      // Créer une nouvelle commande via le contexte
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
        notes: 'Commande passée via le portail client'
      });

      setCart([]);
      setShowCart(false);
      
      alert('Commande passée avec succès ! Vous recevrez une confirmation par email.');
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      setOrderError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la commande.');
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
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Conteneur principal avec largeur maximale */}
      <div className="max-w-7xl mx-auto w-full px-2 py-3 sm:px-4 sm:py-4">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl shadow-sm sm:shadow-md border-b border-gray-100 sticky top-0 z-50">
          <div className="w-full px-3 sm:px-4">
            <div className="flex justify-between items-center py-3 min-h-[60px]">
            {/* Logo et titre */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition-all duration-500 animate-pulse"></div>
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="relative min-w-0 flex-1">
                <h1 className="text-base sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent tracking-tight truncate">
                  Portail Client
                </h1>
                <div className="flex items-center mt-0.5 sm:mt-1">
                  <div className="relative inline-flex h-2 w-2 sm:h-3 sm:w-3 mr-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-emerald-500 shadow-lg"></span>
                  </div>
                  <p className="text-xs sm:text-base lg:text-lg text-gray-700 font-semibold truncate">
                    Bienvenue, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">{customer.name}</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Mes Commandes */}
              <button
                onClick={() => navigate('/client-orders')}
                className="group relative overflow-hidden px-3 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold text-xs sm:text-sm flex items-center justify-center min-w-[44px] min-h-[44px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <svg className="h-5 w-5 sm:mr-2 transition-transform group-hover:rotate-12 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="hidden sm:inline whitespace-nowrap">Mes Commandes</span>
                </div>
              </button>
              
              {/* Panier */}
              <button
                onClick={() => setShowCart(true)}
                className="group relative p-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Panier"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <div className="relative">
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
                  </svg>
                  {cart.length > 0 && (
                    <>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-pink-400 opacity-30 animate-ping"></div>
                    </>
                  )}
                </div>
              </button>
              
              {/* Déconnexion - Desktop */}
              <div className="hidden md:block relative group">
                <button
                  onClick={handleLogout}
                  className="group/logout relative overflow-hidden px-3 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold text-xs sm:text-sm flex items-center justify-center min-w-[44px] min-h-[44px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/logout:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <svg className="h-5 w-5 sm:mr-2 transition-transform group-hover/logout:translate-x-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline whitespace-nowrap">Déconnexion</span>
                  </div>
                </button>
                
                {/* Tooltip */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                    Se déconnecter du portail
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                  </div>
                </div>
              </div>
              
              {/* Déconnexion - Mobile */}
              <button
                onClick={handleLogout}
                className="md:hidden p-2.5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Déconnexion"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
          </div>
        </header>

        <div className="w-full px-2 py-3 sm:px-4 sm:py-4">
          <div className="w-full">
          {/* Catalogue des packs */}
          <div className="w-full">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md border border-white/30 p-3 sm:p-4 transition-all duration-300 w-full">
              <div className="text-center mb-10 relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 inline-block">
                  Nos Packs de Services
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto relative">
                  <span className="relative z-10 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-1 rounded-full">
                    Choisissez le pack qui vous convient le mieux <span className="animate-bounce inline-block">✨</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 blur-lg opacity-50 rounded-full"></span>
                </p>
              </div>
              
              {/* Filtres par catégorie */}
              <div className="mb-6 sm:mb-8">
                {/* Bouton filtres mobile */}
                <div className="sm:hidden mb-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                  >
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span>Filtrer par catégorie</span>
                      {selectedCategory !== 'all' && (
                        <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                          {selectedCategory === 'standard' && '📚'}
                          {selectedCategory === 'express' && '⚡️'}
                          {selectedCategory === 'premium' && '💎'}
                          {selectedCategory === 'literie' && '🛏️'}
                          {selectedCategory === 'professionnel' && '💼'}
                        </span>
                      )}
                    </div>
                    <svg 
                      className={`h-5 w-5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Filtres desktop (toujours visibles) */}
                <div className="hidden sm:flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/50'
                        : 'bg-white/90 text-gray-700 hover:bg-white hover:shadow-xl border border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-1.5">✨</span> Tous les packs
                    </span>
                  </button>
                  {[
                    { key: 'standard', label: 'Standard', emoji: '📚', color: 'from-gray-500 to-gray-600', hover: 'hover:from-gray-600 hover:to-gray-700' },
                    { key: 'express', label: 'Express', emoji: '⚡️', color: 'from-orange-500 to-red-500', hover: 'hover:from-orange-600 hover:to-red-600' },
                    { key: 'premium', label: 'Premium', emoji: '💎', color: 'from-purple-500 to-pink-500', hover: 'hover:from-purple-600 hover:to-pink-600' },
                    { key: 'literie', label: 'Literie', emoji: '🛏️', color: 'from-green-500 to-teal-500', hover: 'hover:from-green-600 hover:to-teal-600' },
                    { key: 'professionnel', label: 'Pro', emoji: '💼', color: 'from-blue-500 to-indigo-500', hover: 'hover:from-blue-600 hover:to-indigo-600' }
                  ].map(({ key, label, emoji, color, hover }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key as PackCategory)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center ${
                        selectedCategory === key
                          ? `bg-gradient-to-r ${color} text-white shadow-lg ${hover.replace('hover:', 'shadow-')}200/50`
                          : `bg-white/90 text-gray-700 hover:bg-white hover:shadow-xl border border-gray-200/80 hover:border-gray-300 ${hover}`
                      }`}
                    >
                      <span className="mr-1.5">{emoji}</span> {label}
                    </button>
                  ))}
                </div>

                {/* Menu déroulant filtres mobile */}
                <div className={`sm:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                  showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setShowFilters(false);
                        }}
                        className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${
                          selectedCategory === 'all'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/50'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg border border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg mb-1">✨</span>
                          <span className="text-xs">Tous</span>
                        </div>
                      </button>
                      {[
                        { key: 'standard', label: 'Standard', emoji: '📚', color: 'from-gray-500 to-gray-600' },
                        { key: 'express', label: 'Express', emoji: '⚡️', color: 'from-orange-500 to-red-500' },
                        { key: 'premium', label: 'Premium', emoji: '💎', color: 'from-purple-500 to-pink-500' },
                        { key: 'literie', label: 'Literie', emoji: '🛏️', color: 'from-green-500 to-teal-500' },
                        { key: 'professionnel', label: 'Pro', emoji: '💼', color: 'from-blue-500 to-indigo-500' }
                      ].map(({ key, label, emoji, color }) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedCategory(key as PackCategory);
                            setShowFilters(false);
                          }}
                          className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${
                            selectedCategory === key
                              ? `bg-gradient-to-r ${color} text-white shadow-lg`
                              : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg border border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-lg mb-1">{emoji}</span>
                            <span className="text-xs">{label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des packs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-4 auto-rows-fr">
                {filteredPacks.map((pack, index) => {
                  const availability = checkPackAvailability(pack, 1);
                  const categoryConfig = {
                    express: { 
                      gradient: 'from-orange-500 to-red-500', 
                      hoverGradient: 'from-orange-600 to-red-600',
                      emoji: '⚡️', 
                      bgGradient: 'from-orange-50 to-red-50',
                      shadow: 'shadow-orange-200/50'
                    },
                    premium: { 
                      gradient: 'from-purple-500 to-pink-500',
                      hoverGradient: 'from-purple-600 to-pink-600',
                      emoji: '💎', 
                      bgGradient: 'from-purple-50 to-pink-50',
                      shadow: 'shadow-purple-200/50'
                    },
                    literie: { 
                      gradient: 'from-green-500 to-teal-500',
                      hoverGradient: 'from-green-600 to-teal-600',
                      emoji: '🛏️', 
                      bgGradient: 'from-green-50 to-teal-50',
                      shadow: 'shadow-green-200/50'
                    },
                    professionnel: { 
                      gradient: 'from-blue-500 to-indigo-500',
                      hoverGradient: 'from-blue-600 to-indigo-600',
                      emoji: '💼', 
                      bgGradient: 'from-blue-50 to-indigo-50',
                      shadow: 'shadow-blue-200/50'
                    },
                    standard: { 
                      gradient: 'from-gray-500 to-gray-600',
                      hoverGradient: 'from-gray-600 to-gray-700',
                      emoji: '📚', 
                      bgGradient: 'from-gray-50 to-gray-100',
                      shadow: 'shadow-gray-200/50'
                    }
                  };
                  const config = categoryConfig[pack.category] || categoryConfig.standard;
                  
                  return (
                    <div 
                      key={pack.id} 
                      className={`group relative bg-gradient-to-br ${config.bgGradient} rounded-lg p-4 mb-4 sm:mb-0 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 border border-white/50 hover:border-white/70 animate-fade-in overflow-hidden w-full h-full flex flex-col`}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
                        minHeight: '480px',
                        maxHeight: '480px'
                      }}
                    >
                      {/* Effet de brillance au survol */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      
                      {/* Badge catégorie flottant */}
                      <div className={`absolute top-2 right-2 bg-gradient-to-r ${config.gradient} text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transform rotate-12 group-hover:rotate-6 group-hover:scale-105 transition-all duration-200 flex items-center z-20 border border-white/30 min-w-max`}>
                        <span className="text-xs mr-1.5">{config.emoji}</span>
                        <span className="text-xs whitespace-nowrap">{getCategoryLabel(pack.category)}</span>
                      </div>
                      
                      {/* En-tête du pack */}
                      <div className="relative z-10 flex flex-col h-full pt-3 sm:pt-4">
                        <div className="mb-4 sm:mb-6">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-gray-800 transition-colors leading-tight min-h-[2.5rem] sm:min-h-[3rem] flex items-center pr-12 sm:pr-16">
                            {pack.name}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed min-h-[2rem] sm:min-h-[2.5rem]">{pack.description}</p>
                        </div>
                        
                        {/* Services inclus */}
                        <div className="bg-white/80 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 backdrop-blur-sm border border-white/60 shadow-sm flex-1" style={{ minHeight: '160px', maxHeight: '160px' }}>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                            <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Services inclus
                          </h4>
                          <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: '120px' }}>
                            {pack.services.map((service, i) => (
                              <div 
                                key={service.serviceId} 
                                className="flex justify-between items-start text-xs group/item p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                                style={{ transitionDelay: `${i * 50}ms` }}
                              >
                                <span className="text-gray-600 flex-1 flex items-start">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 mr-2 mt-1 group-hover/item:scale-110 transition-transform flex-shrink-0"></span>
                                  <span className="font-medium text-xs leading-tight">{service.serviceName}</span>
                                </span>
                                <span className="font-bold text-gray-900 bg-gradient-to-r from-white to-gray-50 px-2 py-0.5 rounded text-xs border border-gray-200 shadow-sm whitespace-nowrap ml-2 flex-shrink-0">
                                  {(service.quantity * service.unitPrice).toFixed(2)}€
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Prix et action */}
                        <div className="mt-auto pt-2 sm:pt-3 border-t border-white/30">
                          <div className="w-full">
                            <div className="text-center mb-2 sm:mb-3">
                              <div className="flex flex-col items-center justify-center space-y-1">
                                <span className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                                  {pack.totalPrice.toFixed(2)}€
                                </span>
                                <div className="flex items-center text-gray-500">
                                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-xs">Délai: {pack.estimatedTime}h</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-full">
                            <button
                              onClick={() => addToCart(pack)}
                              disabled={!availability.available}
                              className={`w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg ${
                                availability.available
                                  ? `bg-gradient-to-r ${config.gradient} hover:${config.hoverGradient} text-white ${config.shadow} hover:shadow-xl`
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                              }`}
                            >
                              {availability.available ? (
                                <span className="flex items-center justify-center">
                                  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  <span className="hidden sm:inline">Ajouter au panier</span>
                                  <span className="sm:hidden">Ajouter</span>
                                </span>
                              ) : (
                                <span className="flex items-center justify-center">
                                  <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  <span className="hidden sm:inline">Stock insuffisant</span>
                                  <span className="sm:hidden">Indisponible</span>
                                </span>
                              )}
                            </button>
                            {!availability.available && (
                              <p className="text-xs text-red-600 mt-2 text-center bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                <span className="inline-flex items-center">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                                  <span className="font-medium text-xs">Stock limité</span>
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      
      {/* Panier */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Votre Panier</h3>
                <button 
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-700 mb-2">Votre panier est vide</h4>
                  <p className="text-gray-500 mb-6">Ajoutez des packs pour commencer vos achats 🛒</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Continuer mes achats
                  </button>
                </div>
              ) : (
                <div>
                  {/* Liste des articles du panier */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.pack.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => removeFromCart(item.pack.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Supprimer du panier"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div>
                            <h4 className="font-medium text-gray-900">{item.pack.name}</h4>
                            <div className="flex items-center mt-1">
                              <button
                                onClick={() => updateQuantity(item.pack.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md text-gray-500 hover:bg-gray-100"
                                aria-label="Réduire la quantité"
                              >
                                -
                              </button>
                              <span className="mx-2 w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.pack.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-md text-gray-500 hover:bg-gray-100"
                                aria-label="Augmenter la quantité"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        <span className="font-medium">{(item.pack.totalPrice * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Total</span>
                      <div className="flex items-baseline">
                        <span className="text-xl font-bold text-gray-900">{getTotalAmount().toFixed(2)}€</span>
                        <span className="text-sm text-gray-500 ml-1">TTC</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>🚚 Livraison estimée</div>
                      <div className="font-semibold text-gray-700">2-3 jours ouvrés</div>
                    </div>
                  </div>

                  {/* Message d'erreur */}
                  {orderError && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
                      <div className="flex">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-red-800 mb-1">
                            ⚠️ Commande impossible
                          </h3>
                          <div className="text-sm text-red-700">
                            <p className="mb-1">{orderError}</p>
                            <p className="text-xs">Veuillez réduire les quantités ou contacter notre service client.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Boutons d'action */}
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
                          Passer la commande 🚀
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ClientPortalPage;
