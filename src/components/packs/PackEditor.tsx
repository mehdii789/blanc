import React, { useState, useEffect } from 'react';
import { ServicePack, PackCategory, PackService, PackInventoryItem } from '../../types';
import { useApp } from '../../hooks/useApp';
import { X, Plus, Trash2, DollarSign, Clock, Save } from 'lucide-react';

interface PackEditorProps {
  pack?: ServicePack;
  onSave: (pack: Omit<ServicePack, 'id'>) => void;
  onCancel: () => void;
}

export const PackEditor: React.FC<PackEditorProps> = ({ pack, onSave, onCancel }) => {
  const { services, inventoryItems } = useApp();
  
  const [name, setName] = useState(pack?.name || '');
  const [description, setDescription] = useState(pack?.description || '');
  const [category, setCategory] = useState<PackCategory>(pack?.category || 'standard');
  const [totalPrice, setTotalPrice] = useState(pack?.totalPrice || 0);
  const [estimatedTime, setEstimatedTime] = useState(pack?.estimatedTime || 0);
  const [isActive, setIsActive] = useState(pack?.isActive ?? true);
  const [packServices, setPackServices] = useState<PackService[]>(pack?.services || []);
  const [packInventoryItems, setPackInventoryItems] = useState<PackInventoryItem[]>(pack?.inventoryItems || []);

  const categories: { value: PackCategory; label: string }[] = [
    { value: 'standard', label: 'Standard' },
    { value: 'express', label: 'Express' },
    { value: 'premium', label: 'Premium' },
    { value: 'literie', label: 'Literie' },
    { value: 'professionnel', label: 'Professionnel' },
  ];

  const handleAddService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const existingService = packServices.find(s => s.serviceId === serviceId);
    if (existingService) {
      alert('Ce service est déjà ajouté au pack');
      return;
    }

    setPackServices([
      ...packServices,
      {
        serviceId: service.id,
        serviceName: service.name,
        quantity: 1,
        unitPrice: service.price,
      },
    ]);
  };

  const handleRemoveService = (serviceId: string) => {
    setPackServices(packServices.filter(s => s.serviceId !== serviceId));
  };

  const handleUpdateServiceQuantity = (serviceId: string, quantity: number) => {
    setPackServices(
      packServices.map(s =>
        s.serviceId === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s
      )
    );
  };

  const handleAddInventoryItem = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    const existingItem = packInventoryItems.find(i => i.itemId === itemId);
    if (existingItem) {
      alert('Ce produit est déjà ajouté au pack');
      return;
    }

    setPackInventoryItems([
      ...packInventoryItems,
      {
        itemId: item.id,
        itemName: item.name,
        quantityPerPack: 1,
        unit: item.unit,
      },
    ]);
  };

  const handleRemoveInventoryItem = (itemId: string) => {
    setPackInventoryItems(packInventoryItems.filter(i => i.itemId !== itemId));
  };

  const handleUpdateInventoryQuantity = (itemId: string, quantity: number) => {
    setPackInventoryItems(
      packInventoryItems.map(i =>
        i.itemId === itemId ? { ...i, quantityPerPack: Math.max(0.01, quantity) } : i
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Le nom du pack est requis');
      return;
    }

    if (packServices.length === 0) {
      alert('Ajoutez au moins un service au pack');
      return;
    }

    onSave({
      name,
      description,
      category,
      services: packServices,
      inventoryItems: packInventoryItems,
      totalPrice,
      estimatedTime,
      isActive,
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {pack ? 'Modifier le pack' : 'Créer un nouveau pack'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configurez les services et produits inclus dans ce pack
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du pack *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Pack Familial Standard"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Décrivez ce pack..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PackCategory)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Prix total (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={totalPrice}
                onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Durée estimée (heures) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Pack actif (visible sur le portail client)
                </span>
              </label>
            </div>
          </div>

          {/* Services */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services inclus</h3>
            
            {/* Ajouter un service */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter un service
              </label>
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddService(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un service...</option>
                  {services
                    .filter(s => !packServices.some(ps => ps.serviceId === s.id))
                    .map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {service.price}€
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Liste des services */}
            <div className="space-y-2">
              {packServices.map((service) => (
                <div
                  key={service.serviceId}
                  className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{service.serviceName}</p>
                    <p className="text-sm text-gray-600">{service.unitPrice}€ / unité</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Quantité:</label>
                    <input
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(e) =>
                        handleUpdateServiceQuantity(service.serviceId, parseInt(e.target.value) || 1)
                      }
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service.serviceId)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {packServices.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  Aucun service ajouté. Sélectionnez un service ci-dessus.
                </div>
              )}
            </div>
          </div>

          {/* Produits d'inventaire */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Produits d'inventaire nécessaires</h3>
            <p className="text-sm text-gray-600 mb-4">
              Spécifiez les produits qui seront utilisés pour ce pack (optionnel)
            </p>

            {/* Ajouter un produit */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter un produit
              </label>
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddInventoryItem(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un produit...</option>
                  {inventoryItems
                    .filter(i => !packInventoryItems.some(pi => pi.itemId === i.id))
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.unit})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Liste des produits */}
            <div className="space-y-2">
              {packInventoryItems.map((item) => (
                <div
                  key={item.itemId}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">📦 {item.itemName}</p>
                    <p className="text-xs text-gray-600">Unité: {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Quantité/pack:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.quantityPerPack}
                      onChange={(e) =>
                        handleUpdateInventoryQuantity(item.itemId, parseFloat(e.target.value) || 0.01)
                      }
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-xs text-gray-600">{item.unit}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveInventoryItem(item.itemId)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {packInventoryItems.length === 0 && (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  Aucun produit ajouté. C'est optionnel.
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Save className="h-5 w-5 mr-2" />
              {pack ? 'Enregistrer les modifications' : 'Créer le pack'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
