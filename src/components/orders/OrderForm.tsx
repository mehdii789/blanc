import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { X, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Service } from '../../types';
import { InventoryImpactDisplay } from './InventoryImpactDisplay';
import { SimpleInventoryImpact } from '../services/SimpleInventoryImpact';
import { validateServiceQuantity, calculateMaxQuantityForService } from '../../utils/inventoryValidation';

interface OrderFormProps {
  onClose: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onClose }) => {
  const { customers, services, addOrder, inventoryItems, checkInventoryForOrder } = useApp();
  
  const [formData, setFormData] = useState({
    customerId: '',
    serviceItems: [] as { service: Service; quantity: number }[],
    notes: '',
    dueDate: getDefaultDueDate(),
    paid: false,
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer' | 'check'
  });
  
  const [errors, setErrors] = useState({
    customerId: '',
    services: '',
    inventory: ''
  });
  
  const [quantityErrors, setQuantityErrors] = useState<{ [serviceId: string]: string }>({});
  const [maxQuantities, setMaxQuantities] = useState<{ [serviceId: string]: number }>({});

  const paymentMethods = [
    { value: 'cash', label: 'Espèces' },
    { value: 'card', label: 'Carte bancaire' },
    { value: 'transfer', label: 'Virement' },
    { value: 'check', label: 'Chèque' }
  ];
  
  function getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  }
  
  const calculateTotal = () => {
    return formData.serviceItems.reduce((total, item) => {
      return total + (item.service.price * item.quantity);
    }, 0);
  };
  
  const handleAddService = (service: Service) => {
    const maxQuantity = calculateMaxQuantityForService(service, inventoryItems);
    
    if (maxQuantity.maxQuantity === 0) {
      setQuantityErrors({
        ...quantityErrors,
        [service.id]: `Stock insuffisant pour ${service.name}. Article manquant: ${maxQuantity.limitingFactor.itemName}`
      });
      return;
    }
    
    const existingIndex = formData.serviceItems.findIndex(
      item => item.service.id === service.id
    );
    
    if (existingIndex >= 0) {
      const currentQuantity = formData.serviceItems[existingIndex].quantity;
      handleUpdateQuantity(service.id, currentQuantity + 1);
    } else {
      const newItems = [...formData.serviceItems, { service, quantity: 1 }];
      setFormData({ ...formData, serviceItems: newItems });
      
      const validation = validateServiceQuantity(service, 1, inventoryItems, formData.serviceItems);
      if (!validation.isValid) {
        setQuantityErrors({
          ...quantityErrors,
          [service.id]: validation.errors[0]
        });
      }
    }
    
    if (errors.services) {
      setErrors({ ...errors, services: '', inventory: '' });
    }
  };
  
  const handleRemoveService = (serviceId: string) => {
    setFormData({
      ...formData,
      serviceItems: formData.serviceItems.filter(
        item => item.service.id !== serviceId
      )
    });
  };
  
  const handleUpdateQuantity = (serviceId: string, newQuantity: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service || newQuantity < 1) return;
    
    const otherServices = formData.serviceItems.filter(item => item.service.id !== serviceId);
    const validation = validateServiceQuantity(service, newQuantity, inventoryItems, otherServices);
    
    const newQuantityErrors = { ...quantityErrors };
    if (!validation.isValid) {
      newQuantityErrors[serviceId] = validation.errors[0];
      newQuantity = Math.min(newQuantity, validation.maxAllowed);
    } else {
      delete newQuantityErrors[serviceId];
    }
    
    const updatedItems = formData.serviceItems.map(item => 
      item.service.id === serviceId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    setQuantityErrors(newQuantityErrors);
    setFormData({ ...formData, serviceItems: updatedItems });
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      customerId: '',
      services: '',
      inventory: ''
    };
    
    if (!formData.customerId) {
      newErrors.customerId = 'Veuillez sélectionner un client';
      valid = false;
    }
    
    if (formData.serviceItems.length === 0) {
      newErrors.services = 'Veuillez ajouter au moins un service';
      valid = false;
    }
    
    if (formData.serviceItems.length > 0) {
      const tempOrder = {
        id: 'temp',
        customerId: formData.customerId,
        services: formData.serviceItems.map(item => ({ ...item.service, quantity: item.quantity })),
        items: [],
        status: 'en_traitement' as const,
        totalAmount: calculateTotal(),
        paid: formData.paid,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        dueDate: new Date(formData.dueDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const inventoryCheck = checkInventoryForOrder(tempOrder);
      if (!inventoryCheck.available) {
        newErrors.inventory = 'Stock insuffisant pour cette commande';
        valid = false;
      }
    }
    
    if (Object.keys(quantityErrors).length > 0) {
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const dueDate = new Date(formData.dueDate);
    
    addOrder({
      customerId: formData.customerId,
      services: formData.serviceItems.map(item => ({
        ...item.service,
        quantity: item.quantity
      })),
      status: 'en_traitement',
      totalAmount: calculateTotal(),
      paid: formData.paid,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      dueDate
    });
    
    onClose();
  };
  
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Nouvelle commande</h2>
        <button 
          onClick={onClose}
          className="p-1 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Fermer"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Client*
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => {
                setFormData({ ...formData, customerId: e.target.value });
                if (errors.customerId) {
                  setErrors({ ...errors, customerId: '' });
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customerId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner un client</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.phone})
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Date d'échéance
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Mode de paiement
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ 
                ...formData, 
                paymentMethod: e.target.value as 'cash' | 'card' | 'transfer' | 'check' 
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <label className="block text-sm font-medium text-gray-700">
              Services*
            </label>
            <div className="text-xs sm:text-sm text-gray-500 text-right">
              Sélectionnez les services à ajouter
            </div>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {services.map(service => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleAddService(service)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="font-medium text-gray-900">{service.name}</div>
                <div className="text-sm text-gray-500 mt-1">${service.price.toFixed(2)} / {service.description}</div>
              </button>
            ))}
          </div>
          
          {errors.services && (
            <p className="mt-1 text-sm text-red-600 mb-2">{errors.services}</p>
          )}
          
          {errors.inventory && (
            <div className="mt-1 mb-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600" />
                <span className="text-red-800 font-medium">{errors.inventory}</span>
              </div>
            </div>
          )}
          
          {formData.serviceItems.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.serviceItems.map(({ service, quantity }) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500">{service.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${service.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(service.id, quantity - 1)}
                            className="p-1 sm:p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={quantity <= 1}
                            aria-label="Réduire la quantité"
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <span className="text-sm sm:text-base font-medium w-6 text-center">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const otherServices = formData.serviceItems.filter(i => i.service.id !== service.id);
                              const validation = validateServiceQuantity(service, quantity + 1, inventoryItems, otherServices);
                              handleUpdateQuantity(service.id, validation.isValid ? quantity + 1 : quantity);
                            }}
                            className="p-1 sm:p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!!quantityErrors[service.id]}
                            title={quantityErrors[service.id] || 'Augmenter la quantité'}
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        {quantityErrors[service.id] && (
                          <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                            <AlertTriangle size={12} />
                            <span>{quantityErrors[service.id]}</span>
                          </div>
                        )}
                        {maxQuantities[service.id] !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Max: {maxQuantities[service.id]}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        ${(service.price * quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service.id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Supprimer le service"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-3 text-right font-medium">
                      Montant total :
                    </td>
                    <td colSpan={2} className="px-6 py-3 font-bold text-lg">
                      ${calculateTotal().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          
          {/* Affichage de l'impact sur l'inventaire */}
          {formData.serviceItems.length > 0 && (
            <div className="mt-4">
              <SimpleInventoryImpact 
                services={formData.serviceItems}
                inventoryItems={inventoryItems}
              />
            </div>
          )}

          {/* Champ Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ajoutez des notes supplémentaires pour cette commande..."
            />
          </div>
          
          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={formData.serviceItems.length === 0 || Object.keys(quantityErrors).length > 0}
            >
              Créer la commande
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
