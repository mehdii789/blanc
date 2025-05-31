import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { Invoice, InvoiceItem } from '../../types';

interface InvoiceFormData extends Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> {
  // Ajoutez ici les propriétés spécifiques au formulaire si nécessaire
}
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSave: (data: InvoiceFormData) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSave, onCancel }) => {
  const { customers, orders } = useApp();
  const [formData, setFormData] = useState<InvoiceFormData>(() => {
    const defaultItems = [{ id: `item_${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }];
    
    if (invoice) {
      return {
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        customerId: invoice.customerId,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        discount: invoice.discount,
        total: invoice.total,
        notes: invoice.notes || '',
        status: invoice.status,
      };
    }
    
    return {
      invoiceNumber: `INV-${Date.now()}`,
      orderId: '',
      customerId: '',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours plus tard
      items: defaultItems,
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      notes: '',
      status: 'draft' as const,
    };
  });

  const calculateTotals = (items: any[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.2; // 20% de TVA
    const total = subtotal + tax - formData.discount;
    
    return { subtotal, tax, total };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };
    
    if (field === 'quantity' || field === 'unitPrice' || field === 'total') {
      item[field] = Number(value);
    } else if (field === 'description') {
      item.description = String(value);
    }
    
    // Recalculer le total de l'article si la quantité ou le prix unitaire change
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = item.quantity * item.unitPrice;
    }
    
    newItems[index] = item;
    const { subtotal, tax, total } = calculateTotals(newItems);
    
    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      tax,
      total
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items, 
        { 
          id: `item_${Date.now()}`,
          description: '', 
          quantity: 1, 
          unitPrice: 0, 
          total: 0 
        }
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    
    const newItems = formData.items.filter((_, i) => i !== index);
    const { subtotal, tax, total } = calculateTotals(newItems);
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      tax,
      total,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 w-full sm:w-auto">
          {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
        </h2>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="invoice-form"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <form id="invoice-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Informations client</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                    Client *
                  </label>
                  <select
                    id="customerId"
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">
                    Commande associée
                  </label>
                  <select
                    id="orderId"
                    value={formData.orderId}
                    onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Aucune commande</option>
                    {orders
                      .filter(order => !formData.customerId || order.customerId === formData.customerId)
                      .map((order) => (
                        <option key={order.id} value={order.id}>
                          Commande #{order.id.slice(0, 8)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">
                Numéro de facture
              </label>
              <input
                type="text"
                id="invoiceNumber"
                value={formData.invoiceNumber}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
                Date d'émission *
              </label>
              <input
                type="date"
                id="issueDate"
                value={formData.issueDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData({...formData, issueDate: new Date(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Date d'échéance *
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData({...formData, dueDate: new Date(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900">Articles</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter un article
            </button>
          </div>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-2 sm:px-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 hidden sm:table-header-group">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qté
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="relative px-3 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <React.Fragment key={index}>
                      {/* Version mobile */}
                      <tr className="sm:hidden border-b border-gray-200">
                        <td colSpan={5} className="px-3 py-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                                placeholder="Description de l'article"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Qté</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                  className="block w-full border border-gray-300 rounded-md p-2 text-sm text-right"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Prix U.</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md pl-2 pr-6 py-2 text-right text-sm"
                                    required
                                  />
                                  <span className="absolute right-2 top-2 text-gray-500 text-xs">€</span>
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-500">Total</span>
                                <span className="text-sm font-medium mt-1">
                                  {formatCurrency(item.quantity * item.unitPrice)}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium flex items-center"
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Version desktop */}
                      <tr className="hidden sm:table-row">
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="block w-full border-0 p-0 focus:ring-0 text-sm"
                            placeholder="Description de l'article"
                            required
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="block w-16 text-right border-0 p-0 focus:ring-0 text-sm"
                            required
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-end">
                            <span className="text-gray-500 mr-1 text-sm">€</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                              className="block w-20 text-right border-0 p-0 focus:ring-0 text-sm"
                              required
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm text-gray-700 font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                            aria-label="Supprimer l'article"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
              placeholder="Notes ou conditions de paiement..."
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sous-total</span>
                <span className="text-sm font-medium">{formatCurrency(formData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">TVA (20%)</span>
                <span className="text-sm font-medium">{formatCurrency(formData.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remise</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-1">€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => {
                      const discount = Number(e.target.value);
                      setFormData({
                        ...formData,
                        discount,
                        total: formData.subtotal + formData.tax - discount
                      });
                    }}
                    className="w-24 text-right border-0 border-b border-gray-300 focus:ring-0 focus:border-blue-500 py-0 px-1 text-sm"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(formData.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
