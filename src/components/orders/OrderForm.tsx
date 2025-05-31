import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Minus, Check } from 'lucide-react';
import { Service } from '../../types';

interface OrderFormProps {
  onClose: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onClose }) => {
  const { customers, services, addOrder } = useApp();
  
  const [formData, setFormData] = useState({
    customerId: '',
    serviceItems: [] as { service: Service; quantity: number }[],
    notes: '',
    dueDate: getDefaultDueDate(),
    paid: false
  });
  
  const [errors, setErrors] = useState({
    customerId: '',
    services: ''
  });
  
  function getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 2); // Date d'échéance par défaut dans 2 jours
    return date.toISOString().split('T')[0];
  }
  
  const calculateTotal = () => {
    return formData.serviceItems.reduce((total, item) => {
      return total + (item.service.price * item.quantity);
    }, 0);
  };
  
  const handleAddService = (service: Service) => {
    // Check if service already exists
    const existingIndex = formData.serviceItems.findIndex(
      item => item.service.id === service.id
    );
    
    if (existingIndex >= 0) {
      // Update quantity if service already exists
      const updatedItems = [...formData.serviceItems];
      updatedItems[existingIndex].quantity += 1;
      setFormData({ ...formData, serviceItems: updatedItems });
    } else {
      // Add new service with quantity 1
      setFormData({
        ...formData,
        serviceItems: [...formData.serviceItems, { service, quantity: 1 }]
      });
    }
    
    // Clear error if present
    if (errors.services) {
      setErrors({ ...errors, services: '' });
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
  
  const handleUpdateQuantity = (serviceId: string, quantity: number) => {
    const updatedItems = formData.serviceItems.map(item => {
      if (item.service.id === serviceId) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    
    setFormData({ ...formData, serviceItems: updatedItems });
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      customerId: '',
      services: ''
    };
    
    if (!formData.customerId) {
      newErrors.customerId = 'Veuillez sélectionner un client';
      valid = false;
    }
    
    if (formData.serviceItems.length === 0) {
      newErrors.services = 'Veuillez ajouter au moins un service';
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
      services: formData.serviceItems.map(item => item.service),
      status: 'en_attente',
      totalAmount: calculateTotal(),
      paid: formData.paid,
      notes: formData.notes,
      dueDate
    });
    
    onClose();
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Nouvelle commande</h2>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'échéance
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Services*
            </label>
            <div className="text-sm text-gray-500">
              Sélectionnez les services à ajouter à la commande
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {services.map(service => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleAddService(service)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="font-medium text-gray-900">{service.name}</div>
                <div className="text-sm text-gray-500 mt-1">{service.price.toFixed(2)} / {service.description}</div>
              </button>
            ))}
          </div>
          
          {errors.services && (
            <p className="mt-1 text-sm text-red-600 mb-2">{errors.services}</p>
          )}
          
          {formData.serviceItems.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
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
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus size={16} className="text-gray-500" />
                          </button>
                          <span className="w-8 text-center">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(service.id, quantity + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus size={16} className="text-gray-500" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        ${(service.price * quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-3 text-right font-medium">
                      Montant total :
                    </td>
                    <td colSpan={2} className="px-6 py-3 font-bold text-lg">
                      ${calculateTotal().toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.paid}
              onChange={() => setFormData({ ...formData, paid: !formData.paid })}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
              formData.paid ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}>
              {formData.paid && <Check size={14} className="text-white" />}
            </div>
            <span className="text-sm font-medium text-gray-700">
              Marquer comme payé
            </span>
          </label>
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
            Créer la commande
          </button>
        </div>
      </form>
    </div>
  );
};