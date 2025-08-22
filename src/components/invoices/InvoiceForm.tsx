import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { Invoice } from '../../types';
import { useEffect } from 'react';

interface InvoiceFormData extends Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> {
  // Ajoutez ici les propriétés spécifiques au formulaire si nécessaire
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return { bg: '#FEF9C3', text: '#92400E' }; // Jaune clair / marron
    case 'sent':
      return { bg: '#DBEAFE', text: '#1E40AF' }; // Bleu clair / bleu foncé
    case 'paid':
      return { bg: '#D1FAE5', text: '#065F46' }; // Vert clair / vert foncé
    case 'overdue':
      return { bg: '#FEE2E2', text: '#B91C1C' }; // Rouge clair / rouge foncé
    case 'cancelled':
      return { bg: '#F3F4F6', text: '#6B7280' }; // Gris clair / gris foncé
    default:
      return { bg: '#F3F4F6', text: '#111827' }; // Par défaut
  }
};

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
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
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
  
  // Update customer ID when order changes
  useEffect(() => {
    if (formData.orderId) {
      const selectedOrder = orders.find(order => order.id === formData.orderId);
      if (selectedOrder && selectedOrder.customerId !== formData.customerId) {
        setFormData(prev => ({
          ...prev,
          customerId: selectedOrder.customerId
        }));
      }
    }
  }, [formData.orderId, formData.customerId, orders]);


  const handleOrderSelect = (orderId: string) => {
    if (!orderId) {
      // Reset form if no order is selected
      setFormData(prev => ({
        ...prev,
        orderId: '',
        items: [{ id: `item_${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }],
        subtotal: 0,
        tax: 0,
        total: 0
      }));
      return;
    }

    const selectedOrder = orders.find(order => order.id === orderId);
    if (selectedOrder) {
      let invoiceItems: any[] = [];
      
      // Vérifier que la commande a bien des items ou services
      if (!selectedOrder.items?.length && !selectedOrder.services?.length) {
        alert('Cette commande ne contient aucun article ou service.');
        return;
      }
      
      // Utiliser les items de la commande s'ils existent
      if (selectedOrder.items && selectedOrder.items.length > 0) {
        invoiceItems = selectedOrder.items.map((item, index) => ({
          id: `item_${Date.now()}_${index}`,
          description: item.productName || 'Article sans nom',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          total: (item.quantity || 1) * (item.unitPrice || 0)
        }));
      } 
      // Sinon utiliser les services
      else if (selectedOrder.services && selectedOrder.services.length > 0) {
        invoiceItems = selectedOrder.services.map((service, index) => ({
          id: `item_${Date.now()}_${index}`,
          description: service.name || 'Service sans nom',
          quantity: service.quantity || 1,
          unitPrice: service.price || 0,
          total: (service.quantity || 1) * (service.price || 0)
        }));
      }

      const subtotal = invoiceItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const tax = subtotal * 0.2; // 20% TVA
      const total = subtotal + tax;

      setFormData(prev => ({
        ...prev,
        orderId,
        items: invoiceItems,
        customerId: selectedOrder.customerId,
        subtotal,
        tax,
        total,
        discount: 0,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }));
    }
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
                    Commande associée *
                  </label>
                  <select
                    id="orderId"
                    value={formData.orderId}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Sélectionner une commande</option>
                    {orders
                      .filter(order => !formData.customerId || order.customerId === formData.customerId)
                      .map((order) => {
                        const customer = customers.find(c => c.id === order.customerId);
                        return (
                          <option key={order.id} value={order.id}>
                            Commande #{order.id} - {customer?.name} - {formatCurrency(order.totalAmount)}
                          </option>
                        );
                      })}
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Statut *
              </label>
              <div className="relative">
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm appearance-none cursor-pointer"
                  style={{
                    backgroundColor: getStatusColor(formData.status).bg,
                    color: getStatusColor(formData.status).text,
                    fontWeight: 500,
                    paddingRight: '2.5rem',
                  }}
                  required
                >
                  <option value="draft" className="bg-white text-gray-900">Brouillon</option>
                  <option value="sent" className="bg-white text-gray-900">Envoyée</option>
                  <option value="paid" className="bg-white text-gray-900">Payée</option>
                  <option value="overdue" className="bg-white text-gray-900">En retard</option>
                  <option value="cancelled" className="bg-white text-gray-900">Annulée</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
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

        {formData.orderId && formData.items.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900">Articles de la commande</h3>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <React.Fragment key={index}>
                      {/* Version mobile */}
                      <tr className="sm:hidden border-b border-gray-200">
                        <td colSpan={4} className="px-3 py-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                              <div className="text-sm font-medium text-gray-900">{item.description}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <span className="text-xs font-medium text-gray-500">Quantité</span>
                                <div className="text-sm font-medium">{item.quantity}</div>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500">Prix unitaire</span>
                                <div className="text-sm font-medium">{formatCurrency(item.unitPrice)}</div>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500">Total</span>
                                <div className="text-sm font-medium">{formatCurrency(item.total)}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Version desktop */}
                      <tr className="hidden sm:table-row">
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}
        
        {!formData.orderId && (
          <div className="mb-8 text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Sélectionnez une commande pour voir les articles</p>
          </div>
        )}

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
