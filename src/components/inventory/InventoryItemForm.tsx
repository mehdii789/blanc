import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';

interface InventoryItemFormProps {
  itemId?: string | null;
  onClose: () => void;
}

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ 
  itemId, 
  onClose 
}) => {
  const { inventoryItems, addInventoryItem, updateInventoryItem } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: '',
    reorderLevel: 0
  });
  
  const [errors, setErrors] = useState({
    name: '',
    quantity: '',
    unit: '',
    reorderLevel: ''
  });
  
  useEffect(() => {
    if (itemId) {
      const item = inventoryItems.find(i => i.id === itemId);
      if (item) {
        setFormData({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          reorderLevel: item.reorderLevel
        });
      }
    }
  }, [itemId, inventoryItems]);
  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      quantity: '',
      unit: '',
      reorderLevel: ''
    };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
      valid = false;
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'La quantité ne peut pas être négative';
      valid = false;
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = "L'unité est requise";
      valid = false;
    }
    
    if (formData.reorderLevel < 0) {
      newErrors.reorderLevel = 'Le niveau de réapprovisionnement ne peut pas être négatif';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'quantity' || name === 'reorderLevel') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: parseInt(value) || 0 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (itemId) {
      const item = inventoryItems.find(i => i.id === itemId);
      if (item) {
        updateInventoryItem({
          ...item,
          ...formData
        });
      }
    } else {
      addInventoryItem(formData);
    }
    
    onClose();
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {itemId ? 'Modifier l\'article' : 'Ajouter un nouvel article'}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unité*
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="ex: bouteilles, litres, pièces"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.unit ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité*
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau de réapprovisionnement*
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleChange}
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reorderLevel ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.reorderLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.reorderLevel}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {itemId ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};