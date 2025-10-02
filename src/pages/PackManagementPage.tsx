import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { ServicePack, PackCategory } from '../types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Package, DollarSign, Clock } from 'lucide-react';
import { PackEditor } from '../components/packs/PackEditor';

export const PackManagementPage: React.FC = () => {
  const { servicePacks, addServicePack, updateServicePack, deleteServicePack } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPack, setEditingPack] = useState<ServicePack | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PackCategory | 'all'>('all');

  const categories: { value: PackCategory | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'Tous', color: 'gray' },
    { value: 'standard', label: 'Standard', color: 'blue' },
    { value: 'express', label: 'Express', color: 'orange' },
    { value: 'premium', label: 'Premium', color: 'purple' },
    { value: 'literie', label: 'Literie', color: 'green' },
    { value: 'professionnel', label: 'Professionnel', color: 'indigo' },
  ];

  const filteredPacks = selectedCategory === 'all' 
    ? servicePacks 
    : servicePacks.filter(pack => pack.category === selectedCategory);

  const handleToggleActive = (pack: ServicePack) => {
    updateServicePack({ ...pack, isActive: !pack.isActive });
  };

  const handleDelete = (packId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) {
      deleteServicePack(packId);
    }
  };

  const handleSavePack = (pack: Omit<ServicePack, 'id'>) => {
    if (editingPack) {
      updateServicePack({ ...pack, id: editingPack.id });
      setEditingPack(null);
    } else {
      addServicePack(pack);
      setIsCreating(false);
    }
  };

  const getCategoryColor = (category: PackCategory) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  if (isCreating || editingPack) {
    return (
      <PackEditor
        pack={editingPack || undefined}
        onSave={handleSavePack}
        onCancel={() => {
          setIsCreating(false);
          setEditingPack(null);
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">📦 Gestion des Packs</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Créez et gérez vos offres de packs pour le portail client
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
        >
          <Plus className="h-5 w-5 mr-2" />
          Créer un pack
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-md border border-blue-200 w-full">
          <div className="flex flex-col items-center text-center justify-center h-full min-h-[120px]">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 shadow-md">
              <Package className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">Total Packs</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">{servicePacks.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-md border border-green-200 w-full">
          <div className="flex flex-col items-center text-center justify-center h-full min-h-[120px]">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-3 shadow-md">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">Actifs</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-900">
              {servicePacks.filter(p => p.isActive).length}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl shadow-md border border-amber-200 w-full">
          <div className="flex flex-col items-center text-center justify-center h-full min-h-[120px]">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mb-3 shadow-md">
              <EyeOff className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">Inactifs</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-900">
              {servicePacks.filter(p => !p.isActive).length}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-md border border-purple-200 w-full">
          <div className="flex flex-col items-center text-center justify-center h-full min-h-[120px]">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-3 shadow-md">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wide">Prix Moyen</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-900">
              {servicePacks.length > 0 
                ? Math.round(servicePacks.reduce((sum, p) => sum + p.totalPrice, 0) / servicePacks.length)
                : 0}€
            </p>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat.value
                  ? `bg-${cat.color}-100 text-${cat.color}-700 ring-2 ring-${cat.color}-500`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPacks.map((pack) => {
          const categoryColor = getCategoryColor(pack.category);
          return (
            <div
              key={pack.id}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2 w-full ${
                pack.isActive ? `border-${categoryColor}-200` : 'border-gray-200'
              }`}
            >
              {/* Header du pack */}
              <div className={`bg-gradient-to-r from-${categoryColor}-500 to-${categoryColor}-600 p-4 text-white`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-bold flex-1 min-w-0">{pack.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                    pack.isActive ? 'bg-white bg-opacity-30' : 'bg-red-500'
                  }`}>
                    {pack.isActive ? '✓ Actif' : '✗ Inactif'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm opacity-90">{pack.description}</p>
              </div>

              {/* Contenu */}
              <div className="p-4">
                {/* Prix et durée */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <DollarSign className={`h-5 w-5 text-${categoryColor}-600`} />
                    <span className="text-2xl font-bold text-gray-900">{pack.totalPrice}€</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{pack.estimatedTime}h</span>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Services inclus ({pack.services.length})
                  </h4>
                  <div className="space-y-1">
                    {pack.services.slice(0, 3).map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">• {service.serviceName}</span>
                        <span className="text-gray-500">x{service.quantity}</span>
                      </div>
                    ))}
                    {pack.services.length > 3 && (
                      <p className="text-xs text-gray-500 italic">
                        +{pack.services.length - 3} autre(s)...
                      </p>
                    )}
                  </div>
                </div>

                {/* Produits d'inventaire */}
                {pack.inventoryItems && pack.inventoryItems.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Produits nécessaires ({pack.inventoryItems.length})
                    </h4>
                    <div className="space-y-1">
                      {pack.inventoryItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">📦 {item.itemName}</span>
                          <span className="text-gray-500">{item.quantityPerPack} {item.unit}</span>
                        </div>
                      ))}
                      {pack.inventoryItems.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{pack.inventoryItems.length - 3} autre(s)...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={() => setEditingPack(pack)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 inline mr-1" />
                    Modifier
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(pack)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        pack.isActive
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {pack.isActive ? <EyeOff className="h-4 w-4 inline mr-1" /> : <Eye className="h-4 w-4 inline mr-1" />}
                      {pack.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDelete(pack.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPacks.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun pack trouvé</h3>
          <p className="text-gray-500 mb-4">
            {selectedCategory === 'all' 
              ? 'Commencez par créer votre premier pack'
              : 'Aucun pack dans cette catégorie'}
          </p>
          {selectedCategory === 'all' && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer un pack
            </button>
          )}
        </div>
      )}
    </div>
  );
};
